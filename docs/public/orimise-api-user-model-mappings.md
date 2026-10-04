---
title: User model mappings
summary: How a user maps model names to provider routes at /dashboard/mappings, the configuration API, precedence over admin mappings and what the user API never returns.
space: ai-gateway
slug: orimise-api-user-model-mappings
status: published
tags:
- ai-gateway
- model
- mapping
review_by: '2027-04-04'
---

Users configure their own mappings at `/dashboard/mappings`. Configuration is
separate from admin mappings, including admin mappings assigned to a particular
user. The user API never returns admin mapping rows or internal provider settings.

## Configuration API

Authenticated JWT endpoints:

- `GET /api/me/model-mappings`
- `POST /api/me/model-mappings`
- `PUT /api/me/model-mappings/:mappingId`
- `DELETE /api/me/model-mappings/:mappingId`

Create/update body:

```json
{
  "alias": "my-coding-model",
  "targets": ["gpt-5.5", "gemini-3.1-pro"],
  "api_key_ids": [],
  "is_enabled": true
}
```

An empty key list applies to all the owner's keys, including future keys. A
nonempty list applies only to the selected keys. Keys must belong to the user and
be active when saving. A revoked/deleted selected key never changes a mapping into
an all-keys mapping; remove unavailable keys explicitly when editing it.

Each user has one configuration per alias. Names may be custom; they need not
already exist in the model catalogue. Names cannot be empty or contain whitespace,
control characters, `?`, `#`, or backslashes. Targets must be distinct. No alias
count limit is added. Users cannot configure prices, ownership, or providers.

## Resolution and billing

Applicable user targets are tried in their configured order. A target's own user
mapping is resolved first; otherwise its existing admin mapping applies. Cycles
are skipped. An explicit self-target resolves through admin/direct routing instead
of recursing forever. After user targets are exhausted, the original alias's
configured admin mappings are tried. There is no implicit direct-model fallback
for an explicitly mapped alias with no admin mapping.

For the example `gpt-6-astra`, user targets `[gpt-5.5, gemini-3.1-pro]`, and admin
targets `[gpt-6-astra, gpt-5.6-sol]`:

| Successful branch | Public response / billing model | Price |
| --- | --- | --- |
| User target 1 | `gpt-5.5` | Public pricing for `gpt-5.5` |
| User target 2 | `gemini-3.1-pro` | Public pricing for `gemini-3.1-pro` |
| Admin level 1 | `gpt-6-astra` | First admin level |
| Admin level 2 | `gpt-6-astra` | First admin level |

An admin mapping on a user-selected target is hidden: the target's public name
remains the response/billing identity. All admin fallback levels share the first
admin level's price snapshot, including cache and minimum-request prices. Zero
mapping prices inherit from the first target's catalogue prices. If that target
is missing and input/output prices cannot be determined, that admin branch is
unavailable rather than silently becoming free.

Packages are selected again for each public billing model. Package provider
preferences cannot promote a later user target or an admin fallback. Wallet and
bonus debit events use the same public model. Retried attempts do not create usage
charges; only the successful response does. API-key spend reservations grow by
the difference between estimates instead of multiplying with each retry.

Network/server/429/upstream credential failures can move to the next route.
Ordinary upstream client errors stop retrying. Existing context checks,
transformations, timeouts, and partial-stream behavior remain in place. A stream
that has already forwarded output is neither retried nor charged on failure.
Mappings do not add new input capability filtering: unsupported inputs can still
be rejected by the selected upstream model.

Public protocol model fields and user log model fields are rewritten without
changing arbitrary user text, tool arguments, or JSON number values. Internal
provider metadata is omitted from user usage logs. Admin logs remain available
to administrators.

## Text API compatibility

Mapping applies to existing text generation routes: Chat Completions, Responses,
Anthropic Messages, Gemini generation, and unified chat.
Model catalogue endpoints expose applicable aliases without exposing routing rows.
This does not add image, video, or embedding generation support.

Responses streams retain lifecycle event names and finish on
`response.completed` / `response.incomplete`; they do not append a Chat Completions
`[DONE]` marker. Failure or abrupt EOF is not billed.

`GET /v1/responses/:responseId` requires the original owner's API key and retrieves
the real upstream response. Routing metadata stores only identity/provider/session
information, never prompts or credentials. `previous_response_id` pins requests
to that response's backend and session mode; it cannot fall back across providers.
If the backend is no longer available, resend the full conversation. Responses
created before route metadata was stored cannot be retrieved through this route.
Upstream response retention and `store: false` behavior still apply.

`background: true` and `conversation` currently return HTTP 400. Durable background
job billing and Conversations API routing are not implemented. Use synchronous or
streaming responses with `previous_response_id`, or send history in `input`.

Conventions consulted:

- https://developers.openai.com/api/docs/guides/streaming-responses
- https://developers.openai.com/api/docs/guides/conversation-state
- https://developers.openai.com/api/docs/guides/background

## Operations and verification

API startup applies migrations `033_user_model_mappings.sql`,
`034_response_routes.sql`, and `035_response_route_session.sql` in order.
Deploy the API and dashboard together. No deployment is performed by adding these
files. Existing feature flags can control the mappings page/API.

Automated coverage includes ordered fallback and exact prices, API-key/owner
isolation, nested routing and cycles, package deduction, public log sanitization,
streaming protocol identities, Responses ownership/failure handling, and real
PostgreSQL array/CRUD/migration roundtrips.

The PostgreSQL integration test is opt-in via `MAPPING_TEST_DATABASE_URL`; it
creates and removes a dedicated schema. Frontend verification uses lint,
TypeScript checking, and a production build. Browser visual verification was
blocked by the local browser environment.
