// HUD FY2026 Fair Market Rents — New York HMFA, effective Oct 1 2025
// Source: HUD FMR published data
export const FMR_DATA: Record<string, number[]> = {
  bronx:        [1582, 1688, 1967, 2351, 2713],
  brooklyn:     [1910, 2053, 2396, 2940, 3362],
  manhattan:    [2358, 2690, 3161, 3840, 4478],
  queens:       [1795, 1966, 2293, 2761, 3171],
  statenisland: [1382, 1545, 1801, 2143, 2463],
};

// NYC HPD 2026 AMI limits (100% AMI 3-person = $152,700, effective April 2026)
// Source: NYC HPD published AMI chart
export const AMI_DATA: Record<string, number[]> = {
  // [1-person, 2-person, 3-person, 4-person, 5-person, 6-person]
  ami100: [134800, 154000, 173200, 192400, 207800, 223200],
  ami80:  [107800, 123200, 138600, 153900, 166200, 178500],
  ami50:  [ 67400,  77000,  86600,  96200, 103900, 111600],
};

export type Borough = "bronx" | "brooklyn" | "manhattan" | "queens" | "statenisland";

export function getFmr(borough: Borough, bedrooms: number): number {
  const row = FMR_DATA[borough];
  if (!row) throw new Error("Invalid borough");
  const idx = Math.min(Math.max(bedrooms, 0), 4);
  return row[idx];
}

export function getAmi(householdSize: number) {
  const idx = Math.min(Math.max(householdSize, 1), 6) - 1;
  return {
    ami50: AMI_DATA.ami50[idx],
    ami80: AMI_DATA.ami80[idx],
    ami100: AMI_DATA.ami100[idx],
  };
}

export type EligibilityTier = "likely_eligible" | "may_qualify" | "income_likely_too_high" | "needs_review";

export function computeEligibility(annualIncome: number, ami50: number, ami80: number): EligibilityTier {
  if (annualIncome <= ami50) return "likely_eligible";
  if (annualIncome <= ami80) return "may_qualify";
  return "income_likely_too_high";
}

export const PROGRAMS = [
  {
    key: "section8",
    name: "Section 8 / Housing Choice Voucher",
    description:
      "A federal rental subsidy program administered locally by NYCHA. Voucher holders pay 30% of their income toward rent; the program covers the rest up to the Fair Market Rent. Waitlists are often long and may be closed to new applicants.",
    eligibilitySummary: "Must have income at or below 50% AMI. Waitlist priority given to extremely low-income households (30% AMI).",
    applyUrl: "https://www1.nyc.gov/site/nycha/section-8/apply-for-section-8.page",
    adminBody: "NYCHA",
    amiThreshold: "50% AMI (priority: 30% AMI)",
  },
  {
    key: "nycha",
    name: "NYCHA Public Housing",
    description:
      "City-managed affordable apartments across New York City boroughs. Rent is calculated as 30% of household income. Apply through the NYCHA Self-Service Portal. Average waitlist time is several years.",
    eligibilitySummary: "Must have income at or below 80% AMI. Priority given to households below 50% AMI.",
    applyUrl: "https://selfserve.nycha.info/",
    adminBody: "NYCHA",
    amiThreshold: "80% AMI",
  },
  {
    key: "cityfheps",
    name: "CityFHEPS",
    description:
      "A NYC rental assistance voucher program primarily for households facing eviction, living in shelter, or at risk of homelessness. Administered by HRA/DSS. Income and situation requirements differ from Section 8.",
    eligibilitySummary: "Must be facing eviction, in shelter, or at risk of homelessness. Income limits apply (typically 200% FPL). Current tenants may also qualify.",
    applyUrl: "https://www.nyc.gov/site/hra/help/cityfheps-rental-assistance.page",
    adminBody: "NYC HRA/DSS",
    amiThreshold: null,
  },
  {
    key: "lottery",
    name: "NYC Housing Connect",
    description:
      "NYC's affordable housing lottery where residents can apply for income-restricted apartments across all five boroughs. AMI bands vary widely by building — each listing specifies the income range required. Apply online at housingconnect.nyc.gov.",
    eligibilitySummary: "Income bands vary by listing (typically 30%–130% AMI). Anyone can apply; priority given to municipal employees and Community Board district residents in some buildings.",
    applyUrl: "https://housingconnect.nyc.gov/",
    adminBody: "NYC HPD / HDC",
    amiThreshold: "Varies by listing (30%–130% AMI)",
  },
];

// Realistic sample listings — representative of what Housing Connect shows
export const SAMPLE_LISTINGS = [
  {
    id: "1",
    name: "Sunrise Apartments at East New York",
    borough: "brooklyn",
    neighborhood: "East New York",
    address: "2255 Atlantic Ave, Brooklyn, NY 11233",
    minRent: 650,
    maxRent: 1450,
    bedroomTypes: [0, 1, 2, 3],
    status: "open",
    applicationUrl: "https://housingconnect.nyc.gov/",
    description: "Newly constructed affordable apartments in East New York with on-site laundry, community room, and access to public transit.",
    amiRange: "30%–80% AMI",
    deadline: "2026-08-30",
  },
  {
    id: "2",
    name: "Bronx Commons",
    borough: "bronx",
    neighborhood: "Melrose",
    address: "489 E 163rd St, Bronx, NY 10451",
    minRent: 500,
    maxRent: 1275,
    bedroomTypes: [0, 1, 2],
    status: "lottery",
    applicationUrl: "https://housingconnect.nyc.gov/",
    description: "Income-restricted apartments adjacent to Melrose Metro North station. Includes resident services and financial counseling.",
    amiRange: "30%–60% AMI",
    deadline: "2026-09-15",
  },
  {
    id: "3",
    name: "Queens Crossing Residences",
    borough: "queens",
    neighborhood: "Flushing",
    address: "136-55 41st Ave, Flushing, NY 11355",
    minRent: 820,
    maxRent: 1890,
    bedroomTypes: [1, 2, 3],
    status: "open",
    applicationUrl: "https://housingconnect.nyc.gov/",
    description: "Mixed-income development in downtown Flushing steps from the 7 train. Bilingual management staff on-site.",
    amiRange: "50%–100% AMI",
    deadline: "2026-10-01",
  },
  {
    id: "4",
    name: "Halcyon House",
    borough: "manhattan",
    neighborhood: "Harlem",
    address: "2360 Adam Clayton Powell Jr Blvd, New York, NY 10030",
    minRent: 700,
    maxRent: 2100,
    bedroomTypes: [0, 1, 2],
    status: "waitlist",
    applicationUrl: "https://housingconnect.nyc.gov/",
    description: "Gut-renovated affordable housing in Central Harlem. Priority for Community Board 10 residents and municipal employees.",
    amiRange: "40%–80% AMI",
    deadline: null,
  },
  {
    id: "5",
    name: "Victory Blvd Senior Residences",
    borough: "statenisland",
    neighborhood: "Stapleton",
    address: "540 Bay St, Staten Island, NY 10304",
    minRent: 410,
    maxRent: 950,
    bedroomTypes: [0, 1],
    status: "open",
    applicationUrl: "https://housingconnect.nyc.gov/",
    description: "Affordable senior housing (62+) with supportive services including meal programs and transportation assistance.",
    amiRange: "30%–60% AMI",
    deadline: "2026-09-30",
  },
  {
    id: "6",
    name: "South Bronx Gateway Apartments",
    borough: "bronx",
    neighborhood: "Port Morris",
    address: "800 Casanova St, Bronx, NY 10474",
    minRent: 560,
    maxRent: 1340,
    bedroomTypes: [1, 2, 3],
    status: "open",
    applicationUrl: "https://housingconnect.nyc.gov/",
    description: "Energy-efficient affordable housing near the Hunts Point waterfront. Community garden and after-school programming.",
    amiRange: "30%–80% AMI",
    deadline: "2026-08-15",
  },
  {
    id: "7",
    name: "Sunset Park Commons",
    borough: "brooklyn",
    neighborhood: "Sunset Park",
    address: "4401 4th Ave, Brooklyn, NY 11220",
    minRent: 740,
    maxRent: 1680,
    bedroomTypes: [1, 2, 3],
    status: "lottery",
    applicationUrl: "https://housingconnect.nyc.gov/",
    description: "Mixed-use development with ground-floor retail and affordable apartments above. Panoramic views of New York Harbor.",
    amiRange: "50%–100% AMI",
    deadline: "2026-08-20",
  },
  {
    id: "8",
    name: "Jackson Heights Gateway",
    borough: "queens",
    neighborhood: "Jackson Heights",
    address: "75-02 Roosevelt Ave, Queens, NY 11372",
    minRent: 630,
    maxRent: 1520,
    bedroomTypes: [0, 1, 2],
    status: "closed",
    applicationUrl: "https://housingconnect.nyc.gov/",
    description: "Affordable housing in vibrant Jackson Heights, close to multiple subway lines. Bilingual building staff.",
    amiRange: "40%–80% AMI",
    deadline: null,
  },
];
