---
title: 'Orimise API: Getting Started (English)'
summary: 'English quick start for the Orimise API: create an account, get an API key, call 20+ models through one OpenAI-compatible endpoint, pricing overview.'
space: ai-gateway
slug: orimise-api-getting-started-en
status: published
tags:
- ai-gateway
- getting-started
- english
review_by: '2027-04-04'
---

> Create an account, get an API key, and send your first request to Orimise AI Gateway.

Orimise AI Gateway provides multiple AI models through one API key. It supports OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, and Google Gemini formats. The model catalog and prices are maintained in the dashboard, so check the current catalog before choosing a model.

## Contents

1. [Create an account](#1-create-an-account)
2. [Verify your email](#2-verify-your-email)
3. [Create an API key](#3-create-an-api-key)
4. [Make your first API call](#4-make-your-first-api-call)
5. [Integrate an SDK](#5-integrate-an-sdk)
6. [Endpoints and URLs](#6-endpoints-and-urls)
7. [Balance, models, and pricing](#7-balance-models-and-pricing)
8. [Troubleshooting](#8-troubleshooting)

## 1. Create an account

Open the [Orimise AI Gateway sign-up page](https://aigateway.orimise.com/register). Enter your email and a password of at least 8 characters, confirm your password, then accept the Terms of Service and Privacy Policy.



If you already have an account, use the [sign-in page](https://aigateway.orimise.com/login).



## 2. Verify your email

After signing up, enter the OTP sent to your email. The code expires after 10 minutes. You can request a new code after 60 seconds. Check your spam or junk folder if the email does not arrive.

After verification, sign in to the dashboard at [aigateway.orimise.com](https://aigateway.orimise.com/).

## 3. Create an API key

1. After signing in, open [API Keys](https://aigateway.orimise.com/dashboard/keys).
2. Create a key and give it a name that identifies the application or environment.
3. Copy the key when it is created. Its full value is shown only once.

Keep the key on your server, for example in an `ORIMISE_API_KEY` environment variable. Do not commit it to source code or expose it in a browser. Revoke it immediately if it is compromised. The API Keys page also lets you set requests-per-minute, tokens-per-minute, daily spend, monthly spend, and total spend limits.

## 4. Make your first API call

First, list the models available to your key:

```bash
curl https://api.orimise.com/v1/models \
  -H "Authorization: Bearer YOUR_ORIMISE_API_KEY"
```

Choose an `id` from the response, then send a Chat Completions request:

```bash
curl https://api.orimise.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_ORIMISE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL_ID",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

Replace `YOUR_ORIMISE_API_KEY` and `YOUR_MODEL_ID` with your values. Do not rely on model names or prices hard-coded in articles or old screenshots; the dashboard has the current catalog.

## 5. Integrate an SDK

### Python: OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_ORIMISE_API_KEY",
    base_url="https://api.orimise.com/v1",
)

response = client.chat.completions.create(
    model="YOUR_MODEL_ID",
    messages=[{"role": "user", "content": "Hello!"}],
)

print(response.choices[0].message.content)
```

### Node.js: OpenAI SDK

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.ORIMISE_API_KEY,
  baseURL: "https://api.orimise.com/v1",
});

const response = await client.chat.completions.create({
  model: "YOUR_MODEL_ID",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);
```

### Anthropic Messages

```bash
curl https://api.orimise.com/v1/messages \
  -H "Authorization: Bearer YOUR_ORIMISE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL_ID",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Google Gemini

```bash
curl https://api.orimise.com/v1beta/models/YOUR_MODEL_ID:generateContent \
  -H "Authorization: Bearer YOUR_ORIMISE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Hello!"}]}]
  }'
```

Streaming is supported over SSE. For Chat Completions, add `"stream": true` to the JSON body and read the `data:` lines until `data: [DONE]`.

## 6. Endpoints and URLs

Gateway host: `https://api.orimise.com`. Use the endpoint for the request format you are using:

| Task | Method and endpoint |
|---|---|
| List models | `GET /v1/models` |
| OpenAI Chat Completions | `POST /v1/chat/completions` |
| OpenAI Responses | `POST /v1/responses` |
| Anthropic Messages | `POST /v1/messages` |
| Count tokens using Anthropic format | `POST /v1/messages/count_tokens` |
| List Gemini models | `GET /v1beta/models` |
| Generate Gemini content | `POST /v1beta/models/{model}:generateContent` |

Every request requires an `Authorization: Bearer YOUR_ORIMISE_API_KEY` header. Available models may vary by account. Check the dashboard or call `GET /v1/models` for current model IDs.

The dashboard's [Integration Guides](https://aigateway.orimise.com/dashboard/guides) generate setup instructions for Claude Code, Codex CLI, Gemini CLI, OpenCode, Grok Build, CC Switch, and OpenClaw. They include Bash, PowerShell, and Windows CMD options.



## 7. Balance, models, and pricing

- See current models, availability, and prices on the [Models](https://aigateway.orimise.com/dashboard/models) page.
- Check your balance, transaction history, top-up options, and coupon redemption on [Billing](https://aigateway.orimise.com/dashboard/billing). Available options depend on account configuration.
- Review requests and costs in the dashboard's usage pages.

Pricing depends on the model and usage. Do not use prices in articles or old screenshots for estimates; check the dashboard before deploying.



## 8. Troubleshooting

- **401 or authentication errors:** check the key and Bearer header, and make sure the key has not been revoked.
- **Model unavailable:** get the ID from `GET /v1/models` and check that the model is enabled in the dashboard.
- **Insufficient balance or a limit error:** check Billing and the limits configured for the API key.
- **OTP not received:** check your spam or junk folder. Codes expire after 10 minutes, and resend is available after a 60-second wait.
- **API errors:** keep the HTTP status and response body when contacting `support@orimise.com`. Remove API keys from logs before sharing them.

---

Reference pages: [Orimise AI Gateway](https://aigateway.orimise.com/), [Models and pricing](https://aigateway.orimise.com/dashboard/models), [Integration Guides](https://aigateway.orimise.com/dashboard/guides).
