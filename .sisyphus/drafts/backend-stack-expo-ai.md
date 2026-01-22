# Draft: Backend Stack (Expo Frontend + expo-ai?)

## Requirements (unconfirmed)

- Have a polished frontend (likely Expo/React Native) and need to choose backend stack.
- Considering `EvanBacon/expo-ai` and wants honest recommendation.

## Requirements (confirmed)

- Beginning development phase; backend direction not brainstormed yet.
- Product direction: "ChatGPT/Grok/Gemini-like" chat app.
- Wants to host open-source models on servers you control (not just proxying closed APIs).
- Wants multimodal features over time: voice conversation + media generation.
- MVP preference: multi-model switcher.
- Wants a "world class" modern stack (mentions Runpod, Cloudflare Workers, AI SDK, etc.).
- Monetization (v1): credits / usage-based.
- No purchases in v1: invite-only beta with free credits granted; payments/IAP later.
- DB direction: user leaning Convex (re-evaluate stack accordingly).

## Working Vision (CORRECTED - user confirmed)

- Core value prop: **UNCENSORED + UNRESTRICTED**. Users choose this over ChatGPT/Grok because there are no content guardrails blocking what they can generate.
- Text: abliterated models (safety guardrails removed) and the latest/greatest open-source LLMs.
- Images: FLUX, Stable Diffusion, custom LoRAs, unrestricted workflows — the stuff you can't do on restricted platforms.
- Self-hosting isn't just about cost or control — it's the _only_ way to deliver uncensored capabilities.
- The app is a polished, mobile-first "AI hub" with ChatGPT/Grok-level UX, but running on models you operate with no content restrictions.
- Multi-model switcher gives users access to different abliterated/uncensored models.
- Curated workflows means you pick high-quality unrestricted styles/LoRAs, not that users build arbitrary graphs.
- Strong cost controls (credits, rate limits) because GPU is expensive — but content moderation is deliberately minimal/absent.
- Model catalog (v1): only self-hosted open-source models.
- Modalities (v1): text chat + image generation.
- Wants to emulate "big company" engineering patterns (e.g., Grok/Freepik/Higgsfield-style) but within a startup budget; prioritize modern, battle-tested techniques.
- Image generation UX direction: async jobs (recommended path).
- Image generation workflows: curated only (no user-supplied workflows/custom nodes).

## Repo Context (observed)

- Expo SDK: 55 canary; expo-router v7; React 19; RN 0.83; New Architecture enabled.
- No existing backend/API patterns; screens currently mock data; no auth/storage/analytics wired.
- This is a UI template baseline, so backend is effectively greenfield.

## Technical Decisions (pending)

- Backend architecture: TBD (BaaS vs custom API vs Expo API routes).
- Data/auth/storage/jobs: TBD.
- AI integration approach: TBD (direct provider API vs helper framework).

## Technical Decisions (confirmed)

- System-of-record: Supabase (Auth + Postgres + Storage).

## Candidate Stack (current recommendation)

- Auth/DB/Storage: Supabase
- Edge gateway + streaming: Cloudflare Workers (+ Durable Objects for rate limits/coordination)
- LLM abstraction/streaming helpers: Vercel AI SDK (OpenAI-compatible provider with custom `baseURL`)
- Inference hosting: vLLM on Runpod (serverless to start; migrate to K8s/vLLM production stack when scaling)
- Async jobs (later, required for media/voice): queue + workers (provider TBD)

## Supabase vs Convex (decision rationale)

- Supabase strengths for this product: Postgres for credits ledger + auditing, RLS for multi-tenant safety, Storage for generated images, SQL analytics/reporting, easy interoperability with Workers gateway.
- Convex strengths: realtime-first data model + excellent DX; good for chat/presence and reactive UIs.
- Why Supabase is favored here: credits/usage is fundamentally an accounting system (append-only events + reconciliation) that benefits from Postgres constraints/transactions/reporting; and image generation needs object storage + job tracking which fits Supabase well.
- If realtime UX becomes a top priority (presence/typing/multi-device sync), we can still:
  - use Supabase Realtime on Postgres changes, or
  - revisit Convex later (but avoid mixing systems-of-record early).

## Supabase vs Convex (deeper comparison notes)

- Realtime:
  - Convex: best-in-class reactive queries/subscriptions (DX and correctness).
  - Supabase: realtime is Postgres-change-based; great for "new message arrived" and simple subscriptions; presence/typing may need extra patterns.
- Data + portability:
  - Supabase: standard Postgres; easier to migrate/extend with SQL tools; hiring is easier.
  - Convex: proprietary DB + query model; strong DX, but higher lock-in.
- Credits ledger:
  - Supabase: natural fit (append-only usage events + constraints + reporting + reconciliation).
  - Convex: doable with transactions, but reporting/auditing workflows can be less familiar than SQL.
- Storage for generated images:
  - Supabase Storage: conventional object storage semantics + CDN patterns.
  - Convex Storage: workable, but long-term fit for heavy media workloads depends on product constraints.
- Edge gateway:
  - Either can work, but the Cloudflare Worker gateway pattern pairs especially well with Supabase JWT + Postgres.

## Technical Decisions (confirmed)

- Image generation engine: ComfyUI (curated workflows only), scaled via queued worker replicas.

## Research Findings (pending)

### expo-ai (EvanBacon/expo-ai)

- Not a general backend framework; it's a demo/reference app for AI chat + streaming and React Server Components (RSC) rendered to native UI.
- Uses Expo Router API routes + Vercel AI SDK + OpenAI; deployment via EAS Hosting.
- Explicitly experimental (RSC in developer preview, production not officially supported); requires patches and has deterministic module ID gotchas.
- Good for learning/prototyping; risky for production as the foundation can break with upstream changes.

### Backend pieces still needed even if using expo-ai

- Database, auth, storage, background jobs, rate limiting/abuse protection, monitoring.

### Likely production-ready alternatives

- Convex (realtime + functions) or Supabase (Postgres + auth + storage) + a small API layer for AI endpoints.
- Use Vercel AI SDK for streaming/tool-calls without the RSC complexity.

### OSS reference stacks (ChatGPT-like)

- Open WebUI: very feature-complete OSS chat UI; pairs naturally with Ollama and/or OpenAI-compatible endpoints; uses streaming.
- LibreChat: Node/Express backend + React; multi-provider proxying pattern.
- Common pattern: SSE streaming for chat; Postgres for persistence; Redis for caching/queues; vector DB optional (pgvector/chroma/qdrant).
- Model serving: vLLM (throughput) or Ollama (simplicity) or llama.cpp (CPU/edge/Apple Silicon); many support OpenAI-compatible APIs with streaming.
- Voice: Whisper-style STT is typically synchronous; image generation (Stable Diffusion/ComfyUI) usually async via job queue.

### Cloudflare Workers (SSE streaming + gateway)

- Workers can act as an SSE streaming proxy using `ReadableStream`/`TransformStream`; wall-clock streaming is viable as long as per-request CPU work is low.
- CPU budget: default ~30s CPU per request; can be increased up to ~5 minutes via config; wall-clock waiting on downstream does not count as CPU.
- Best fit: AI gateway layer (auth verification, rate limiting, logging, light routing) and streaming pass-through; not for running heavy inference.
- Durable Objects are the recommended primitive for per-user state (rate limiting windows, session coordination) and can support long-lived WebSockets if needed.

### Vercel AI SDK (non-Vercel / self-host)

- Works outside Vercel (Node servers and edge runtimes).
- Supports OpenAI-compatible backends via configurable `baseURL`, custom headers, and custom `fetch`.
- Supports streaming + tool calling; can return streaming responses with explicit chunking headers.

### Self-hosted inference: vLLM + Runpod

- vLLM is the 2026 default for production OSS LLM serving: OpenAI-compatible `/v1/chat/completions`, SSE streaming, tool calling.
- HuggingFace TGI is in maintenance mode (not recommended for new deployments).
- Runpod serverless has a first-class vLLM path (prebuilt worker image/template); good for early phase due to zero/low idle cost; cold starts exist.
- Security: vLLM supports API keys; recommended to also isolate networking so only your gateway can reach inference.

### Supabase + Edge Gateway pattern

- Use Supabase Auth + Postgres (with RLS) as system-of-record for users, conversations, messages, usage ledger.
- Put streaming endpoints in the gateway (Cloudflare Worker) so auth/quota/rate limits apply to every request.
- Avoid direct client -> inference; always proxy via gateway.
- Rate limiting best practice: Durable Objects per-user (or CF Rate Limiting API) before streaming begins.

### ComfyUI notes (privacy + scaling)

- ComfyUI is primarily a single-tenant UI/workflow runtime; it is not inherently a multi-tenant SaaS.
- Privacy is achievable by running ComfyUI behind your gateway (no public UI), treating it as an internal worker that only your job system can call.
- Scaling requires a queue + many ComfyUI worker instances (one per GPU or per model set) rather than one shared instance.
- Security: do not execute untrusted user-supplied workflows/custom nodes; use an allowlisted set of vetted workflows/nodes you operate.

## Open Questions

- What backend capabilities are needed (auth, database, realtime, file uploads, payments, background jobs, admin)?
- Expected scale and security requirements (consumer app vs internal tool).
- Preferred hosting/BaaS (Supabase/Firebase/Convex/custom).
- AI requirements (which providers, streaming, tool calls, image generation, on-device?).
- Potential conflict: user mentioned "Higgsfield/Freepik/Grok" + models like "Flux" and "Seedream"; some are proprietary/hosted services, not self-hostable OSS. Need to confirm whether v1 must be strictly self-hosted, or if hybrid provider routing is acceptable.

## Notes / Early Recommendations (non-binding)

- `expo-ai` is a great reference, but it does not solve "hosting models"; it's mostly about streaming AI responses and an experimental RSC-to-native UI approach.
- For your product, the hard part is operating:
  - LLM inference servers (GPUs, autoscaling, model loading, batching)
  - Async pipelines for image/video generation
  - Abuse protection + rate limiting + per-user quotas

## Big-Company Patterns to Emulate (Startup Version)

- Separation of concerns: edge gateway (auth/limits/logs) vs GPU inference (compute) vs persistence (DB/storage) vs async workers (media jobs).
- Standard API contracts: treat all model backends as "OpenAI-compatible" where possible to keep client + tooling simple.
- Multi-tenant safety: per-user quotas/credits + rate limits enforced before expensive compute starts.
- Observability-first: structured logs + request IDs + usage metering for every request; dashboards for latency/cost/error rate.
- Async for slow paths: image generation as a job with status/progress; store artifacts in object storage; never block mobile UX on long compute.
- Model registry: curated list of "supported" model IDs with metadata (context window, cost multipliers, max tokens, availability).

## Proposed High-Level Architecture (for discussion)

- Mobile app (Expo) talks only to an "AI Gateway" API (never directly to GPU endpoints).
- AI Gateway responsibilities: auth verification, model routing, prompt safety/limits, streaming proxy, logging, rate limiting, usage metering.
- Inference layer: OpenAI-compatible endpoints (vLLM recommended for throughput); hosted on Runpod or equivalent GPU provider.
- Persistence: Supabase Postgres for users, conversations, messages, model configs, usage ledger; Supabase Storage for generated media.
- Async jobs: required for image/video generation and heavy STT/TTS; job queue + workers (details TBD).

## Scope Boundaries (tentative)

- INCLUDE: Evaluate `expo-ai` and propose a backend stack recommendation.
- EXCLUDE: Implementing backend in this planning session.
