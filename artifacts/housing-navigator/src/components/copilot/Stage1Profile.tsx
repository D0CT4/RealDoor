import { useState, useRef, useCallback, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  FileText,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Upload,
  ImageIcon,
  FileImage,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ExtractedField {
  key: string;
  label: string;
  value: string | null;
  confidence: "high" | "medium" | "low";
  sourceSnippet: string | null;
  confirmed: boolean;
  editedValue?: string;
  page?: number;
  bbox?: [number, number, number, number] | null;
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

const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const ACCEPTED_EXTS = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".docx"];

const FILE_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "application/pdf": { label: "PDF", icon: <FileText className="h-4 w-4" />, color: "text-red-600" },
  "image/jpeg":      { label: "JPEG", icon: <FileImage className="h-4 w-4" />, color: "text-blue-600" },
  "image/png":       { label: "PNG",  icon: <ImageIcon className="h-4 w-4" />, color: "text-blue-600" },
  "image/webp":      { label: "WEBP", icon: <ImageIcon className="h-4 w-4" />, color: "text-blue-600" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { label: "DOCX", icon: <FileText className="h-4 w-4" />, color: "text-indigo-600" },
  "application/msword": { label: "DOC", icon: <FileText className="h-4 w-4" />, color: "text-indigo-600" },
};

const SYNTHETIC_EXAMPLE = `PAY STUB — Acme Staffing LLC
Pay Period: 06/01/2026 – 06/14/2026  Pay Date: 06/19/2026
Employee: Maria Gonzalez
Gross Pay This Period: $2,150.00
YTD Gross: $25,800.00`;

type InputMode = "upload" | "paste";

export default function Stage1Profile({ sessionId: existingSession, onConfirmed }: Props) {
  const { t } = useLanguage();

  // Mode + inputs
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [docText, setDocText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showPaste, setShowPaste] = useState(false);

  // Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [localSessionId, setLocalSessionId] = useState<string | null>(existingSession);
  const [warningDetected, setWarningDetected] = useState(false);
  const [ragUsed, setRagUsed] = useState(false);
  const [sourceType, setSourceType] = useState<string>("");
  const [consent, setConsent] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractDone, setExtractDone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstFieldRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (extractDone && firstFieldRef.current) firstFieldRef.current.focus();
  }, [extractDone]);

  // ── Drag & drop handlers ────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!dropRef.current?.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && ACCEPTED_MIME.includes(dropped.type)) {
      setFile(dropped);
      setDocText("");
      setExtractDone(false);
      setFields([]);
      setError(null);
    } else {
      setError(t("Unsupported file type. Please upload PDF, DOCX, JPEG, or PNG."));
    }
  }, [t]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setDocText("");
      setExtractDone(false);
      setFields([]);
      setError(null);
    }
    e.target.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setExtractDone(false);
    setFields([]);
    setError(null);
  };

  // ── Extract ──────────────────────────────────────────────────
  async function handleExtract() {
    const hasInput = file ? true : docText.trim().length > 0;
    if (!hasInput) return;
    setError(null);
    setIsExtracting(true);
    setExtractDone(false);

    try {
      let res: Response;

      if (file) {
        const form = new FormData();
        form.append("file", file);
        if (localSessionId) form.append("sessionId", localSessionId);
        res = await fetch("/api/copilot/rag-extract", { method: "POST", body: form });
      } else {
        res = await fetch("/api/copilot/rag-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentText: docText, sessionId: localSessionId }),
        });
      }

      const data = await res.json();
      if (!res.ok) { setError(data.error ? t(data.error) : t("Extraction failed.")); return; }

      setLocalSessionId(data.sessionId);
      setFields(data.fields);
      setWarningDetected(!!data.warningDetected);
      setRagUsed(!!data.ragUsed);
      setSourceType(data.sourceType ?? "text");

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

  // ── Confirm ──────────────────────────────────────────────────
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
      const confirmed = fields.map((f) => ({
        ...f,
        editedValue: edits[f.key] ?? f.value ?? "",
        confirmed: true,
      }));
      onConfirmed(localSessionId, confirmed);
    } catch {
      setError(t("Network error — please try again."));
    } finally {
      setIsConfirming(false);
    }
  }

  const hasInput = file !== null || docText.trim().length > 0;
  const fileMeta = file ? FILE_TYPE_LABELS[file.type] : null;

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-primary mb-1" id="stage1-heading">
          {t("Stage 1 — Profile: Document Extraction")}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("Paste a")} <strong>{t("synthetic")}</strong>{" "}
          {t("pay stub or benefit letter below. The tool extracts only 5 allowlisted fields — no SSNs, addresses, or account numbers. Raw text is never stored.")}
        </p>
      </div>

      {/* RAG system badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        {t("RAG-powered extraction · OpenAI Agent · 7 allowlisted fields only")}
      </div>

      {/* Sample doc button */}
      <div>
        <button
          type="button"
          onClick={() => { setDocText(SYNTHETIC_EXAMPLE); setFile(null); setShowPaste(true); setExtractDone(false); setFields([]); }}
          className="text-xs underline text-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary rounded"
          aria-label={t("Load a sample synthetic pay stub into the text area")}
        >
          {t("Load sample synthetic pay stub")}
        </button>
      </div>

      {/* ── Drop zone ─────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {t("Document")}{" "}
          <span className="text-muted-foreground font-normal">
            {t("(PDF, JPEG, PNG, DOCX)")}
          </span>{" "}
          <span aria-hidden="true" className="text-destructive">*</span>
        </label>

        {/* Drop target */}
        <div
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !file) fileInputRef.current?.click(); }}
          aria-label={t("Document upload area — drag and drop or click to browse")}
          className={[
            "relative rounded-xl border-2 border-dashed transition-all duration-150 select-none",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
            file
              ? "border-primary/40 bg-primary/5 cursor-default"
              : isDragging
              ? "border-primary bg-primary/10 scale-[1.01] cursor-copy"
              : "border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer",
          ].join(" ")}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTS.join(",")}
            className="sr-only"
            onChange={handleFileInput}
            aria-hidden="true"
            tabIndex={-1}
          />

          {file ? (
            /* File selected state */
            <div className="flex items-center gap-3 px-5 py-4">
              <span className={fileMeta?.color ?? "text-muted-foreground"} aria-hidden="true">
                {fileMeta?.icon ?? <FileText className="h-5 w-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {fileMeta?.label} · {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={t("Remove selected file")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
              <div className={[
                "rounded-full p-3 transition-colors",
                isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              ].join(" ")}>
                <Upload className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? t("Drop to upload") : t("Drag & drop your document here")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("or")}{" "}
                  <span className="text-primary font-medium underline underline-offset-2">
                    {t("click to browse")}
                  </span>
                </p>
              </div>

              {/* Format badges */}
              <div className="flex items-center gap-2 mt-1" aria-label={t("Supported formats")}>
                {[
                  { label: "PDF",  color: "bg-red-50 border-red-200 text-red-700" },
                  { label: "JPEG", color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: "PNG",  color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: "DOCX", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
                ].map(({ label, color }) => (
                  <span
                    key={label}
                    className={`rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${color}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── OR paste text ─────────────────────────────────────── */}
      <div className="border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPaste((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-expanded={showPaste}
          aria-controls="paste-area"
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t("Or paste document text")}
            {docText.trim() && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                {t("text added")}
              </span>
            )}
          </span>
          {showPaste
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
        </button>

        {showPaste && (
          <div id="paste-area" className="px-4 pb-4 pt-1 border-t border-border bg-muted/10">
            <label htmlFor="doc-text" className="block text-xs font-medium text-muted-foreground mb-1.5 mt-2">
              {t("Paste text here")} {file && <span className="text-amber-600">({t("will override the uploaded file")})</span>}
            </label>
            <textarea
              id="doc-text"
              rows={7}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder={t("Paste your synthetic pay stub, benefit letter, or other income document here…")}
              value={docText}
              onChange={(e) => {
                setDocText(e.target.value);
                if (e.target.value.trim()) setFile(null);
                setExtractDone(false);
                setFields([]);
              }}
              aria-describedby="doc-text-hint"
              disabled={isExtracting}
            />
            <p id="doc-text-hint" className="text-xs text-muted-foreground mt-1">
              {t("Use only synthetic (test) documents. Do not paste real personal information.")}
            </p>
          </div>
        )}
      </div>

      {/* ── Extract button ────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleExtract}
        disabled={isExtracting || !hasInput}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
        aria-busy={isExtracting}
      >
        {isExtracting
          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          : <Sparkles className="h-4 w-4" aria-hidden="true" />}
        {isExtracting ? t("Extracting fields…") : t("Extract Fields")}
      </button>

      {/* ── Injection warning ─────────────────────────────────── */}
      {warningDetected && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>{t("Security notice:")}</strong>{" "}
            {t("The document contained text that appeared to be attempting to manipulate the extraction system. Those instructions were ignored. Please review the extracted fields carefully.")}
          </span>
        </div>
      )}

      {/* ── Extraction results ────────────────────────────────── */}
      {extractDone && fields.length > 0 && (
        <section aria-labelledby="fields-heading">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h3 id="fields-heading" className="text-base font-semibold text-foreground">
              {t("Extracted Fields — Review & Correct")}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {ragUsed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {t("RAG retrieval used")}
                </span>
              )}
              {sourceType && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  {sourceType}
                </span>
              )}
            </div>
          </div>

          <div
            ref={firstFieldRef}
            tabIndex={-1}
            aria-live="polite"
            className="space-y-3 outline-none"
          >
            {fields.map((field) => {
              const meta = CONFIDENCE_META[field.confidence ?? "low"];
              const isEditing = editingKey === field.key;
              return (
                <div key={field.key} className={`rounded-md border p-3 ${meta.bg}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{t(field.label)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${meta.bg} ${meta.color}`} aria-label={t(meta.label)}>
                        {t(meta.label)}
                      </span>
                      {field.page && (
                        <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-background">
                          {t("p.")}{field.page}
                        </span>
                      )}
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
                      {t("Evidence:")}{" "}&ldquo;{field.sourceSnippet}&rdquo;
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
                <strong>{t("I confirm")}</strong>{" "}
                {t("that I have reviewed and corrected these fields. I understand that only the fields shown above will be stored — the original document text will not be retained. This information will only be used to prepare my application-readiness packet.")}
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

      {/* Extracted but empty */}
      {extractDone && fields.length === 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t("No fields could be extracted. Please check that the document contains income or employment information.")}</span>
        </div>
      )}

      {/* Pre-extraction errors */}
      {error && !extractDone && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Privacy reminder */}
      {!extractDone && (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-green-600" aria-hidden="true" />
          <span>
            {t("Only 7 allowlisted fields are extracted. No SSNs, addresses, bank account numbers, or raw document text are ever stored.")}
          </span>
        </div>
      )}
    </div>
  );
}
