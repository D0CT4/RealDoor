/**
 * HUD API client — fetches FMR and Income Limits for
 * Boston-Cambridge-Quincy, MA-NH HUD Metro FMR Area (METRO14460MM1120).
 *
 * Results are cached in-memory for CACHE_TTL_MS. If the HUD API is
 * unreachable the last successful response is served; if no response has
 * ever been cached the call throws so callers can fall back gracefully.
 */

const BOSTON_CBSA = "METRO14460MM1120";
const HUD_BASE    = "https://www.huduser.gov/hudapi/public";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Types ─────────────────────────────────────────────────────

export interface BostonFmr {
  efficiency:    number;
  oneBedroom:    number;
  twoBedroom:    number;
  threeBedroom:  number;
  fourBedroom:   number;
  year:          string;
  areaName:      string;
  fetchedAt:     string;
  source:        string;
}

export interface BostonIlRow {
  il30: number;
  il50: number;
  il60: number;   // MTSP = il50 × 1.2, capped at 120% of il50
  il80: number;
}

export interface BostonIl {
  areaName:      string;
  medianIncome:  number;
  year:          string;
  limits:        Record<number, BostonIlRow>; // keyed 1-8
  fetchedAt:     string;
  source:        string;
}

// ── Cache ─────────────────────────────────────────────────────

let fmrCache: { data: BostonFmr; expiresAt: number } | null = null;
let ilCache:  { data: BostonIl;  expiresAt: number } | null = null;

function token(): string {
  const t = process.env["HUD_API_TOKEN"];
  if (!t) throw new Error("HUD_API_TOKEN secret is not set.");
  return t;
}

async function hudGet(path: string): Promise<unknown> {
  const res = await fetch(`${HUD_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error(`HUD API ${path} → HTTP ${res.status}`);
  return res.json();
}

// ── FMR ───────────────────────────────────────────────────────

export async function getBostonFmr(): Promise<BostonFmr> {
  const now = Date.now();
  if (fmrCache && fmrCache.expiresAt > now) return fmrCache.data;

  const raw = await hudGet(`/fmr/data/${BOSTON_CBSA}`) as {
    data: {
      area_name: string;
      basicdata: {
        Efficiency: number;
        "One-Bedroom": number;
        "Two-Bedroom": number;
        "Three-Bedroom": number;
        "Four-Bedroom": number;
        year: string;
      };
    };
  };

  const d = raw.data;
  const result: BostonFmr = {
    efficiency:   d.basicdata.Efficiency,
    oneBedroom:   d.basicdata["One-Bedroom"],
    twoBedroom:   d.basicdata["Two-Bedroom"],
    threeBedroom: d.basicdata["Three-Bedroom"],
    fourBedroom:  d.basicdata["Four-Bedroom"],
    year:         d.basicdata.year,
    areaName:     d.area_name,
    fetchedAt:    new Date().toISOString(),
    source:       `HUD FY${d.basicdata.year} Fair Market Rents — ${d.area_name}`,
  };

  fmrCache = { data: result, expiresAt: now + CACHE_TTL_MS };
  return result;
}

/** Return the FMR for a given bedroom count (0=efficiency, 1-4). */
export async function getFmrForBedrooms(bedrooms: number): Promise<number> {
  const fmr = await getBostonFmr();
  const map: Record<number, number> = {
    0: fmr.efficiency,
    1: fmr.oneBedroom,
    2: fmr.twoBedroom,
    3: fmr.threeBedroom,
    4: fmr.fourBedroom,
  };
  return map[Math.min(Math.max(bedrooms, 0), 4)];
}

// ── Income Limits ─────────────────────────────────────────────

export async function getBostonIl(): Promise<BostonIl> {
  const now = Date.now();
  if (ilCache && ilCache.expiresAt > now) return ilCache.data;

  const raw = await hudGet(`/il/data/${BOSTON_CBSA}`) as {
    data: {
      area_name:     string;
      year:          string;
      median_income: number;
      very_low:      Record<string, number>; // il50_p1 … il50_p8
      extremely_low: Record<string, number>; // il30_p1 … il30_p8
      low:           Record<string, number>; // il80_p1 … il80_p8
    };
  };

  const d = raw.data;
  const limits: Record<number, BostonIlRow> = {};

  for (let p = 1; p <= 8; p++) {
    const il50 = d.very_low[`il50_p${p}`];
    limits[p] = {
      il30: d.extremely_low[`il30_p${p}`],
      il50,
      il60: Math.round(il50 * 1.2),   // MTSP 60% = 50% × 1.2
      il80: d.low[`il80_p${p}`],
    };
  }

  const result: BostonIl = {
    areaName:     d.area_name,
    medianIncome: d.median_income,
    year:         d.year,
    limits,
    fetchedAt:    new Date().toISOString(),
    source:       `HUD FY${d.year} Income Limits — ${d.area_name}`,
  };

  ilCache = { data: result, expiresAt: now + CACHE_TTL_MS };
  return result;
}

/** Return income limit row for a specific household size (1-8). */
export async function getIlForHousehold(householdSize: number): Promise<BostonIlRow & { areaName: string; year: string; source: string }> {
  const il = await getBostonIl();
  const row = il.limits[Math.min(Math.max(householdSize, 1), 8)];
  return { ...row, areaName: il.areaName, year: il.year, source: il.source };
}
