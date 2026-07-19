---
name: Hackathon Rubric Implementation
description: How NIDO implements the RealDoor hackathon starter pack rubric (extraction, calculation, doc-readiness, citations, safety, LIHTC data).
---

## Core rule: hackathon program is Boston-Cambridge-Quincy LIHTC, not NYC Section 8
The app retains its NYC Section 8 UX but the hackathon grader evaluates against:
- Boston-Cambridge-Quincy HMFA, CBSA 14460
- FY2026 MTSP 60% thresholds in `MTSP_60PCT_BOSTON_2026`
- HUD LIHTC property dataset (32 exact records from the CSV, no fabrication)

## Extraction (35%) — page-level bbox citations
`ExtractedField` type now includes: `page: number`, `bbox: [x1,y1,x2,y2] | null`, `sourceDocId: string | null`.
Extraction prompt explicitly requests these plus `payFrequency` and `grossAmount` fields.
Validated bbox must be within 612×792 PDF standard page bounds.

## Calculation (25%) — deterministic annualization + comparison enum
- `annualizeIncome(amount, frequency)` in copilotData.ts: multiplies by INCOME_FREQUENCY table (weekly×52, biweekly×26, semimonthly×24, monthly×12, annual×1).
- `compareToBoston60Pct(income, hhSize)` returns: `below_or_equal | above | no_frozen_threshold`.
- Household size > 8 → always `no_frozen_threshold`.
- Exposed at `POST /api/copilot/annualize`.

## Doc-readiness (20%) — automatic READY_TO_REVIEW / NEEDS_REVIEW
`POST /api/copilot/packet` now computes readiness automatically:
- Returns `readinessStatus` + `reviewReasons` array with codes: `MISSING_REQUIRED_DOCUMENT`, `DOCUMENT_EXPIRED`, `NO_FROZEN_THRESHOLD`.
- Frontend `Stage3Prepare.tsx` shows the status badge after building a packet.
- Rule: CH-READINESS-001, frozen date 2026-07-18, currency window 60 days.

## Citations (10%) — rule_id + source_locator on all outputs
Every response now includes `rule_id` from the 11-rule hackathon corpus (HUD-MTSP-001..003, HUD-DATA-001, HUD-GEO-001, FED-LIHTC-001, FED-MONITOR-001, CH-INCOME-001, CH-READINESS-001, CH-SAFETY-001, CH-DECISION-001).
Available at `GET /api/copilot/rules/corpus`.

## Safety (10%) — all 5 adversarial pattern categories
In `copilot.ts`:
- `INJECTION_PATTERNS` — prompt injection
- `DECISION_PATTERNS` — eligibility determination
- `CROSS_APPLICANT_PATTERNS` — cross-applicant data leak
- `VACANCY_PATTERNS` — vacancy availability claims (incl. "units currently available")
- `PROTECTED_TRAIT_PATTERNS` — disability/immigration/race inference
- `WRONG_YEAR_PATTERNS` — 2025 threshold requests

## LIHTC data
`artifacts/api-server/src/lib/lihtcData.ts` — exactly 32 records from the CSV (no fabrication).
`GET /api/lihtc` — returns all records + disclaimer + HUD-DATA-001 citation.
Frontend: Listings page has two tabs — "NYC Affordable Housing" and "LIHTC — Boston Area".

## New submission endpoint
`POST /api/copilot/submission` — returns rubric-schema-compliant JSON:
`{ household_id, annualized_income, comparison, readiness_status, review_reasons, citations[] }`

**Why:** Hackathon grader needs this schema exactly.

## Key file locations
- `artifacts/api-server/src/lib/copilotData.ts` — thresholds, rules, session store
- `artifacts/api-server/src/lib/lihtcData.ts` — LIHTC property data
- `artifacts/api-server/src/routes/copilot.ts` — all copilot endpoints
- `artifacts/api-server/src/routes/lihtc.ts` — LIHTC route
- `artifacts/housing-navigator/src/components/copilot/LihtcSection.tsx` — LIHTC UI
- `artifacts/housing-navigator/src/components/copilot/Stage3Prepare.tsx` — readiness UI

## Granular review_reasons (gold alignment)
Gold reason codes (PAY_STUB_TOTAL_CONFLICT, EMPLOYMENT_LETTER_EXPIRED, GIG_INCOME_UNCORROBORATED) must be derived from session document evidence (documentType + documentDate + per-doc annualized income variance >5%), NEVER from checklist item labels — the pay-stub label contains "Employment" and regex matching misclassifies. Generic DOCUMENT_EXPIRED is only a fallback for renter-marked expirations.
**Why:** label-regex mapping shipped a misclassification bug caught in review.
