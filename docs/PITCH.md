# RealDoor — Pitch

Every year, hundreds of thousands of New Yorkers who qualify for housing assistance never receive it — not because the programs don't exist, but because the front door is confusing, English-only, and buried in paperwork. RealDoor is that missing front door: a bilingual (English/Spanish, with on-demand translation into 18 more languages) web app that takes a renter from "I can't afford my rent" to a review-ready assistance application.

RealDoor starts where renters start: with their actual situation. Enter income, rent, household size, and borough, and RealDoor instantly shows whether the rent is a burden, how it compares to Fair Market Rent, and which programs — Section 8, CityFHEPS, NYC Housing Connect lotteries, and more — the household is likely eligible for, with plain-language explanations and direct links to apply. A searchable guide and affordable-listings browser round out the discovery experience.

The heart of RealDoor is its application-readiness copilot. Renters upload income documents; the copilot extracts only a small allowlisted set of fields (never SSNs, addresses, or account numbers), asks the renter to confirm every value, answers rules questions from a frozen, citation-backed corpus, and assembles a scored, schema-conformant submission packet. Every number in the packet is computed deterministically from frozen FY 2026 HUD thresholds — the AI locates information; it never decides. The output is `READY_TO_REVIEW` or `NEEDS_REVIEW` with cited reasons, keeping humans in charge of every eligibility judgment.

Safety is designed in, not bolted on: prompt-injection guards, refusal patterns for decisioning and protected-trait questions, ephemeral in-memory sessions with explicit delete, and WCAG 2.2 AA-oriented accessibility.

RealDoor doesn't replace housing agencies or caseworkers — it makes their applicants prepared, their packets complete, and their doors reachable. One door, clearly marked, open in your language.
