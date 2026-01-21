# Draft: Backend Stack (Expo Frontend + expo-ai?)

## Requirements (unconfirmed)
- Have a polished frontend (likely Expo/React Native) and need to choose backend stack.
- Considering `EvanBacon/expo-ai` and wants honest recommendation.

## Technical Decisions (pending)
- Backend architecture: TBD (BaaS vs custom API vs Expo API routes).
- Data/auth/storage/jobs: TBD.
- AI integration approach: TBD (direct provider API vs helper framework).

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

## Open Questions
- What backend capabilities are needed (auth, database, realtime, file uploads, payments, background jobs, admin)?
- Expected scale and security requirements (consumer app vs internal tool).
- Preferred hosting/BaaS (Supabase/Firebase/Convex/custom).
- AI requirements (which providers, streaming, tool calls, image generation, on-device?).

## Scope Boundaries (tentative)
- INCLUDE: Evaluate `expo-ai` and propose a backend stack recommendation.
- EXCLUDE: Implementing backend in this planning session.
