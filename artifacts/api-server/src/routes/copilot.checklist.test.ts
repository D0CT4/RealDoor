/**
 * Integration tests for GET /api/copilot/checklist
 *
 * Covers:
 *  - No sessionId → returns items with empty autoStatuses
 *  - Session with matched documentType → autoStatuses populated as "present"
 *  - Session with unmatched documentType ("other") → autoStatuses stays empty
 *  - Session with matched but expired documentDate → autoStatuses shows "expired"
 *  - Session with no documents (empty documents array) → autoStatuses empty
 *  - Session with two docs for the same checklist ID → highest status wins ("present" beats "expired")
 */

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import {
  createSession,
  deleteSession,
  FROZEN_CHALLENGE_DATE,
  type DocumentRecord,
  type ExtractedField,
} from "../lib/copilotData.js";

// ── Helpers ────────────────────────────────────────────────────

function makeField(key: string, value: string | null): ExtractedField {
  return {
    key,
    label: key,
    value,
    confidence: "high",
    page: 1,
    bbox: null,
    sourceDocId: null,
    sourceSnippet: null,
    confirmed: false,
  };
}

function makeDoc(
  name: string,
  documentType: string,
  documentDate: string | null
): DocumentRecord {
  return {
    id: name,
    name,
    sourceType: "pdf",
    fields: [
      makeField("documentType", documentType),
      ...(documentDate != null ? [makeField("documentDate", documentDate)] : []),
    ],
    processedAt: new Date().toISOString(),
  };
}

// Current date just inside 3-month validity window (pay_stubs → 3 months)
// FROZEN_CHALLENGE_DATE = "2026-07-18"; cutoff = 2026-04-18
const FRESH_DATE = "2026-05-01";  // within 3-month window → "present"
const STALE_DATE = "2026-01-01";  // before cutoff → "expired"

// ── Tests ───────────────────────────────────────────────────────

describe("GET /api/copilot/checklist", () => {
  let sid: string;

  beforeEach(() => {
    sid = `test-${Math.random().toString(36).slice(2)}`;
  });

  it("returns the full checklist items and an empty autoStatuses when no sessionId is provided", async () => {
    const res = await request(app).get("/api/copilot/checklist");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.autoStatuses).toEqual({});
    expect(res.body.autoSource).toEqual({});
  });

  it("returns empty autoStatuses for an unknown sessionId", async () => {
    const res = await request(app).get("/api/copilot/checklist?sessionId=does-not-exist");
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses).toEqual({});
  });

  it("returns 'present' when a matched documentType with a fresh date is in the session", async () => {
    createSession(sid, {
      fields: [],
      documents: [makeDoc("pay-stub.pdf", "pay_stub", FRESH_DATE)],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses["income_pay_stubs"]).toBe("present");
    expect(res.body.autoSource["income_pay_stubs"]?.documentName).toBe("pay-stub.pdf");
    expect(res.body.autoSource["income_pay_stubs"]?.documentType).toBe("pay_stub");
    expect(res.body.autoSource["income_pay_stubs"]?.documentDate).toBe(FRESH_DATE);

    deleteSession(sid);
  });

  it("returns 'expired' when a matched documentType has a stale date", async () => {
    createSession(sid, {
      fields: [],
      documents: [makeDoc("old-pay-stub.pdf", "pay_stub", STALE_DATE)],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses["income_pay_stubs"]).toBe("expired");

    deleteSession(sid);
  });

  it("leaves autoStatuses empty for an unrecognized documentType ('other')", async () => {
    // This is the key regression guard: "other" is not in DOCTYPE_TO_CHECKLIST_ID
    createSession(sid, {
      fields: [],
      documents: [makeDoc("mystery.pdf", "other", FRESH_DATE)],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    // No checklist item should be auto-detected
    expect(Object.keys(res.body.autoStatuses)).toHaveLength(0);

    deleteSession(sid);
  });

  it("leaves autoStatuses empty when documentType field is missing from the doc", async () => {
    const docWithoutType: DocumentRecord = {
      id: "no-type",
      name: "no-type.pdf",
      sourceType: "pdf",
      fields: [makeField("documentDate", FRESH_DATE)],
      processedAt: new Date().toISOString(),
    };
    createSession(sid, {
      fields: [],
      documents: [docWithoutType],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.autoStatuses)).toHaveLength(0);

    deleteSession(sid);
  });

  it("returns empty autoStatuses for a session with no documents", async () => {
    createSession(sid, {
      fields: [],
      documents: [],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses).toEqual({});

    deleteSession(sid);
  });

  it("detects 'present' for benefit_letter which has no expiry constraint (validityMonths=12 in checklist)", async () => {
    // benefit_letter has validityMonths=12; a date within 12 months of frozen date → present
    createSession(sid, {
      fields: [],
      documents: [makeDoc("award-letter.pdf", "benefit_letter", "2026-04-01")],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses["benefit_letter"]).toBe("present");

    deleteSession(sid);
  });

  it("records 'missing' in autoStatuses when documentDate is null and the type is matched", async () => {
    // pay_stub with null date → inferDocStatus returns "missing".
    // The endpoint writes it to autoStatuses (via the !current branch) so the caller
    // knows a pay_stub document was seen but lacks a usable date.
    createSession(sid, {
      fields: [],
      documents: [makeDoc("undated-stub.pdf", "pay_stub", null)],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses["income_pay_stubs"]).toBe("missing");

    deleteSession(sid);
  });

  it("prefers 'present' over 'expired' when two docs map to the same checklist item", async () => {
    createSession(sid, {
      fields: [],
      documents: [
        makeDoc("old-stub.pdf", "pay_stub", STALE_DATE),   // → expired
        makeDoc("new-stub.pdf", "pay_stub", FRESH_DATE),   // → present
      ],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses["income_pay_stubs"]).toBe("present");
    // autoSource should reflect the document that won
    expect(res.body.autoSource["income_pay_stubs"]?.documentName).toBe("new-stub.pdf");

    deleteSession(sid);
  });

  it("handles multiple different document types in one session", async () => {
    createSession(sid, {
      fields: [],
      documents: [
        makeDoc("pay-stub.pdf",       "pay_stub",      FRESH_DATE),
        makeDoc("tax-return.pdf",     "tax_form",      "2025-04-15"),
        makeDoc("bank-statements.pdf","bank_statement", FRESH_DATE),
      ],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses["income_pay_stubs"]).toBe("present");
    expect(res.body.autoStatuses["tax_return"]).toBe("present"); // 18-month validity, 2025-04-15 is fine
    expect(res.body.autoStatuses["bank_statements"]).toBe("present");

    deleteSession(sid);
  });

  // ── unmatchedDocuments ────────────────────────────────────────

  it("reports a document with an unmapped type (e.g. rental_history) in unmatchedDocuments", async () => {
    createSession(sid, {
      fields: [],
      documents: [makeDoc("rental-history.pdf", "rental_history", FRESH_DATE)],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.unmatchedDocuments).toEqual([
      { documentName: "rental-history.pdf", documentType: "rental_history" },
    ]);
    expect(res.body.autoStatuses).toEqual({});

    deleteSession(sid);
  });

  it("reports 'other' and 'application_summary' as unmatched (intentional mapping gaps)", async () => {
    createSession(sid, {
      fields: [],
      documents: [
        makeDoc("mystery.pdf", "other", FRESH_DATE),
        makeDoc("summary.pdf", "application_summary", FRESH_DATE),
      ],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.unmatchedDocuments).toEqual([
      { documentName: "mystery.pdf", documentType: "other" },
      { documentName: "summary.pdf", documentType: "application_summary" },
    ]);

    deleteSession(sid);
  });

  it("does not report mapped documentTypes in unmatchedDocuments", async () => {
    createSession(sid, {
      fields: [],
      documents: [
        makeDoc("pay-stub.pdf", "pay_stub", FRESH_DATE),
        makeDoc("tax-return.pdf", "tax_form", "2025-04-15"),
        makeDoc("award-letter.pdf", "benefit_letter", "2026-04-01"),
      ],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.unmatchedDocuments).toEqual([]);

    deleteSession(sid);
  });

  it("splits mixed sessions correctly: mapped docs go to autoStatuses, unmapped to unmatchedDocuments", async () => {
    createSession(sid, {
      fields: [],
      documents: [
        makeDoc("pay-stub.pdf", "pay_stub", FRESH_DATE),
        makeDoc("rental-history.pdf", "rental_history", FRESH_DATE),
      ],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.autoStatuses["income_pay_stubs"]).toBe("present");
    expect(res.body.unmatchedDocuments).toEqual([
      { documentName: "rental-history.pdf", documentType: "rental_history" },
    ]);

    deleteSession(sid);
  });

  it("does not report documents with no extracted documentType as unmatched", async () => {
    const docWithoutType: DocumentRecord = {
      id: "no-type",
      name: "no-type.pdf",
      sourceType: "pdf",
      fields: [makeField("documentDate", FRESH_DATE)],
      processedAt: new Date().toISOString(),
    };
    const docWithNullType: DocumentRecord = {
      id: "null-type",
      name: "null-type.pdf",
      sourceType: "pdf",
      fields: [makeField("documentType", null)],
      processedAt: new Date().toISOString(),
    };
    createSession(sid, {
      fields: [],
      documents: [docWithoutType, docWithNullType],
      consentLog: [],
    });

    const res = await request(app).get(`/api/copilot/checklist?sessionId=${sid}`);
    expect(res.status).toBe(200);
    expect(res.body.unmatchedDocuments).toEqual([]);
    expect(res.body.autoStatuses).toEqual({});

    deleteSession(sid);
  });

  it("returns an empty unmatchedDocuments array when no sessionId is provided", async () => {
    const res = await request(app).get("/api/copilot/checklist");
    expect(res.status).toBe(200);
    expect(res.body.unmatchedDocuments).toEqual([]);
  });

  it("includes frozenChallengeDate, currencyDays, and citations in the response", async () => {
    const res = await request(app).get("/api/copilot/checklist");
    expect(res.status).toBe(200);
    expect(res.body.frozenChallengeDate).toBe(FROZEN_CHALLENGE_DATE);
    expect(typeof res.body.currencyDays).toBe("number");
    expect(Array.isArray(res.body.citations)).toBe(true);
    expect(res.body.citations.length).toBeGreaterThan(0);
  });
});
