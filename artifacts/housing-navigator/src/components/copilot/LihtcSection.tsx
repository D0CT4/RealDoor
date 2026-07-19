import { useEffect, useState } from "react";
import { AlertTriangle, Building2, Loader2, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LihtcProperty {
  hud_id: string;
  project_name: string;
  project_address: string;
  project_city: string;
  project_state: string;
  project_zip: string;
  total_units: number | null;
  low_income_units: number | null;
  studio_units: number | null;
  one_bedroom_units: number | null;
  two_bedroom_units: number | null;
  three_bedroom_units: number | null;
  four_bedroom_units: number | null;
  year_placed_in_service: string;
  data_quality_flags: string;
  cbsa_name: string;
}

interface LihtcData {
  disclaimer: string;
  hmfa: string;
  count: number;
  properties: LihtcProperty[];
}

const CITY_COLORS: Record<string, string> = {
  BOSTON: "bg-blue-50 text-blue-700 border-blue-200",
  CAMBRIDGE: "bg-purple-50 text-purple-700 border-purple-200",
  SOMERVILLE: "bg-teal-50 text-teal-700 border-teal-200",
  CHELSEA: "bg-orange-50 text-orange-700 border-orange-200",
  EVERETT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  QUINCY: "bg-green-50 text-green-700 border-green-200",
  MALDEN: "bg-pink-50 text-pink-700 border-pink-200",
};

function unitSummary(p: LihtcProperty): string {
  const parts: string[] = [];
  if (p.studio_units) parts.push(`Studio×${p.studio_units}`);
  if (p.one_bedroom_units) parts.push(`1BR×${p.one_bedroom_units}`);
  if (p.two_bedroom_units) parts.push(`2BR×${p.two_bedroom_units}`);
  if (p.three_bedroom_units) parts.push(`3BR×${p.three_bedroom_units}`);
  if (p.four_bedroom_units) parts.push(`4BR×${p.four_bedroom_units}`);
  return parts.length ? parts.join(" · ") : "Unit mix unknown";
}

export default function LihtcSection() {
  const { t } = useLanguage();
  const [data, setData] = useState<LihtcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    fetch("/api/lihtc")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const cities = data
    ? Array.from(new Set(data.properties.map((p) => p.project_city))).sort()
    : [];

  const filtered = data
    ? cityFilter
      ? data.properties.filter((p) => p.project_city === cityFilter)
      : data.properties
    : [];

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground" aria-busy="true">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("Loading LIHTC properties…")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t("Failed to load LIHTC dataset.")}
      </div>
    );
  }

  return (
    <section aria-labelledby="lihtc-heading" className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-primary mb-1" id="lihtc-heading">
          {t("HUD LIHTC Properties")} — {t("Boston-Cambridge-Quincy HMFA")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {data?.count} {t("properties")} · {t("FY 2026 data · 60% AMI threshold applies")}
        </p>
      </div>

      {/* Disclaimer banner */}
      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 flex gap-2 text-xs text-amber-800">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>{data?.disclaimer}</span>
      </div>

      {/* City filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCityFilter("")}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !cityFilter
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {t("All cities")} ({data?.count})
        </button>
        {cities.map((city) => {
          const count = data!.properties.filter((p) => p.project_city === city).length;
          const colorClass = CITY_COLORS[city] ?? "bg-muted text-muted-foreground border-border";
          return (
            <button
              key={city}
              type="button"
              onClick={() => setCityFilter(city)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                cityFilter === city
                  ? colorClass + " font-semibold"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {city} ({count})
            </button>
          );
        })}
      </div>

      {/* Property cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const cityColor = CITY_COLORS[p.project_city] ?? "bg-muted text-muted-foreground border-border";
          const yearLabel =
            p.year_placed_in_service === "8888"
              ? "Year unknown"
              : `Placed in service: ${p.year_placed_in_service}`;
          return (
            <article
              key={p.hud_id}
              className="rounded-md border border-border bg-background p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Building2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <h3 className="flex-1 text-sm font-semibold text-foreground leading-tight">
                  {p.project_name}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${cityColor}`}>
                  {p.project_city}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span>{p.project_address}, {p.project_city}, {p.project_state} {p.project_zip}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="rounded bg-muted/40 px-2 py-1">
                  <span className="text-muted-foreground">{t("Total units")}: </span>
                  <span className="font-medium">{p.total_units ?? "—"}</span>
                </div>
                <div className="rounded bg-muted/40 px-2 py-1">
                  <span className="text-muted-foreground">{t("Low-income")}: </span>
                  <span className="font-medium">{p.low_income_units ?? "—"}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">{unitSummary(p)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{yearLabel}</p>

              {p.data_quality_flags && (
                <p className="mt-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                  ⚠ {p.data_quality_flags}
                </p>
              )}

              <p className="mt-2 text-[10px] text-muted-foreground italic">
                {t("HUD ID:")} {p.hud_id}
              </p>
            </article>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground">
        {t("Source: HUD LIHTC FeatureServer — retrieved 2026-07-18. Rule: HUD-DATA-001. Not a vacancy or rent feed.")}
      </p>
    </section>
  );
}
