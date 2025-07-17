![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/dekolor/next-rag-demo/playwright.yml)


# Next.js RAG Demo - [Live Preview](https://next-rag-demo.vercel.app/)

Tiny, public-only Retrieval-Augmented-Generation chat built with **Next.js 14 (App Router)**, **pgvector on Postgres (Neon)** and **DeepSeek via OpenRouter** for zero-cost completions.

* **Docs in → answers out.**  
  Ingest Markdown/MDX files, embed once, query in real-time with citations.
* **Streaming UI.**  
  shadcn/ui + Vercel AI SDK stream tokens as they arrive.
* **Session history without auth.**  
  Chats are stored in Postgres and keyed by a signed cookie; refresh and you’re still there.
* **CI/CD & smoke test.**  
  Playwright checks that asking “What is partial prerendering?” returns a cited answer; GitHub Actions runs lint → test → build on every push.

---

## 1 · Quick start (local)

```bash
git clone https://github.com/<you>/next-rag-demo.git
cd next-rag-demo
cp .env.example .env               # fill in the keys below
pnpm install
pnpm ingest                        # one-time: embed docs under public/docs
pnpm dev                           # http://localhost:3000
```

### Required env

```env
# embeddings (OpenAI)
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# chat completions (DeepSeek via OpenRouter)
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=deepseek-ai/deepseek-chat

# Postgres (Neon)
DATABASE_URL=postgresql://<user>:<pass>@<host>/<db>?sslmode=require

# cookie signing
COOKIE_SECRET=super-long-random-string
```

---

## 2 · Scripts

| command              | what it does                                      |
|----------------------|---------------------------------------------------|
| `pnpm dev`           | Next 14 + Turbopack, hot reload                   |
| `pnpm build && start`| production build / preview server                 |
| `pnpm ingest`        | parse → chunk → embed → upsert docs               |
| `pnpm lint`          | ESLint (zero warnings allowed)                    |
| `pnpm test`          | Playwright smoke test (build must be running)     |

---

## 3 · Deploy to Vercel

```bash
vercel link
vercel env add OPENAI_API_KEY ...
vercel env add OPENAI_EMBEDDING_MODEL text-embedding-3-small
vercel env add OPENROUTER_API_KEY ...
vercel env add OPENROUTER_BASE_URL https://openrouter.ai/api/v1
vercel env add OPENROUTER_MODEL deepseek-ai/deepseek-chat
vercel env add DATABASE_URL ...         # Neon connection string
vercel env add COOKIE_SECRET $(openssl rand -hex 32)
```

Push to **main** → GitHub Actions runs → Vercel deploys.

---

## 4 · Docs ingestion guide

Drop any `.md` or `.mdx` under **`public/docs/`** then run:

```bash
pnpm ingest      # embeddings ~0.02 $/1k tokens
```

The script:

1. Walks files → strips Markdown via `remark`.
2. Splits ~1 000 chars with 20 % overlap.
3. Batches 32 chunks per OpenAI embed call.
4. Upserts into table **`"Chunk"(id, content, embedding)`** and refreshes the `ivfflat` ANN index.

---

## 5 · Tech stack

| Layer         | Choice / link                                |
|---------------|----------------------------------------------|
| **Frontend**  | Next.js 14 App Router · shadcn/ui · Tailwind |
| **LLM**       | DeepSeek-Chat (`deepseek-ai/deepseek-chat`) via OpenRouter (OpenAI-compatible) |
| **Embeddings**| `text-embedding-3-small` (OpenAI)            |
| **DB**        | PostgreSQL (Neon free tier) + **pgvector**   |
| **ORM**       | Prisma                                       |
| **E2E test**  | Playwright                                   |
| **CI/CD**     | GitHub Actions → Vercel                      |

---

## 6 · Roadmap ideas

* Auth — tie sessions to a user ID.  
* File-upload ingestion (PDF → text → chunks).  
* Streaming SSE endpoint for easier external integrations.  
* Switch ANN index to **HNSW** for bigger corpora.

---

built with some help by LLMs