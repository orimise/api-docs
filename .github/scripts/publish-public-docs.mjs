#!/usr/bin/env node
/**
 * Publish a folder of ODF-1 Markdown files into Orimise Docs product spaces.
 *
 * Runs in the CI of whichever service owns the guides (chatbot, pos, ...).
 * No dependencies beyond Node 20+.
 *
 *   DOCS_PUBLISH_TOKEN=... node publish-public-docs.mjs --dir docs/public [options]
 *
 * Options
 *   --dir <path>        folder of *.md files (recursive)            required
 *   --base-url <url>    Docs origin, default https://docs.orimise.com
 *   --space <slug>      default `space` for files that omit it
 *   --note <text>       change note, default "CI publish <GITHUB_SHA>"
 *   --dry-run           print the plan, write nothing
 *
 * What it guarantees
 *   - `slug` comes from the frontmatter or, failing that, the file name.
 *     It is written back into the source so renames are impossible by accident.
 *   - `audience` is never set by this job. On create the line is removed, so
 *     the document lands as `internal`; on update the current value from the
 *     server is carried over. Making a guide public is an admin's decision,
 *     taken once on the document page; this job keeps it afterwards.
 *   - `status` may be omitted. A file under docs/public is published by
 *     definition, so a new document is created as `published`; an update
 *     keeps whatever status the server has, so an admin who archived a guide
 *     does not see it come back on the next push. Write `status: draft`
 *     explicitly to hold a guide back.
 *   - CRLF files are normalised to LF, so a Windows checkout and the
 *     server's canonical source compare equal and no spurious revision is
 *     created.
 *   - Only spaces of kind `product` are writable with this token. Anything
 *     else is refused by the server with 403.
 *   - An unchanged document is a no-op on the server (no new revision).
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTMATTER = /^﻿?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Read a scalar frontmatter field without a YAML parser. Good enough for slugs. */
export function readField(yaml, key) {
  const match = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(yaml);
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, "") || null;
}

/**
 * Rewrite the frontmatter block so the server receives the slug we resolved
 * and the audience it already has. Everything else is passed through byte
 * for byte, so a document in git stays diffable against what the portal
 * serves back.
 */
export function rewriteFrontmatter(source, { slug, space, audience, status }) {
  source = source.replace(/\r\n/g, "\n");
  const match = FRONTMATTER.exec(source);
  if (!match) throw new Error("Missing frontmatter block");

  const lines = match[1]
    .split("\n")
    .filter((line) => !/^(audience|slug):/.test(line));
  if (space && !lines.some((line) => /^space:/.test(line))) lines.push(`space: ${space}`);
  if (status && !lines.some((line) => /^status:/.test(line))) lines.push(`status: ${status}`);
  lines.push(`slug: ${slug}`);
  if (audience) lines.push(`audience: ${audience}`);

  return `---\n${lines.join("\n")}\n---\n${source.slice(match[0].length)}`;
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") yield path;
  }
}

function parseArgs(argv) {
  const options = { baseURL: "https://docs.orimise.com", dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) throw new Error(`${arg} needs a value`);
      return argv[++i];
    };
    if (arg === "--dir") options.dir = next();
    else if (arg === "--base-url") options.baseURL = next().replace(/\/+$/, "");
    else if (arg === "--space") options.space = next();
    else if (arg === "--note") options.note = next();
    else if (arg === "--dry-run") options.dryRun = true;
    else throw new Error(`Unknown option ${arg}`);
  }
  if (!options.dir) throw new Error("--dir is required");
  return options;
}

async function api(options, method, path, body) {
  const response = await fetch(`${options.baseURL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${options.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "error",
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 300) };
  }
  return { status: response.status, data };
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  options.token = process.env.DOCS_PUBLISH_TOKEN ?? "";
  if (!options.token && !options.dryRun) throw new Error("DOCS_PUBLISH_TOKEN is not set");
  options.note ??= `CI publish ${(process.env.GITHUB_SHA ?? "").slice(0, 12)}`.trim();

  const files = [];
  for await (const path of walk(options.dir)) files.push(path);
  files.sort();
  if (files.length === 0) throw new Error(`No .md files under ${options.dir}`);

  let failures = 0;
  const summary = { created: 0, updated: 0, unchanged: 0, failed: 0 };

  for (const path of files) {
    const name = relative(options.dir, path);
    const source = await readFile(path, "utf8");
    const match = FRONTMATTER.exec(source);
    if (!match) {
      console.error(`FAIL ${name}: missing frontmatter`);
      failures++;
      summary.failed++;
      continue;
    }

    const yaml = match[1];
    const slug = readField(yaml, "slug") ?? slugify(basename(path, extname(path)));
    const space = readField(yaml, "space") ?? options.space;
    if (!space) {
      console.error(`FAIL ${name}: no \`space\` in frontmatter and no --space given`);
      failures++;
      summary.failed++;
      continue;
    }

    if (options.dryRun) {
      console.log(`PLAN ${name} -> ${space}/${slug}`);
      continue;
    }

    const current = await api(options, "GET", `/api/documents/${encodeURIComponent(slug)}`);
    let result;
    if (current.status === 404) {
      result = await api(options, "POST", "/api/documents", {
        source: rewriteFrontmatter(source, { slug, space, audience: null, status: "published" }),
      });
      if (result.status === 201) {
        summary.created++;
        console.log(`CREATE ${name} -> ${space}/${slug} (audience: ${result.data.audience}; an admin must make it public)`);
        continue;
      }
    } else if (current.status === 200) {
      result = await api(options, "PUT", `/api/documents/${encodeURIComponent(slug)}`, {
        source: rewriteFrontmatter(source, {
          slug,
          space,
          audience: current.data.audience,
          status: current.data.status,
        }),
        changeNote: options.note,
      });
      if (result.status === 200 && result.data.unchanged) {
        summary.unchanged++;
        console.log(`SAME   ${name} -> ${space}/${slug} (rev ${result.data.revision})`);
        continue;
      }
      if (result.status === 200) {
        summary.updated++;
        console.log(`UPDATE ${name} -> ${space}/${slug} (rev ${result.data.revision}, audience: ${result.data.audience})`);
        continue;
      }
    } else {
      result = current;
    }

    failures++;
    summary.failed++;
    const errors = result.data?.errors?.map((e) => `${e.field}: ${e.message}`).join("; ") ?? JSON.stringify(result.data);
    console.error(`FAIL ${name} -> ${space}/${slug}: HTTP ${result.status} ${errors}`);
  }

  console.log(
    `\n${summary.created} created, ${summary.updated} updated, ${summary.unchanged} unchanged, ${summary.failed} failed`,
  );
  return failures === 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
    .then((ok) => process.exit(ok ? 0 : 1))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(2);
    });
}
