import { Router, type IRouter } from "express";
import { LIHTC_BOSTON_SUBSET, LIHTC_DATASET_DISCLAIMER, LIHTC_SOURCE_CITATION } from "../lib/lihtcData.js";

const router: IRouter = Router();

// ── GET /api/lihtc ──────────────────────────────────────────
// Returns all 32 HUD LIHTC properties for the Boston-Cambridge-Quincy HMFA.
// IMPORTANT: This is a project inventory — NOT a vacancy, rent, or waitlist feed.
// Consumers MUST display the disclaimer alongside any property data.
router.get("/lihtc", (_req, res): void => {
  res.json({
    disclaimer: LIHTC_DATASET_DISCLAIMER,
    citation: LIHTC_SOURCE_CITATION,
    hmfa: "Boston-Cambridge-Quincy, MA-NH HMFA (CBSA 14460)",
    retrieved_utc: "2026-07-18T18:21:49Z",
    count: LIHTC_BOSTON_SUBSET.length,
    properties: LIHTC_BOSTON_SUBSET,
  });
});

// ── GET /api/lihtc/:hudId ───────────────────────────────────
router.get("/lihtc/:hudId", (req, res): void => {
  const prop = LIHTC_BOSTON_SUBSET.find(
    (p) => p.hud_id.toUpperCase() === (req.params.hudId ?? "").toUpperCase()
  );
  if (!prop) {
    res.status(404).json({ error: "Property not found in this dataset subset." });
    return;
  }
  res.json({
    disclaimer: LIHTC_DATASET_DISCLAIMER,
    citation: LIHTC_SOURCE_CITATION,
    property: prop,
  });
});

export default router;
