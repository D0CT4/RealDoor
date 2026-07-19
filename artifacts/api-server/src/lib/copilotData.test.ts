/**
 * Unit tests for inferDocStatus and DOCTYPE_TO_CHECKLIST_ID
 *
 * Covers: valid date, expired date, null date, unparseable date, no validityMonths,
 * and the DOCTYPE_TO_CHECKLIST_ID mapping (known vs. unknown keys).
 */

import { describe, it, expect } from "vitest";
import {
  inferDocStatus,
  DOCTYPE_TO_CHECKLIST_ID,
  SECTION8_CHECKLIST_2026,
  FROZEN_CHALLENGE_DATE,
} from "./copilotData.js";

// ── inferDocStatus ──────────────────────────────────────────────

describe("inferDocStatus", () => {
  const FROZEN = "2026-07-18"; // matches FROZEN_CHALLENGE_DATE

  it("returns 'present' for a date within the validity window", () => {
    // pay_stubs validity = 3 months → cutoff 2026-04-18; doc dated 2026-06-01 is within
    const result = inferDocStatus("2026-06-01", 3, FROZEN);
    expect(result).toBe("present");
  });

  it("returns 'expired' for a date outside the validity window", () => {
    // pay_stubs validity = 3 months → cutoff 2026-04-18; doc dated 2026-03-01 is before
    const result = inferDocStatus("2026-03-01", 3, FROZEN);
    expect(result).toBe("expired");
  });

  it("returns 'present' for a date exactly on the validity boundary", () => {
    // validity = 3 months, frozen = 2026-07-18 → cutoff = 2026-04-18
    // document date = 2026-04-18 (exactly on cutoff → present because docD >= cutoff)
    const result = inferDocStatus("2026-04-18", 3, FROZEN);
    expect(result).toBe("present");
  });

  it("returns 'missing' for null documentDate", () => {
    expect(inferDocStatus(null, 3, FROZEN)).toBe("missing");
  });

  it("returns 'missing' for undefined documentDate", () => {
    expect(inferDocStatus(undefined, 3, FROZEN)).toBe("missing");
  });

  it("returns 'missing' for empty string documentDate", () => {
    expect(inferDocStatus("", 3, FROZEN)).toBe("missing");
  });

  it("returns 'missing' for unparseable documentDate", () => {
    expect(inferDocStatus("not-a-date", 3, FROZEN)).toBe("missing");
  });

  it("returns 'missing' for a partial date that NaN-parses (e.g. 'June 2026')", () => {
    // new Date("June 2026") parses fine in some engines as NaN or a valid date —
    // test the documented behaviour: NaN → missing
    const d = new Date("June 2026");
    const expected = isNaN(d.getTime()) ? "missing" : "present";
    expect(inferDocStatus("June 2026", 3, FROZEN)).toBe(expected);
  });

  it("returns 'present' when validityMonths is null (no expiry constraint)", () => {
    // birth_certificate has no validityMonths
    expect(inferDocStatus("2010-01-01", null, FROZEN)).toBe("present");
  });

  it("returns 'present' when validityMonths is undefined (no expiry constraint)", () => {
    expect(inferDocStatus("2010-01-01", undefined, FROZEN)).toBe("present");
  });

  it("uses the FROZEN_CHALLENGE_DATE constant without special-casing", () => {
    // Sanity: cross-check with the exported constant itself
    expect(inferDocStatus("2026-06-01", 3, FROZEN_CHALLENGE_DATE)).toBe("present");
    expect(inferDocStatus("2026-01-01", 3, FROZEN_CHALLENGE_DATE)).toBe("expired");
  });

  it("handles 12-month validity correctly", () => {
    // validity = 12 months → cutoff = 2025-07-18
    expect(inferDocStatus("2025-07-18", 12, FROZEN)).toBe("present"); // exactly on cutoff
    expect(inferDocStatus("2025-07-17", 12, FROZEN)).toBe("expired"); // one day before cutoff
    expect(inferDocStatus("2025-08-01", 12, FROZEN)).toBe("present"); // after cutoff
  });

  it("handles 18-month validity (tax_return) correctly", () => {
    // validity = 18 months → cutoff = 2025-01-18
    expect(inferDocStatus("2025-01-18", 18, FROZEN)).toBe("present");
    expect(inferDocStatus("2025-01-01", 18, FROZEN)).toBe("expired");
  });
});

// ── DOCTYPE_TO_CHECKLIST_ID ─────────────────────────────────────
//
// The extraction prompt constrains documentType to exactly 8 values:
//   pay_stub | employment_letter | benefit_letter | application_summary
//   gig_statement | tax_form | bank_statement | other
//
// Only 6 of those map to checklist items; "other" and "application_summary"
// are intentional auto-detection gaps — the extractor cannot reliably link
// them to a specific checklist document.
// Types like photo_id / birth_certificate / social_security_card /
// immigration_document are NOT in the extractor's allowed output set, so
// they correctly have no entry in this map.

describe("DOCTYPE_TO_CHECKLIST_ID", () => {
  it("every mapped value points to a known checklist ID", () => {
    const knownChecklistIds = new Set(SECTION8_CHECKLIST_2026.map((i) => i.id));
    for (const [docType, checklistId] of Object.entries(DOCTYPE_TO_CHECKLIST_ID)) {
      expect(knownChecklistIds.has(checklistId),
        `documentType '${docType}' maps to '${checklistId}' which is not in SECTION8_CHECKLIST_2026`
      ).toBe(true);
    }
  });

  // ── Mapped extractor outputs ──────────────────────────────────
  it("maps pay_stub to income_pay_stubs", () => {
    expect(DOCTYPE_TO_CHECKLIST_ID["pay_stub"]).toBe("income_pay_stubs");
  });

  it("maps employment_letter to income_pay_stubs", () => {
    expect(DOCTYPE_TO_CHECKLIST_ID["employment_letter"]).toBe("income_pay_stubs");
  });

  it("maps gig_statement to income_pay_stubs", () => {
    expect(DOCTYPE_TO_CHECKLIST_ID["gig_statement"]).toBe("income_pay_stubs");
  });

  it("maps tax_form to tax_return", () => {
    expect(DOCTYPE_TO_CHECKLIST_ID["tax_form"]).toBe("tax_return");
  });

  it("maps bank_statement to bank_statements", () => {
    expect(DOCTYPE_TO_CHECKLIST_ID["bank_statement"]).toBe("bank_statements");
  });

  it("maps benefit_letter to benefit_letter", () => {
    expect(DOCTYPE_TO_CHECKLIST_ID["benefit_letter"]).toBe("benefit_letter");
  });

  // ── Auto-detection gaps (extractor CAN return these, but no checklist match) ──
  it("'other' is an intentional gap — no checklist item maps to it", () => {
    // The extractor returns "other" for any document it cannot classify.
    // Without a map entry the checklist item silently stays "missing".
    // This test guards that the gap stays intentional and visible.
    expect(DOCTYPE_TO_CHECKLIST_ID["other"]).toBeUndefined();
  });

  it("'application_summary' is an intentional gap — too ambiguous to auto-detect a specific checklist item", () => {
    expect(DOCTYPE_TO_CHECKLIST_ID["application_summary"]).toBeUndefined();
  });

  // ── Extractor-unreachable types (not in the extraction prompt's allowed set) ──
  it("returns undefined for types outside the extractor's allowed output set", () => {
    // These types can never appear in extractor output, confirming no stale dead-code entries exist:
    const nonExtractorTypes = [
      "photo_id",            // not an extractor output
      "birth_certificate",   // not an extractor output
      "social_security_card",// not an extractor output
      "immigration_document",// not an extractor output
      "unknown",
      "lease_agreement",
      "utility_bill",
      "",
    ];
    for (const t of nonExtractorTypes) {
      expect(DOCTYPE_TO_CHECKLIST_ID[t]).toBeUndefined();
    }
  });

  it("is case-sensitive (does not match uppercase variants)", () => {
    expect(DOCTYPE_TO_CHECKLIST_ID["PAY_STUB"]).toBeUndefined();
    expect(DOCTYPE_TO_CHECKLIST_ID["Tax_Form"]).toBeUndefined();
    expect(DOCTYPE_TO_CHECKLIST_ID["OTHER"]).toBeUndefined();
  });
});
