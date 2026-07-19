---
name: pdf-parse v2 + session upsert
description: pdf-parse@2.4.5 has a class-based API (not a default function), and rag-extract session creation requires an explicit upsert pattern.
---

## pdf-parse@2.4.5 — Class-Based API

The installed pdf-parse (v2.x by mehmet-kozan) is NOT the classic v1 function-based package.

Wrong (v1 assumption):
  const pdfParse = require("pdf-parse");
  const { text } = await pdfParse(buf);

Correct (v2 class-based API):
  const { PDFParse, VerbosityLevel } = require("pdf-parse");
  const parser = new PDFParse({ data: buf, verbosity: VerbosityLevel.ERRORS });
  const result = await parser.getText();  // returns Promise<{ text: string }>
  return result.text ?? "";

**Why:** pdf-parse@2 exports a PDFParse class with data passed in constructor, getText() is async.
**How to apply:** Any code path doing PDF extraction via require("pdf-parse") must use this class API.

## Session Upsert in rag-extract

updateSession(id, data) silently returns null if the session ID was never registered via createSession.
This caused every confirm call to return 404 for new sessions.

Fix — always upsert:
  if (!getSession(sid)) {
    createSession(sid, { fields: filteredFields, consentLog: [] });
  } else {
    updateSession(sid, { fields: filteredFields });
  }

**Why:** sessionStore is an in-memory Map; updateSession only patches existing entries.

## ALLOWED_EXTRACT_FIELDS Must Match System Prompt

The allowlist filter in rag-extract uses ALLOWED_EXTRACT_FIELDS. If this list is missing fields
the system prompt tells GPT to extract (e.g. grossAmount, payFrequency), they are silently stripped.
Keep ALLOWED_EXTRACT_FIELDS in sync with the 7 fields listed in EXTRACT_SYSTEM_PROMPT.
