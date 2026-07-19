---
name: Monorepo codegen & typecheck
description: Stale TS project-reference declarations cause phantom "no exported member" errors after swapping generated lib files.
---

**Rule:** After replacing or regenerating files in `lib/api-zod` or `lib/api-client-react` (e.g. copying pre-generated Orval output instead of running codegen), run `npx tsc --build lib/api-zod lib/api-client-react --force` before trusting `pnpm run typecheck`.

**Why:** The lib packages use `composite: true` + `emitDeclarationOnly` with `outDir: dist`. Consumers (housing-navigator, api-server) resolve types from the stale `dist/*.d.ts`, so typecheck reports "Module has no exported member X" even though the source exports it and everything works at runtime (Vite/esbuild bundle from source). Cost a debugging round to discover.

**How to apply:** Any time typecheck reports missing exports from `@workspace/api-zod` or `@workspace/api-client-react` that clearly exist in `src/generated/`, suspect stale declarations first — rebuild refs, don't edit imports.
