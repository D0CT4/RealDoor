import { Router, type IRouter } from "express";
import {
  GetFmrQueryParams,
  GetFmrResponse,
  GetAmiQueryParams,
  GetAmiResponse,
  GetListingsQueryParams,
  GetListingsResponse,
  CheckEligibilityBody,
  CheckEligibilityResponse,
  GetProgramsResponse,
} from "@workspace/api-zod";
import {
  getFmr,
  getAmi,
  computeEligibility,
  PROGRAMS,
  SAMPLE_LISTINGS,
  type Borough,
} from "../lib/housingData";

const router: IRouter = Router();

// GET /fmr
router.get("/fmr", async (req, res): Promise<void> => {
  const parsed = GetFmrQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { borough, bedrooms } = parsed.data;
  const fmr = getFmr(borough as Borough, bedrooms);

  const result = GetFmrResponse.parse({
    borough,
    bedrooms,
    fmr,
    effectiveYear: 2026,
    source: "HUD FY2026 Fair Market Rents, New York NY HMFA, effective Oct 1 2025",
  });

  res.json(result);
});

// GET /ami
router.get("/ami", async (req, res): Promise<void> => {
  const parsed = GetAmiQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { borough, householdSize } = parsed.data;
  const { ami50, ami80, ami100 } = getAmi(householdSize);

  const result = GetAmiResponse.parse({
    borough,
    householdSize,
    ami50,
    ami80,
    ami100,
    effectiveYear: 2026,
    source: "NYC HPD 2026 AMI, effective April 2026",
  });

  res.json(result);
});

// GET /listings
router.get("/listings", async (req, res): Promise<void> => {
  const parsed = GetListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { borough, bedrooms, maxRent } = parsed.data;

  let listings = [...SAMPLE_LISTINGS];

  if (borough) {
    listings = listings.filter((l) => l.borough === borough);
  }

  if (bedrooms !== undefined && bedrooms !== null) {
    listings = listings.filter((l) => l.bedroomTypes.includes(bedrooms));
  }

  if (maxRent !== undefined && maxRent !== null) {
    listings = listings.filter((l) => l.minRent <= maxRent);
  }

  const result = GetListingsResponse.parse(listings);
  res.json(result);
});

// POST /eligibility
router.post("/eligibility", async (req, res): Promise<void> => {
  const parsed = CheckEligibilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { monthlyIncome, householdSize, monthlyRent, bedrooms, borough } = parsed.data;

  const annualIncome = monthlyIncome * 12;
  const annualRent = monthlyRent * 12;
  const burdenPercent = annualIncome > 0 ? (annualRent / annualIncome) * 100 : 0;

  let burdenStatus: "affordable" | "burdened" | "severely_burdened";
  if (burdenPercent < 30) {
    burdenStatus = "affordable";
  } else if (burdenPercent < 50) {
    burdenStatus = "burdened";
  } else {
    burdenStatus = "severely_burdened";
  }

  const fmr = getFmr(borough as Borough, bedrooms);
  const { ami50, ami80 } = getAmi(householdSize);

  const programs = PROGRAMS.map((prog) => {
    let eligibility: "likely_eligible" | "may_qualify" | "income_likely_too_high" | "needs_review";

    if (prog.key === "section8" || prog.key === "nycha") {
      eligibility = computeEligibility(annualIncome, ami50, ami80);
    } else if (prog.key === "cityfheps") {
      // CityFHEPS is situation-based; income check is less deterministic
      eligibility = "needs_review";
    } else {
      // NYC Housing Connect — lottery, variable AMI bands
      eligibility = "needs_review";
    }

    return {
      key: prog.key,
      name: prog.name,
      eligibility,
      description: prog.description,
      applyUrl: prog.applyUrl,
      notes: prog.eligibilitySummary,
    };
  });

  const result = CheckEligibilityResponse.parse({
    burdenPercent: Math.round(burdenPercent * 10) / 10,
    burdenStatus,
    fmr,
    ami50,
    ami80,
    programs,
  });

  res.json(result);
});

// GET /programs
router.get("/programs", async (_req, res): Promise<void> => {
  const result = GetProgramsResponse.parse(PROGRAMS);
  res.json(result);
});

export default router;
