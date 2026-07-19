import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle2, Edit2, FileText, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ExtractedField {
  key: string;
  label: string;
  value: string | null;
  confidence: "high" | "medium" | "low";
  sourceSnippet: string | null;
  confirmed: boolean;
  editedValue?: string;
}

interface Props {
  sessionId: string | null;
  onConfirmed: (sessionId: string, fields: ExtractedField[]) => void;
}

const CONFIDENCE_META = {
  high:   { label: "High confidence",   color: "text-green-700",  bg: "bg-green-50 border-green-200"  },
  medium: { label: "Medium confidence", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"  },
  low:    { label: "Low confidence",    color: "text-red-700",    bg: "bg-red-50 border-red-200"       },
};

const SYNTHETIC_EXAMPLE = `PAY STUB — Acme Staffing LLC
Pay Period: 06/01/2026 – 06/14/2026  Pay Date: 06/19/2026
Employee: Maria Gonzalez
Gross Pay This Period: $2,150.00
YTD Gross: $25,800.00`;

export default function Stage1Profile({ sessionId: existingSession, onConfirmed }: Props) {
  const { t } = useLanguage();
  const [docText, setDocText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [localSessionId, setLocalSessionId] = useState<string | null>(existingSession);
  const [warningDetected, setWarningDetected] = useState(false);
  const [consent, setConsent] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractDone, setExtractDone] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (extractDone && firstFieldRef.current) {
      firstFieldRef.current.focus();
    }
  }, [extractDone]);

  async function handleExtract() {
    if (!docText.trim()) return;
    setError(null);
    setIsExtracting(true);
    setExtractDone(false);
    try {
      const res = await fetch("/api/copilot/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText: docText, sessionId: localSessionId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ? t(data.error) : t("Extraction failed.")); return; }
      setLocalSessionId(data.sessionId);
      setFields(data.fields);
      setWarningDetected(!!data.warningDetected);
      const initEdits: Record<string, string> = {};
      data.fields.forEach((f: ExtractedField) => { initEdits[f.key] = f.value ?? ""; });
      setEdits(initEdits);
      setExtractDone(true);
    } catch {
      setError(t("Network error — please check your connection and try again."));
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleConfirm() {
    if (!localSessionId || !consent) return;
    setIsConfirming(true);
    setError(null);
    try {
      const confirmedFields = fields.map((f) => ({ key: f.key, value: edits[f.key] ?? f.value ?? "" }));
      const res = await fetch("/api/copilot/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: localSessionId, confirmedFields, consent: true }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ? t(data.error) : t("Confirmation failed.")); return; }
      sessionStorage.setItem("copilot_session_id", localSessionId);
      const confirmedData = fields.map((f) => ({ ...f, editedValue: edits[f.key] ?? f.value ?? "", confirmed: true }));
      onConfirmed(localSessionId, confirmedData);
    } catch {
      setError(t("Network error — please try again."));
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-primary mb-1" id="stage1-heading">
          {t("Stage 1 — Profile: Document Extraction")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("Paste a")} <strong>{t("synthetic")}</strong> {t("pay stub or benefit letter below. The tool extracts only 5 allowlisted fields — no SSNs, addresses, or account numbers. Raw text is never stored.")}
        </p>
      </div>

      {/* Sample document button */}
      <div>
        <button
          type="button"
          onClick={() => setDocText(SYNTHETIC_EXAMPLE)}
          className="text-xs underline text-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary rounded"
          aria-label={t("Load a sample synthetic pay stub into the text area")}
        >
          {t("Load sample synthetic pay stub")}
        </button>
      </div>

      <div>
        <label htmlFor="doc-text" className="block text-sm font-medium text-foreground mb-1">
          {t("Document Text")} <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="doc-text"
          rows={8}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder={t("Paste your synthetic pay stub, benefit letter, or other income document here…")}
          value={docText}
          onChange={(e) => setDocText(e.target.value)}
          aria-describedby="doc-text-hint"
          aria-required="true"
          disabled={isExtracting}
        />
        <p id="doc-text-hint" className="text-xs text-muted-foreground mt-1">
          {t("Use only synthetic (test) documents. Do not paste documents containing real personal information.")}
        </p>
      </div>

      <button
        type="button"
        onClick={handleExtract}
        disabled={isExtracting || !docText.trim()}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        aria-busy={isExtracting}
      >
        {isExtracting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileText className="h-4 w-4" aria-hidden="true" />}
        {isExtracting ? t("Extracting fields…") : t("Extract Fields")}
      </button>

      {/* Injection warning */}
      {warningDetected && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span><strong>{t("Security notice:")}</strong> {t("The document contained text that appeared to be attempting to manipulate the extraction system. Those instructions were ignored. Please review the extracted fields carefully.")}</span>
        </div>
      )}

      {/* Extracted fields */}
      {extractDone && fields.length > 0 && (
        <section aria-labelledby="fields-heading">
          <h3 id="fields-heading" className="text-base font-semibold text-foreground mb-3">
            {t("Extracted Fields — Review & Correct")}
          </h3>
          <div
            ref={firstFieldRef}
            tabIndex={-1}
            aria-live="polite"
            className="space-y-3 outline-none"
          >
            {fields.map((field) => {
              const meta = CONFIDENCE_META[field.confidence];
              const isEditing = editingKey === field.key;
              return (
                <div
                  key={field.key}
                  className={`rounded-md border p-3 ${meta.bg}`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{t(field.label)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${meta.bg} ${meta.color}`} aria-label={t(meta.label)}>
                        {t(meta.label)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingKey(isEditing ? null : field.key)}
                      className="text-xs flex items-center gap-1 text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded"
                      aria-label={isEditing ? `${t("Stop editing")} ${t(field.label)}` : `${t("Edit")} ${t(field.label)}`}
                      aria-pressed={isEditing}
                    >
                      <Edit2 className="h-3 w-3" aria-hidden="true" />
                      {isEditing ? t("Done") : t("Edit")}
                    </button>
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      className="mt-2 w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-primary outline-none"
                      value={edits[field.key] ?? ""}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      aria-label={`${t("Corrected value for")} ${t(field.label)}`}
                      autoFocus
                    />
                  ) : (
                    <p className="mt-1 text-sm font-mono text-foreground">
                      {edits[field.key] || <em className="text-muted-foreground">{t("Not found")}</em>}
                    </p>
                  )}

                  {field.sourceSnippet && !isEditing && (
                    <p className="mt-1.5 text-xs text-muted-foreground italic">
                      {t("Evidence:")} &ldquo;{field.sourceSnippet}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Consent + Confirm */}
          <div className="mt-5 space-y-4 rounded-md border border-border bg-muted/40 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
                aria-required="true"
                id="consent-checkbox"
              />
              <span className="text-sm text-foreground" id="consent-label">
                <strong>{t("I confirm")}</strong> {t("that I have reviewed and corrected these fields. I understand that only the fields shown above will be stored — the original document text will not be retained. This information will only be used to prepare my application-readiness packet.")}
              </span>
            </label>

            {error && (
              <div role="alert" className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!consent || isConfirming}
              className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:outline-none"
              aria-busy={isConfirming}
              aria-describedby="consent-label"
            >
              {isConfirming
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              {isConfirming ? t("Confirming…") : t("Confirm Profile & Continue")}
            </button>
          </div>
        </section>
      )}

      {error && !extractDone && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}
