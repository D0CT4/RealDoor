---
name: Housing Navigator conventions
description: Non-obvious app invariants — native UI wrappers, API routing, no-DB rule, RealDoor compliance requirements.
---

**Native UI wrappers, not Radix:** `components/ui/` (select/badge/button/card/input/label) are the project's own native-HTML versions. Pages use `<Select>` with plain `<option>` children and `Badge variant="success|warning"`. Swapping in shadcn/Radix versions silently breaks dropdowns (options render as flat text lists).
**Why:** The app was migrated from another project built on these wrappers; the scaffold's Radix versions are incompatible with the pages' native-select usage.

**API routing:** The platform proxy passes `/api/*` through unchanged to the api-server, which mounts its Express router at `/api`. Root-relative `fetch("/api/...")` from the web app works; no Vite proxy exists or is needed.

**No database:** All housing data is hardcoded server-side; copilot sessions are in-memory (30-min TTL). api-server must not import `@workspace/db` — it throws at startup without `DATABASE_URL`.

**RealDoor compliance invariants (hackathon spec):** copilot must never decide/score/rank (refusal patterns in routes/copilot.ts), extraction limited to 5 allowlisted fields, prompt-injection guards on doc text and questions, consent log stores actions not raw doc text, sessions renter-deletable. Extract only reuses a client sessionId if it already exists (anti-fixation). Preserve these when editing copilot code.

**Open product tension:** Home page eligibility labels ("likely eligible" / "income likely too high") conflict with the spec's NO DECISIONING minimum bar per a review; user was asked whether to soften to neutral threshold language.
