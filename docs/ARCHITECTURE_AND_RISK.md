# RealDoor — Architecture & Risk Note

*Frozen challenge date: 2026-07-18 · Boston-Cambridge-Quincy, MA-NH HMFA · FY 2026 MTSP*

## What it does

RealDoor is a renter-side application-readiness copilot for Section 8 / HCV and LIHTC
applications. It extracts a small allowlisted set of fields from income documents,
checks a document checklist, compares annualized income against the frozen 60% MTSP
threshold, and produces a reviewable packet. It **never makes an eligibility decision**
— it returns `READY_TO_REVIEW` or `NEEDS_REVIEW` with cited reasons.

## Architecture

```
Browser (React + Vite)                 API Server (Express + TypeScript)
┌───────────────────────┐   /api/*    ┌─────────────────────────────────────┐
│ Apply tab             │────────────▶│ rag-extract   (multer, memory only) │
│  · upload / extract   │             │   ├─ pdf-parse / mammoth → text     │
│  · review + confirm   │             │   └─ OpenAI (allowlist prompt)      │
│ Understand tab        │             │ copilot: checklist · qa · submission│
│  · rules Q&A          │             │ lihtc: 32 frozen HUD properties     │
│  · income calculator  │             │ hud: live FMR/IL (supplemental)     │
└───────────────────────┘             └─────────────────────────────────────┘
                                       In-memory session store (no database)
```

**Deterministic core, generative edge.** The LLM is used only to locate 7 allowlisted
fields in document text. Every scored computation — annualization, threshold
comparison, readiness status — is deterministic TypeScript (mirrored in
`starter/src/calculate.py` with unit tests). All thresholds are frozen constants from
the FY 2026 HERA report (PDF p. 130), never model output.

**Citations end-to-end.** Every extracted field carries page + source bounding box;
every rule answer carries `rule_id`, authority tier, effective date, and source URL
from an 11-rule frozen corpus.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Model invents an eligibility decision | Decision-pattern refusal (CH-DECISION-001); readiness is computed, not generated |
| Prompt injection via document text | Injection patterns refused; extraction prompt allowlists 7 fields; raw text never stored |
| PII overcollection | No SSN/address/account fields extracted; multer memory storage; session delete endpoint |
| Protected-trait inference | Refusal patterns (CH-SAFETY-001); no such fields in the schema |
| Stale/wrong-year limits | Frozen FY 2026 constants; wrong-year questions get an explicit refusal citing effective dates |
| Vacancy misinformation | LIHTC data labeled "availability unknown" per HUD-DATA-001 |
| Expired evidence | 60-day currency convention (CH-CURRENCY-001) enforced against 2026-07-18 |
| Hallucinated extraction values | Confidence levels + source snippets shown; renter must confirm/edit every field before use |

## Known limits

- In-memory sessions: restart clears state (acceptable for the frozen simulation; a real deployment needs encrypted persistence + retention policy).
- bbox citations are page-level boxes when exact word geometry is unavailable.
- Live HUD API data is supplemental context only and clearly labeled; it is never used for scoring.
