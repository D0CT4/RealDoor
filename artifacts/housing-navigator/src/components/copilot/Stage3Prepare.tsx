import { useEffect, useState } from "react";
import {
  AlertCircle, AlertTriangle, CheckCircle2, Download,
  FileDown, Loader2, Trash2, XCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [loadingChecklist, setLoadingChecklist] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewJson, setPreviewJson] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadChecklist() {
      try {
        const res = await fetch("/api/copilot/checklist");
        const data = await res.json();
        setChecklist(data.items ?? []);
        // Default all items to "missing"
        const init: Record<string, ItemStatus> = {};
        (data.items ?? []).forEach((item: ChecklistItem) => { init[item.id] = "missing"; });
        setStatuses(init);
      } catch {
        setError(t("Failed to load document checklist."));
      } finally {
        setLoadingChecklist(false);
      }
    }
    loadChecklist();
  }, []);

  const missingRequired = checklist.filter((i) => i.required && statuses[i.id] !== "present");
  const expiredItems = checklist.filter((i) => statuses[i.id] === "expired");
  const allClear = missingRequired.length === 0 && expiredItems.length === 0;

  function setStatus(id: string, status: ItemStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    setPreviewJson(null); // invalidate preview when statuses change
  }

  async function generatePacket() {
    if (!sessionId) { setError(t("No active session — please complete Stage 1 first.")); return; }
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/copilot/packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, itemStatuses: statuses }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ? t(data.error) : t("Packet generation failed.")); return; }
      setPreviewJson(JSON.stringify(data.packet, null, 2));
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

        {/* Packet preview */}
        {previewJson && (
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">{t("Packet Preview")}</h4>
            <div
              className="rounded-md border border-border bg-background overflow-auto max-h-80 p-3"
              role="region"
              aria-label={t("Packet JSON preview")}
              tabIndex={0}
            >
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">{previewJson}</pre>
            </div>
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
