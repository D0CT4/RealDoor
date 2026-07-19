import { useEffect, useState } from "react";
import {
  AlertCircle, AlertTriangle, CheckCircle2, Download,
  FileDown, Loader2, Trash2, XCircle, ShieldCheck, ShieldAlert, Package,
  FileText, GitCompare, TrendingUp, User, Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Packet type (matches API response shape) ──────────────────
interface ProfileField { field: string; key: string; value: string | null; confidence: string; sourceSnippet?: string | null; sourceDocId?: string | null; }
interface DocField     { field: string; key: string; value: string | null; confidence: string; sourceSnippet?: string | null; page?: number | null; }
interface ExtractedDoc { documentName: string; sourceType: string; processedAt: string; fields: DocField[]; }
interface CrossRef {
  documentsProcessed: number;
  incomeConsistency: "consistent" | "inconsistent" | "single_source" | "no_income_data";
  incomeDiscrepancy: string | null;
  incomePerDocument: { documentName: string; annualizedIncome: number }[];
  nameConsistency: "consistent" | "inconsistent";
  applicantNamesFound: string[];
  documentDateStatus: { documentName: string; documentDate?: string; status: string }[];
  documentTypesCovered: { documentName: string; type: string }[];
}
interface ChecklistEntry { label: string; required: boolean; detectionSource?: "auto" | "manual"; }
interface PacketData {
  renterProfile: ProfileField[];
  incomeAssessment: { annualizedIncome: number | null; householdSize: number | null; comparison: string; frozen_60_percent_threshold: number | null };
  readinessAssessment: { status: string; reasons: string[] };
  documentChecklist: {
    presentDocuments: ChecklistEntry[];
    missingDocuments: ChecklistEntry[];
    expiredDocuments: (ChecklistEntry & { note: string })[];
  };
  extractedDocuments: ExtractedDoc[];
  crossReference: CrossRef;
}

// Auto-source info for a checklist item detected from Stage 1 extraction
interface AutoSourceEntry { documentName: string; documentType: string; documentDate: string | null; }

// ── Confidence pill ───────────────────────────────────────────
function ConfBadge({ c }: { c: string }) {
  const styles: Record<string, string> = {
    high:   "bg-green-50 border-green-200 text-green-700",
    medium: "bg-amber-50 border-amber-200 text-amber-700",
    low:    "bg-red-50 border-red-200 text-red-700",
  };
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${styles[c] ?? styles.low}`}>{c}</span>;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  validityMonths?: number;
  examples: string[];
}

type ItemStatus = "present" | "missing" | "expired";

interface Props {
  sessionId: string | null;
  onSessionDeleted: () => void;
}

const STATUS_META: Record<ItemStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  present: {
    icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
    label: "Present",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  },
  missing: {
    icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
    label: "Missing",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  expired: {
    icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
    label: "Expired",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
};

export default function Stage3Prepare({ sessionId, onSessionDeleted }: Props) {
  const { t } = useLanguage();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  // detectionSources: "auto" if pre-filled from Stage 1 extraction, "manual" if user toggled
  const [detectionSources, setDetectionSources] = useState<Record<string, "auto" | "manual">>({});
  // autoSource: which document triggered auto-detection for each checklist item
  const [autoSource, setAutoSource] = useState<Record<string, AutoSourceEntry>>({});
  const [householdSize, setHouseholdSize] = useState<string>("");
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewJson, setPreviewJson] = useState<string | null>(null);
  const [packetData, setPacketData] = useState<PacketData | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Record<number, boolean>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [readinessStatus, setReadinessStatus] = useState<"READY_TO_REVIEW" | "NEEDS_REVIEW" | null>(null);
  const [reviewReasons, setReviewReasons] = useState<string[]>([]);

  useEffect(() => {
    async function loadChecklist() {
      try {
        // Pass sessionId so the endpoint can infer auto-statuses from Stage 1 extraction
        const url = sessionId
          ? `/api/copilot/checklist?sessionId=${encodeURIComponent(sessionId)}`
          : "/api/copilot/checklist";
        const res = await fetch(url);
        const data = await res.json();
        setChecklist(data.items ?? []);

        // Start all items as "missing"
        const init: Record<string, ItemStatus> = {};
        (data.items ?? []).forEach((item: ChecklistItem) => { init[item.id] = "missing"; });

        // Merge auto-detected statuses from Stage 1 extraction
        const autoStatuses: Record<string, "present" | "expired" | "missing"> = data.autoStatuses ?? {};
        const autoSrc: Record<string, AutoSourceEntry> = data.autoSource ?? {};
        const initSources: Record<string, "auto" | "manual"> = {};

        for (const [id, status] of Object.entries(autoStatuses)) {
          if (status === "present" || status === "expired") {
            init[id] = status;
            initSources[id] = "auto";
          }
        }

        setStatuses(init);
        setDetectionSources(initSources);
        setAutoSource(autoSrc);
      } catch {
        setError(t("Failed to load document checklist."));
      } finally {
        setLoadingChecklist(false);
      }
    }
    loadChecklist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const missingRequired = checklist.filter((i) => i.required && statuses[i.id] !== "present");
  const expiredItems = checklist.filter((i) => statuses[i.id] === "expired");
  const allClear = missingRequired.length === 0 && expiredItems.length === 0;

  function setStatus(id: string, status: ItemStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    // Manual toggle always overrides auto-detection
    setDetectionSources((prev) => ({ ...prev, [id]: "manual" }));
    setPreviewJson(null);
    setPacketData(null);
  }

  async function generatePacket() {
    if (!sessionId) { setError(t("No active session — please complete Stage 1 first.")); return; }
    setIsGenerating(true);
    setError(null);
    setReadinessStatus(null);
    setReviewReasons([]);
    setPacketData(null);
    setExpandedDocs({});
    try {
      const hs = householdSize ? parseInt(householdSize, 10) : undefined;
      const res = await fetch("/api/copilot/packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemStatuses: statuses, householdSize: hs, detectionSources }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ? t(data.error) : t("Packet generation failed.")); return; }
      setPreviewJson(JSON.stringify(data.packet, null, 2));
      setPacketData(data.packet as PacketData);
      if (data.readinessStatus) setReadinessStatus(data.readinessStatus);
      if (Array.isArray(data.reviewReasons)) setReviewReasons(data.reviewReasons);
    } catch {
      setError(t("Network error — please try again."));
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadPacket() {
    if (!previewJson) return;
    const blob = new Blob([previewJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `realdoor-packet-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteSession() {
    if (!sessionId) { onSessionDeleted(); return; }
    setIsDeleting(true);
    setError(null);
    try {
      await fetch(`/api/copilot/session/${sessionId}`, { method: "DELETE" });
      sessionStorage.removeItem("copilot_session_id");
      onSessionDeleted();
    } catch {
      setError(t("Delete request failed — please try again."));
      setIsDeleting(false);
    }
  }

  if (loadingChecklist) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8" aria-busy="true">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {t("Loading document checklist…")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-primary mb-1" id="stage3-heading">
          {t("Stage 3 — Prepare: Document Checklist & Packet")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("Mark each required document as Present, Missing, or Expired. Then preview and download your application-readiness packet. Only you control what is downloaded — nothing is sent anywhere.")}
        </p>
      </div>

      {/* ── Auto-detection banner ── */}
      {(() => {
        const autoCount = Object.values(detectionSources).filter((s) => s === "auto").length;
        if (autoCount === 0) return null;
        return (
          <div role="status" aria-live="polite" className="rounded-md border border-primary/30 bg-primary/5 p-3 flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold text-primary">
                {autoCount === 1
                  ? t("{count} item pre-filled from your uploaded document", { count: autoCount })
                  : t("{count} items pre-filled from your uploaded documents", { count: autoCount })}
              </span>
              <span className="text-muted-foreground ml-1">
                — {t("review each and adjust if needed. You can always override.")}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Status summary */}
      {(missingRequired.length > 0 || expiredItems.length > 0) && (
        <div role="status" aria-live="polite" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 space-y-1">
          {missingRequired.length > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span><strong>{missingRequired.length > 1
                ? t("{count} required documents missing", { count: missingRequired.length })
                : t("{count} required document missing", { count: missingRequired.length })}</strong> — {t("obtain before applying.")}</span>
            </div>
          )}
          {expiredItems.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span><strong>{expiredItems.length > 1
                ? t("{count} documents expired", { count: expiredItems.length })
                : t("{count} document expired", { count: expiredItems.length })}</strong> — {t("obtain fresh copies.")}</span>
            </div>
          )}
        </div>
      )}

      {allClear && (
        <div role="status" aria-live="polite" className="rounded-md border border-green-200 bg-green-50 p-3 flex items-center gap-2 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span><strong>{t("All required documents marked as present.")}</strong> {t("You are ready to build your packet.")}</span>
        </div>
      )}

      {/* Checklist */}
      <section aria-label={t("Document checklist for Section 8 application")}>
        <h3 className="text-sm font-semibold text-foreground mb-3">{t("Required Documents — Section 8 HCV (NYCHA, 2026)")}</h3>
        <div className="space-y-2">
          {checklist.map((item) => {
            const status = statuses[item.id] ?? "missing";
            const meta = STATUS_META[status];
            const isAuto = detectionSources[item.id] === "auto";
            const src = autoSource[item.id];
            return (
              <div
                key={item.id}
                className={`rounded-md border p-3 ${meta.bg}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{t(item.label)}</span>
                      {item.required
                        ? <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">{t("Required")}</span>
                        : <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">{t("Optional")}</span>}
                      {item.validityMonths && (
                        <span className="text-xs text-muted-foreground">{t("Valid {months} months", { months: item.validityMonths })}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(item.description)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 italic">
                      {t("Examples:")} {item.examples.map((ex) => t(ex)).join(" · ")}
                    </p>
                    {/* Auto-detected / Manually-set badge */}
                    {isAuto && src ? (
                      <p className="text-[10px] mt-1 text-primary/80 font-medium flex items-center gap-1">
                        <span aria-hidden="true">✦</span>
                        {t("Auto-detected from")}{" "}
                        <span className="font-semibold">{src.documentName}</span>
                        {src.documentDate && (
                          <span className="text-muted-foreground font-normal">
                            {" "}({src.documentDate})
                          </span>
                        )}
                      </p>
                    ) : detectionSources[item.id] === "manual" && (status === "present" || status === "expired") ? (
                      <p className="text-[10px] mt-1 text-muted-foreground font-medium">
                        {t("Manually set")}
                      </p>
                    ) : null}
                  </div>

                  {/* Status controls */}
                  <fieldset className="flex gap-1 flex-shrink-0">
                    <legend className="sr-only">{t("Status of {label}", { label: item.label })}</legend>
                    {(["present", "missing", "expired"] as ItemStatus[]).map((s) => {
                      const sm = STATUS_META[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(item.id, s)}
                          aria-pressed={status === s}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                            status === s
                              ? `${sm.bg} ${sm.color} border-current font-semibold`
                              : "bg-background text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {sm.icon}
                          {t(sm.label)}
                        </button>
                      );
                    })}
                  </fieldset>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Packet actions */}
      <div className="rounded-md border border-border bg-muted/30 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">{t("Application-Readiness Packet")}</h3>
        <p className="text-xs text-muted-foreground">
          {t("The packet includes your confirmed profile fields, checklist summary, and consent log. It is a preparation aid only — not an application. It is never transmitted anywhere.")}
        </p>

        {/* Household size — needed to compare income against the MTSP threshold */}
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label htmlFor="hs-packet" className="block text-xs font-medium text-foreground mb-1">
              {t("Household Size")} <span className="text-muted-foreground font-normal">{t("(1–8, for income threshold comparison)")}</span>
            </label>
            <input
              id="hs-packet"
              type="number"
              min={1}
              max={8}
              value={householdSize}
              onChange={(e) => { setHouseholdSize(e.target.value); setPreviewJson(null); }}
              className="w-20 rounded border border-input bg-background px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-primary outline-none"
              aria-label={t("Household size for income limit comparison")}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generatePacket}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            aria-busy={isGenerating}
          >
            {isGenerating
              ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              : <FileDown className="h-4 w-4" aria-hidden="true" />}
            {isGenerating ? t("Building packet…") : t("Build Packet")}
          </button>

          {previewJson && (
            <button
              type="button"
              onClick={downloadPacket}
              className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:outline-none"
              aria-label={t("Download packet as a JSON file")}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {t("Download Packet (.json)")}
            </button>
          )}
        </div>

        {/* ── Automatic Readiness Status (CH-READINESS-001) ── */}
        {readinessStatus && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-md border p-3 flex items-start gap-3 ${
              readinessStatus === "READY_TO_REVIEW"
                ? "border-green-200 bg-green-50"
                : "border-amber-300 bg-amber-50"
            }`}
          >
            {readinessStatus === "READY_TO_REVIEW"
              ? <ShieldCheck className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
              : <ShieldAlert className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${readinessStatus === "READY_TO_REVIEW" ? "text-green-800" : "text-amber-800"}`}>
                {t(readinessStatus)}
              </p>
              {reviewReasons.length > 0 ? (
                <ul className="mt-1 space-y-0.5">
                  {reviewReasons.map((r) => (
                    <li key={r} className="text-xs text-amber-700 flex items-center gap-1">
                      <span aria-hidden="true">›</span> <code className="font-mono">{r}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-green-700 mt-0.5">{t("All checks passed. Packet is ready for human review.")}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1.5">{t("Rule: CH-READINESS-001 — no eligibility determination is made.")}</p>
            </div>
          </div>
        )}

        {/* ── Structured packet preview ─────────────────────── */}
        {packetData && (
          <div className="space-y-4" role="region" aria-label={t("Packet contents")}>
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">{t("Packet Contents")}</h4>
            </div>

            {/* ── Confirmed profile ── */}
            {packetData.renterProfile?.length > 0 && (
              <div className="rounded-md border border-border bg-background overflow-hidden">
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 border-b border-border">
                  <User className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span className="text-xs font-semibold text-foreground">{t("Confirmed Profile")}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{t("renter-confirmed")}</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="px-3 py-1.5 font-medium">{t("Field")}</th>
                      <th className="px-3 py-1.5 font-medium">{t("Value")}</th>
                      <th className="px-3 py-1.5 font-medium">{t("Conf.")}</th>
                      <th className="px-3 py-1.5 font-medium hidden sm:table-cell">{t("Evidence")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packetData.renterProfile.map((f) => (
                      <tr key={f.key} className="border-b border-border last:border-0">
                        <td className="px-3 py-1.5 font-medium text-foreground whitespace-nowrap">{f.field}</td>
                        <td className="px-3 py-1.5 font-mono text-foreground">
                          {f.value || <em className="text-muted-foreground not-italic">{t("—")}</em>}
                        </td>
                        <td className="px-3 py-1.5"><ConfBadge c={f.confidence} /></td>
                        <td className="px-3 py-1.5 text-muted-foreground italic hidden sm:table-cell max-w-xs truncate">
                          {f.sourceSnippet ? `"${f.sourceSnippet}"` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Income assessment ── */}
            {packetData.incomeAssessment && (
              <div className="rounded-md border border-border bg-background overflow-hidden">
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 border-b border-border">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span className="text-xs font-semibold text-foreground">{t("Income Assessment")}</span>
                </div>
                <div className="px-3 py-2.5 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-muted-foreground">{t("Annualized income")}</span>
                    <p className="font-mono font-semibold text-foreground mt-0.5">
                      {packetData.incomeAssessment.annualizedIncome != null
                        ? `${packetData.incomeAssessment.annualizedIncome.toLocaleString()}`
                        : <em className="font-normal text-muted-foreground">{t("Not computed — no income data")}</em>}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("60% MTSP threshold")}</span>
                    <p className="font-mono font-semibold text-foreground mt-0.5">
                      {packetData.incomeAssessment.frozen_60_percent_threshold != null
                        ? `${packetData.incomeAssessment.frozen_60_percent_threshold.toLocaleString()}`
                        : <em className="font-normal text-muted-foreground">{t("—")}</em>}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("Comparison")}</span>
                    <p className={`font-semibold mt-0.5 ${packetData.incomeAssessment.comparison === "below_or_equal" ? "text-green-700" : packetData.incomeAssessment.comparison === "above" ? "text-red-700" : "text-amber-700"}`}>
                      {packetData.incomeAssessment.comparison}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("Household size")}</span>
                    <p className="font-mono font-semibold text-foreground mt-0.5">
                      {packetData.incomeAssessment.householdSize ?? <em className="font-normal text-muted-foreground">{t("—")}</em>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Cross-reference ── */}
            {packetData.crossReference && (
              <div className="rounded-md border border-border bg-background overflow-hidden">
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 border-b border-border">
                  <GitCompare className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span className="text-xs font-semibold text-foreground">{t("Cross-Reference")}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {packetData.crossReference.documentsProcessed} {t("doc(s) analyzed")}
                  </span>
                </div>
                <div className="divide-y divide-border text-xs">
                  {/* Income consistency */}
                  <div className="px-3 py-2 flex items-start gap-3">
                    <span className="text-muted-foreground w-32 shrink-0">{t("Income")}</span>
                    <div className="flex-1">
                      <span className={`font-semibold ${
                        packetData.crossReference.incomeConsistency === "consistent" ? "text-green-700"
                        : packetData.crossReference.incomeConsistency === "inconsistent" ? "text-red-700"
                        : "text-amber-700"
                      }`}>
                        {packetData.crossReference.incomeConsistency.replace(/_/g, " ")}
                      </span>
                      {packetData.crossReference.incomeDiscrepancy && (
                        <span className="ml-2 text-red-600">— {packetData.crossReference.incomeDiscrepancy}</span>
                      )}
                      {packetData.crossReference.incomePerDocument.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {packetData.crossReference.incomePerDocument.map((d, i) => (
                            <li key={i} className="text-muted-foreground">
                              <span className="font-medium text-foreground">{d.documentName}</span>: ${d.annualizedIncome.toLocaleString()}/yr
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  {/* Name consistency */}
                  <div className="px-3 py-2 flex items-start gap-3">
                    <span className="text-muted-foreground w-32 shrink-0">{t("Applicant name")}</span>
                    <div className="flex-1">
                      <span className={`font-semibold ${packetData.crossReference.nameConsistency === "consistent" ? "text-green-700" : "text-red-700"}`}>
                        {packetData.crossReference.nameConsistency}
                      </span>
                      {packetData.crossReference.applicantNamesFound.length > 0 && (
                        <span className="ml-2 text-foreground">{packetData.crossReference.applicantNamesFound.join(" / ")}</span>
                      )}
                    </div>
                  </div>
                  {/* Date recency */}
                  {packetData.crossReference.documentDateStatus.length > 0 && (
                    <div className="px-3 py-2 flex items-start gap-3">
                      <span className="text-muted-foreground w-32 shrink-0">{t("Date recency")}</span>
                      <ul className="flex-1 space-y-0.5">
                        {packetData.crossReference.documentDateStatus.map((d, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className={`font-semibold ${d.status === "current" ? "text-green-700" : d.status === "stale" ? "text-red-700" : "text-amber-700"}`}>
                              {d.status}
                            </span>
                            <span className="text-muted-foreground">{d.documentName}{d.documentDate ? ` (${d.documentDate})` : ""}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Doc types */}
                  {packetData.crossReference.documentTypesCovered.length > 0 && (
                    <div className="px-3 py-2 flex items-start gap-3">
                      <span className="text-muted-foreground w-32 shrink-0">{t("Types found")}</span>
                      <div className="flex flex-wrap gap-1">
                        {packetData.crossReference.documentTypesCovered.map((d, i) => (
                          <span key={i} className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                            {d.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Extracted documents (per-file RAG data) ── */}
            {packetData.extractedDocuments?.length > 0 && (
              <div className="rounded-md border border-border bg-background overflow-hidden">
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 border-b border-border">
                  <FileText className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  <span className="text-xs font-semibold text-foreground">{t("Extracted Documents")}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {packetData.extractedDocuments.length} {t("file(s)")}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {packetData.extractedDocuments.map((doc, idx) => {
                    const isOpen = !!expandedDocs[idx];
                    return (
                      <div key={idx}>
                        <button
                          type="button"
                          onClick={() => setExpandedDocs((p) => ({ ...p, [idx]: !isOpen }))}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        >
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                          <span className="flex-1 text-xs font-medium text-foreground truncate">{doc.documentName}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wide mr-2">{doc.sourceType}</span>
                          {isOpen
                            ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                        </button>
                        {isOpen && (
                          <table className="w-full text-xs border-t border-border">
                            <thead>
                              <tr className="text-left text-muted-foreground bg-muted/20">
                                <th className="px-3 py-1.5 font-medium">{t("Field")}</th>
                                <th className="px-3 py-1.5 font-medium">{t("Value")}</th>
                                <th className="px-3 py-1.5 font-medium">{t("Conf.")}</th>
                                <th className="px-3 py-1.5 font-medium hidden md:table-cell">{t("Evidence snippet")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {doc.fields.map((f, fi) => (
                                <tr key={fi} className="border-t border-border">
                                  <td className="px-3 py-1.5 font-medium text-foreground whitespace-nowrap">{f.field}</td>
                                  <td className="px-3 py-1.5 font-mono text-foreground">
                                    {f.value || <em className="text-muted-foreground not-italic">—</em>}
                                  </td>
                                  <td className="px-3 py-1.5"><ConfBadge c={f.confidence} /></td>
                                  <td className="px-3 py-1.5 text-muted-foreground italic hidden md:table-cell max-w-xs truncate">
                                    {f.sourceSnippet ? `"${f.sourceSnippet}"` : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Raw JSON fallback (for advanced users / download preview) */}
            <details className="group">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground list-none flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary rounded">
                <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" aria-hidden="true" />
                {t("View raw JSON")}
              </summary>
              <div className="mt-2 rounded-md border border-border bg-background overflow-auto max-h-64 p-3">
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">{previewJson}</pre>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Session delete */}
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <h3 className="text-sm font-semibold text-red-800 mb-1">{t("Delete Session & All Data")}</h3>
        <p className="text-xs text-red-700 mb-3">
          {t("This permanently deletes all extracted fields and consent logs from the server. This action cannot be undone. Your downloaded packet (if any) is not affected.")}
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("Delete Session")}
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-red-800 font-medium">{t("Are you sure?")}</span>
            <button
              type="button"
              onClick={deleteSession}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none"
              aria-busy={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
              {isDeleting ? t("Deleting…") : t("Yes, delete everything")}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t("Cancel")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
