# GlobalStore AI

Multi-lingual WhatsApp support automation for international Shopify/dropshipping stores.

## What's in this zip

```
globalstore-ai/
├── prisma/                  # Database schema + pgvector migration
├── src/
│   ├── lib/                 # Prisma client, BullMQ queue, token encryption
│   ├── services/
│   │   ├── shopify/         # OAuth, API client, product sync (with embeddings)
│   │   ├── translation/     # DeepL + LLM localization fallback
│   │   ├── ai/               # Claude reply generation, embeddings, RAG retrieval
│   │   └── whatsapp/         # Send message, webhook signature verification
│   ├── routes/webhooks/      # Fastify webhook receivers (Shopify + WhatsApp)
│   ├── workers/               # BullMQ workers — the actual translate→AI→reply pipeline
│   └── server.ts              # Fastify app entrypoint
├── frontend/                  # Next.js dashboard (App Router)
│   └── app/dashboard/...      # Overview, Conversations, Stores, Settings pages
├── preview.html                # Static, no-build-step visual preview of the dashboard UI
├── .env.example
└── package.json
```

## Preview

Open `preview.html` directly in any browser — no install needed — to see a static
mockup of the dashboard UI (overview stats, live conversation list, and a sample
translated chat thread).

For the *real*, data-connected dashboard, run the Next.js app in `/frontend`.

## Getting it running

### 1. Backend

```bash
cd globalstore-ai
npm install
cp .env.example .env   # fill in your real keys
npx prisma migrate dev # applies schema.prisma + the pgvector migration
npm run dev             # starts the Fastify webhook server on :3001
```

In a second terminal, start the worker that actually processes messages:

```bash
npm run worker
```

You'll need:
- A **Postgres** instance with the `vector` extension available (Supabase and Neon both support this — enable it under Database → Extensions).
- A **Redis** instance for BullMQ (Upstash's free tier works for dev).
- A **Shopify Partner app** (for `SHOPIFY_API_KEY`/`SECRET`) and a dev store to test against.
- A **Meta Developer app** with WhatsApp Cloud API enabled (for `WHATSAPP_VERIFY_TOKEN`/`WHATSAPP_APP_SECRET`, plus a phone number ID + access token stored per-merchant).
- An **Anthropic API key** and an **OpenAI API key** (used only for embeddings — see note below) and a **DeepL API key**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev   # localhost:3000/dashboard
```

Point `NEXT_PUBLIC_BACKEND_URL` in the frontend's env at wherever the backend
from step 1 is running.

## Notes on what's stubbed vs. production-real

- The dashboard pages (`frontend/app/dashboard/**`) currently use hardcoded
  sample data in their `get*()` functions — swap those for real fetches to
  your backend once you add API routes for stats/conversations/messages.
- Embeddings use OpenAI's `text-embedding-3-small` since Anthropic doesn't
  offer a first-party embeddings endpoint — everything else (reply generation,
  localization) runs on Claude.
- Access tokens (Shopify, WhatsApp) are encrypted at rest with AES-256-GCM
  (`src/lib/crypto.ts`) — generate `TOKEN_ENCRYPTION_KEY` with
  `openssl rand -hex 32`.
- Both webhook routes verify the sender's signature (Shopify's HMAC header,
  Meta's `X-Hub-Signature-256`) before trusting the payload — don't remove
  this in production.

## Suggested build order

1. Get Shopify OAuth + product sync working end-to-end (no AI yet).
2. Wire the WhatsApp webhook → queue → static reply, confirm round-trip delivery.
3. Add DeepL translation layer.
4. Add RAG + Claude reply generation last — highest-risk piece, iterate here.
