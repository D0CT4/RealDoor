# Housing Navigator NYC

Bilingual (EN/ES) housing assistance tool for NYC renters: rent-burden calculator, assistance program guide, affordable listings, and the "RealDoor" Section 8 application-readiness copilot.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (binds `PORT`, routes under `/api`)
- `pnpm --filter @workspace/housing-navigator run dev` — web frontend (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from `lib/api-spec/openapi.yaml`
- Required secret: `OPENAI_API_KEY` — used by copilot extract + rules fallback (model `gpt-5.6-luna`)
- No database. All housing data (FMR/AMI/listings/programs) is hardcoded in `artifacts/api-server/src/lib/housingData.ts`; copilot sessions are in-memory with a 30-min TTL. `lib/db` exists but is unused; api-server must NOT depend on `@workspace/db` (throws without `DATABASE_URL`).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9 (project references, composite libs)
- API: Express 5 + OpenAI SDK; Frontend: React + Vite + wouter + Tailwind
- API codegen: Orval (React Query hooks in `lib/api-client-react`, Zod in `lib/api-zod`)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the HTTP contract
- `artifacts/api-server/src/routes/` — health, housing (FMR/AMI/listings/eligibility/programs), copilot (extract/confirm/rules/checklist/packet/feedback/session-delete)
- `artifacts/api-server/src/lib/copilotData.ts` — frozen 2026 Section 8 rules corpus, MTSP limits, checklist, session store
- `artifacts/housing-navigator/src/pages/` — Home, Programs, Listings, Copilot
- `artifacts/housing-navigator/src/components/copilot/` — Stage1Profile, Stage2Understand, Stage3Prepare
- `artifacts/housing-navigator/src/contexts/LanguageContext.tsx` — EN/ES translations

## Architecture decisions

- UI components in `components/ui/` are intentionally native HTML wrappers (select uses native `<select>`/`<option>`, badge has success/warning variants) — NOT Radix/shadcn versions. Pages depend on this; don't swap them back to Radix.
- Root-relative `fetch("/api/...")` works: the platform proxy passes `/api/*` through unchanged to the api-server, which mounts its router at `/api`.
- Copilot is designed around the RealDoor hackathon non-negotiables: NO decisioning (refusal patterns), 5-field extraction allowlist, prompt-injection guards, consent logging without raw doc text, ephemeral sessions (TTL + explicit delete), WCAG 2.2 AA-oriented markup.
- Copilot extract only reuses a client-supplied sessionId if it exists in the store; otherwise mints a fresh UUID (anti-fixation).

## Gotchas

- After replacing generated files in `lib/api-zod` or `lib/api-client-react`, run `npx tsc --build lib/api-zod lib/api-client-react --force` — stale `dist/` declarations cause phantom "no exported member" typecheck errors while runtime works fine.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
