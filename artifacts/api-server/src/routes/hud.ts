/**
 * /api/hud — live HUD FMR and Income Limits for Boston-Cambridge-Quincy HMFA.
 *
 * GET /api/hud/fmr                     → full FMR table for all bedroom counts
 * GET /api/hud/fmr?bedrooms=2          → FMR for a specific bedroom count (0-4)
 * GET /api/hud/il                      → full income limits table (all household sizes 1-8)
 * GET /api/hud/il?householdSize=3      → limits for a specific household size
 *
 * Data is cached 24 h; the source URL and effective date are included in
 * every response so the UI can cite them.
 */

import { Router, type IRouter } from "express";
import {
  getBostonFmr,
  getFmrForBedrooms,
  getBostonIl,
  getIlForHousehold,
} from "../lib/hudClient";

const router: IRouter = Router();

// ── GET /hud/fmr ─────────────────────────────────────────────
router.get("/hud/fmr", async (req, res): Promise<void> => {
  try {
    const { bedrooms } = req.query;

    if (bedrooms !== undefined) {
      const n = parseInt(String(bedrooms), 10);
      if (isNaN(n) || n < 0 || n > 4) {
        res.status(400).json({ error: "bedrooms must be an integer 0-4." });
        return;
      }
      const fmr = await getBostonFmr();
      const value = await getFmrForBedrooms(n);
      res.json({
        bedrooms: n,
        fmr: value,
        areaName: fmr.areaName,
        year: fmr.year,
        fetchedAt: fmr.fetchedAt,
        source: fmr.source,
      });
      return;
    }

    const fmr = await getBostonFmr();
    res.json(fmr);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "HUD FMR lookup failed.";
    res.status(502).json({ error: msg });
  }
});

// ── GET /hud/il ──────────────────────────────────────────────
router.get("/hud/il", async (req, res): Promise<void> => {
  try {
    const { householdSize } = req.query;

    if (householdSize !== undefined) {
      const n = parseInt(String(householdSize), 10);
      if (isNaN(n) || n < 1 || n > 8) {
        res.status(400).json({ error: "householdSize must be an integer 1-8." });
        return;
      }
      const row = await getIlForHousehold(n);
      res.json({ householdSize: n, ...row });
      return;
    }

    const il = await getBostonIl();
    res.json(il);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "HUD Income Limits lookup failed.";
    res.status(502).json({ error: msg });
  }
});

export default router;
