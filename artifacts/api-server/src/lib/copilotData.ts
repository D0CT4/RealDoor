// ============================================================
// RealDoor Application-Readiness Copilot — Data & Session Layer
// Program: Section 8 / Housing Choice Voucher (NYCHA, NYC)
// Rule Year: 2026 (frozen corpus)
// ============================================================

// HUD FY2026 MTSP Income Limits — New York, NY HUD Metro FMR Area
// Very Low Income (50% AMI) = Section 8 HCV eligibility ceiling
// Extremely Low Income (30% AMI) = Priority tier (75% of new vouchers)
// Source: https://www.huduser.gov/portal/datasets/il.html
// Effective Date: April 1, 2026
export const MTSP_VLI_2026: Record<number, number> = {
  1: 67400, 2: 77000, 3: 86600, 4: 96200,
  5: 103900, 6: 111600, 7: 120300, 8: 129000,
};
export const MTSP_ELI_2026: Record<number, number> = {
  1: 40450, 2: 46200, 3: 51950, 4: 57700,
  5: 62350, 6: 67000, 7: 71650, 8: 76250,
};

export const INCOME_LIMIT_CITATION = {
  authority: "HUD FY2026 Income Limits — NY-NJ HUD Metro FMR Area; 24 CFR §982.201(b)",
  effectiveDate: "April 1, 2026",
  url: "https://www.huduser.gov/portal/datasets/il.html",
};

// ── Rules Corpus ─────────────────────────────────────────────
export interface RuleCitation {
  authority: string;
  section?: string;
  effectiveDate: string;
  url: string;
}

export interface RuleEntry {
  key: string;
  title: string;
  ruleText: string;
  citation: RuleCitation;
  formula?: string;
  keywords: string[];
}

export const SECTION8_RULES_2026: RuleEntry[] = [
  {
    key: "income_limit",
    title: "Income Eligibility Threshold",
    ruleText:
      "To receive a Section 8 Housing Choice Voucher from NYCHA, a household's annual gross income must not exceed the Very Low Income (VLI) limit — 50% of Area Median Income (AMI) — for their household size. " +
      "Federal law requires that at least 75% of new vouchers issued each fiscal year go to Extremely Low Income (ELI) households (30% AMI or less). " +
      "Income includes wages, salaries, tips, net self-employment income, interest, dividends, Social Security, pension, and most public assistance. " +
      "No eligibility determination is made here — only the threshold is shown.",
    citation: {
      authority: "24 CFR §982.201(b); HUD FY2026 MTSP Income Limits, NY-NJ HUD Metro FMR Area",
      section: "24 CFR §982.201",
      effectiveDate: "April 1, 2026",
      url: "https://www.huduser.gov/portal/datasets/il.html",
    },
    formula: "Annual Gross Income ≤ 50% AMI (VLI limit) for household size",
    keywords: ["income", "qualify", "limit", "how much", "earn", "make", "50%", "ami", "eligible", "eligibility", "vli", "eli", "threshold", "cutoff"],
  },
  {
    key: "rent_share",
    title: "Tenant Rent Contribution (30% Rule)",
    ruleText:
      "Voucher holders pay the greater of: (a) 30% of monthly adjusted income, (b) 10% of monthly gross income, or (c) the welfare rent if applicable. " +
      "NYCHA pays the difference between the payment standard and the tenant's share, up to the approved contract rent. " +
      "A household may lease a unit above the payment standard but total tenant payment cannot exceed 40% of adjusted monthly income at initial occupancy (24 CFR §982.508(b)). " +
      "Adjusted income excludes certain allowances (dependent, childcare, disability, elderly).",
    citation: {
      authority: "24 CFR §982.305; 24 CFR §982.508; HUD HCV Guidebook (2023 ed.)",
      section: "24 CFR §982.508",
      effectiveDate: "January 1, 2026",
      url: "https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/about",
    },
    formula: "Tenant Share = max(30% adjusted monthly income, 10% gross monthly income); capped at 40% at initial lease",
    keywords: ["pay", "rent", "30%", "share", "contribution", "how much rent", "payment", "voucher amount", "how much do i pay", "tenant payment"],
  },
  {
    key: "household_composition",
    title: "Household Composition & Citizenship",
    ruleText:
      "At least one household member must be a U.S. citizen or eligible noncitizen (24 CFR §5.505). " +
      "If only some members have eligible status, the subsidy is prorated — ineligible members are excluded from the subsidy calculation. " +
      "All household members must be disclosed on the application. " +
      "Changes in household composition (births, departures, additions) must be reported to NYCHA within 30 days per the NYCHA Administrative Plan 2026. " +
      "Undisclosed household members may result in termination of assistance.",
    citation: {
      authority: "24 CFR §5.505; NYCHA Section 8 Administrative Plan 2026, Chapter 3",
      section: "24 CFR §5.505",
      effectiveDate: "January 1, 2026",
      url: "https://www1.nyc.gov/site/nycha/section-8/apply-for-section-8.page",
    },
    keywords: ["citizen", "citizenship", "immigration", "household", "member", "family", "who can", "composition", "eligible noncitizen", "green card", "undocumented"],
  },
  {
    key: "payment_standard",
    title: "Payment Standard & Fair Market Rent",
    ruleText:
      "NYCHA's payment standards are based on HUD-published Fair Market Rents (FMRs) for the New York NY HMFA, effective October 1, 2025. " +
      "Payment standards are set between 90% and 110% of the FMR (24 CFR §982.503). " +
      "NYCHA may request HUD approval for exception payment standards above 110% in high-cost submarket areas. " +
      "The payment standard is the maximum subsidy for a given unit size — it is not the maximum rent a renter may pay.",
    citation: {
      authority: "24 CFR §982.503; HUD FY2026 Fair Market Rents, New York NY HMFA",
      section: "24 CFR §982.503",
      effectiveDate: "October 1, 2025",
      url: "https://www.huduser.gov/portal/datasets/fmr.html",
    },
    formula: "Payment Standard = 90%–110% × FMR for bedroom size",
    keywords: ["payment standard", "fair market rent", "fmr", "how much voucher covers", "subsidy amount", "voucher value", "how much will program pay"],
  },
  {
    key: "hqs_inspection",
    title: "Housing Quality Standards (HQS) Inspection",
    ruleText:
      "Units assisted under Section 8 must meet HUD Housing Quality Standards (24 CFR §982.401) before a lease is signed. " +
      "NYCHA inspects units before move-in and at least annually thereafter. " +
      "If a unit fails inspection, the landlord must correct deficiencies within a specified timeframe; if uncorrected, contract rent is abated (suspended). " +
      "Tenants may not be required to pay for HQS deficiency repairs that are the landlord's responsibility. " +
      "Critical failures (no heat, no hot water, rodent infestation) trigger immediate abatement.",
    citation: {
      authority: "24 CFR §982.401; NYCHA HQS Inspection Guidelines 2026",
      section: "24 CFR §982.401",
      effectiveDate: "January 1, 2026",
      url: "https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/hqs",
    },
    keywords: ["inspection", "quality", "hqs", "condition", "repairs", "landlord", "pass", "fail", "habitability", "heat", "hot water", "apartment condition"],
  },
  {
    key: "portability",
    title: "Portability — Moving with Your Voucher",
    ruleText:
      "After the initial lease term (minimum 12 months), a voucher holder may port the voucher to any area of the United States where an HCV program operates (24 CFR §982.353). " +
      "The receiving Public Housing Authority (PHA) may absorb the voucher (take over billing) or bill NYCHA. " +
      "To port, the renter must notify NYCHA in writing before the lease expiration. " +
      "Portability timelines and procedures vary; contact NYCHA Section 8 at (718) 707-7771 to initiate.",
    citation: {
      authority: "24 CFR §982.353; HUD HCV Program Guidebook",
      section: "24 CFR §982.353",
      effectiveDate: "January 1, 2026",
      url: "https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/about",
    },
    keywords: ["move", "portability", "port", "another city", "another state", "relocate", "transfer", "different area", "can i move", "move out of nyc"],
  },
  {
    key: "waitlist",
    title: "Waitlist & Application Process",
    ruleText:
      "NYCHA's Section 8 waitlist is currently closed to new applicants (as of the frozen rule date). " +
      "When the waitlist opens, applications are accepted at nycha.info. " +
      "Applications are processed in order of: bedroom size need, date/time of application, and federal preference categories. " +
      "Federal preferences include: families living in substandard housing, paying more than 50% of income for rent, or involuntarily displaced. " +
      "Applicants must update their contact information annually to remain active on the list.",
    citation: {
      authority: "24 CFR §982.202; NYCHA Section 8 Administrative Plan 2026, Chapter 4",
      section: "24 CFR §982.202",
      effectiveDate: "January 1, 2026",
      url: "https://www1.nyc.gov/site/nycha/section-8/apply-for-section-8.page",
    },
    keywords: ["waitlist", "wait list", "apply", "application", "how long", "when", "open", "closed", "sign up", "register"],
  },
];

// ── Document Checklist ───────────────────────────────────────
export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  validityMonths?: number;
  examples: string[];
}

export const SECTION8_CHECKLIST_2026: ChecklistItem[] = [
  {
    id: "photo_id",
    label: "Government-Issued Photo ID",
    description: "Required for each adult household member (age 18+).",
    required: true,
    validityMonths: 60,
    examples: ["Driver's license", "State ID card", "U.S. passport"],
  },
  {
    id: "birth_certificate",
    label: "Birth Certificate or Proof of Age",
    description: "Required for all household members.",
    required: true,
    examples: ["Birth certificate", "U.S. passport", "Naturalization certificate"],
  },
  {
    id: "immigration_status",
    label: "Immigration / Citizenship Documents",
    description: "Required for all non-citizen household members.",
    required: true,
    validityMonths: 12,
    examples: ["Permanent Resident Card (I-551)", "EAD card", "I-94 Arrival/Departure Record"],
  },
  {
    id: "social_security",
    label: "Social Security Card",
    description: "Required for all household members who have one.",
    required: true,
    examples: ["Original Social Security card", "SSA printed letter confirming SSN"],
  },
  {
    id: "income_pay_stubs",
    label: "Proof of Employment Income — Pay Stubs",
    description: "Last 4 consecutive pay stubs for each employed household member.",
    required: true,
    validityMonths: 3,
    examples: ["Pay stubs (4 most recent)", "Employer letter on company letterhead"],
  },
  {
    id: "benefit_letter",
    label: "Proof of Benefit Income — Award Letters",
    description: "Current award letters for all government benefits received.",
    required: false,
    validityMonths: 12,
    examples: ["SSA award letter", "SSI/SSDI benefits letter", "Public assistance notice", "Unemployment benefits letter"],
  },
  {
    id: "tax_return",
    label: "Most Recent Federal Tax Return (IRS Form 1040)",
    description: "All pages required. Non-filers must provide a non-filer letter.",
    required: true,
    validityMonths: 18,
    examples: ["IRS Form 1040 (FY2025)", "IRS transcript", "IRS non-filer certification"],
  },
  {
    id: "bank_statements",
    label: "Bank / Credit Union Statements",
    description: "Last 3 months for all accounts held by household members.",
    required: true,
    validityMonths: 3,
    examples: ["Checking account statements", "Savings account statements", "Credit union account statements"],
  },
  {
    id: "rental_history",
    label: "Rental History / Landlord Reference",
    description: "Contact information for landlords from the past 2 years.",
    required: false,
    examples: ["Previous lease agreements", "Landlord reference letter", "Housing court documents (if applicable)"],
  },
];

// ── Session Store (in-memory, ephemeral) ──────────────────────
export interface ExtractedField {
  key: string;
  label: string;
  value: string | null;
  confidence: "high" | "medium" | "low";
  sourceSnippet: string | null;
  confirmed: boolean;
  editedValue?: string;
}

export interface ConsentEntry {
  action: string;
  timestamp: string;
  description: string;
}

export interface SessionData {
  sessionId: string;
  createdAt: string;
  confirmedAt?: string;
  fields: ExtractedField[];
  consentLog: ConsentEntry[];
}

const sessionStore = new Map<string, SessionData>();

// Sessions are ephemeral by design (privacy requirement): any session not
// touched within the TTL window is permanently swept from memory.
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const sessionTouchedAt = new Map<string, number>();

function sweepExpiredSessions(): void {
  const now = Date.now();
  for (const [id, touched] of sessionTouchedAt) {
    if (now - touched > SESSION_TTL_MS) {
      sessionStore.delete(id);
      sessionTouchedAt.delete(id);
    }
  }
}

export function getSession(id: string): SessionData | undefined {
  sweepExpiredSessions();
  const s = sessionStore.get(id);
  if (s) sessionTouchedAt.set(id, Date.now());
  return s;
}

export function createSession(id: string, data: Omit<SessionData, "sessionId" | "createdAt">): SessionData {
  sweepExpiredSessions();
  const session: SessionData = { sessionId: id, createdAt: new Date().toISOString(), ...data };
  sessionStore.set(id, session);
  sessionTouchedAt.set(id, Date.now());
  return session;
}

export function updateSession(id: string, updates: Partial<SessionData>): SessionData | null {
  const s = sessionStore.get(id);
  if (!s) return null;
  const updated = { ...s, ...updates };
  sessionStore.set(id, updated);
  sessionTouchedAt.set(id, Date.now());
  return updated;
}

export function deleteSession(id: string): boolean {
  sessionTouchedAt.delete(id);
  return sessionStore.delete(id);
}

export const ALLOWED_EXTRACT_FIELDS = [
  { key: "applicantName",  label: "Applicant Name" },
  { key: "monthlyIncome",  label: "Monthly Gross Income ($)" },
  { key: "incomeSource",   label: "Employer / Benefit Source" },
  { key: "documentDate",   label: "Document Date" },
  { key: "documentType",   label: "Document Type" },
];

// ── Feedback / Observability Log ─────────────────────────────
// Inspired by the Databricks Supply-Chain Agent observability pattern:
//   User Driven     → renter thumbs up/down on answers
//   AI Judge Gate   → abstain rate (injection blocks + decision refusals)
//   Corpus Gap Rate → non-deterministic LLM-fallback answers (rules not in frozen corpus)

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  sessionId: string | null;
  question: string;
  rating: "up" | "down";
  deterministic: boolean;
  abstained: boolean;
}

const feedbackLog: FeedbackEntry[] = [];

export function addFeedback(
  entry: Omit<FeedbackEntry, "id" | "timestamp">
): FeedbackEntry {
  const feedback: FeedbackEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  feedbackLog.push(feedback);
  return feedback;
}

export function getFeedbackStats() {
  const total = feedbackLog.length;
  const thumbsUp   = feedbackLog.filter((f) => f.rating === "up").length;
  const thumbsDown = feedbackLog.filter((f) => f.rating === "down").length;
  const abstainCount    = feedbackLog.filter((f) => f.abstained).length;
  const corpusGapCount  = feedbackLog.filter((f) => !f.deterministic && !f.abstained).length;
  const rated = thumbsUp + thumbsDown;
  return {
    totalQueries:    total,
    thumbsUp,
    thumbsDown,
    noRating:        total - rated,
    satisfactionRate: rated > 0 ? Math.round((thumbsUp / rated) * 100) : null,
    abstainCount,
    abstainRate:      total > 0 ? Math.round((abstainCount / total) * 100) : null,
    corpusGapCount,
    corpusGapRate:    total > 0 ? Math.round((corpusGapCount / total) * 100) : null,
    lastUpdated: new Date().toISOString(),
  };
}
