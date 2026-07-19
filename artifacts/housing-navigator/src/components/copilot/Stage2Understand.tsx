import { useEffect, useState } from "react";
import {
  Activity, AlertCircle, BookOpen, Calculator, ChevronDown, ChevronUp,
  ExternalLink, Loader2, MessageSquare, ShieldOff, ThumbsDown, ThumbsUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Citation {
  authority: string;
  effectiveDate: string;
  url: string | null;
  section?: string;
}

interface CalculatedValue {
  householdSize: number;
  vliAnnual: number;
  eliAnnual: number;
  vliMonthly: number;
  eliMonthly: number;
}

interface RulesResult {
  answer: string;
  citation: Citation | null;
  formula: string | null;
  calculatedValue: CalculatedValue | null;
  deterministic: boolean;
  abstained: boolean;
  abstainReason?: string;
}

interface FeedbackStats {
  totalQueries: number;
  thumbsUp: number;
  thumbsDown: number;
  satisfactionRate: number | null;
  abstainCount: number;
  abstainRate: number | null;
  corpusGapCount: number;
  corpusGapRate: number | null;
  lastUpdated: string;
}

const PRESET_QUESTIONS = [
  { label: "What is the income limit?",           question: "What is the income limit for Section 8?",               householdSize: null },
  { label: "How is my rent calculated?",           question: "How is the tenant rent contribution calculated?",        householdSize: null },
  { label: "Who can be on my application?",        question: "Who can be included in the household?",                  householdSize: null },
  { label: "What is a payment standard?",          question: "What is the payment standard and how does it relate to FMR?", householdSize: null },
  { label: "Can I move with my voucher?",          question: "Can I move to another city with my voucher?",             householdSize: null },
  { label: "What is an HQS inspection?",           question: "What are Housing Quality Standards inspection requirements?", householdSize: null },
];

interface Props {
  sessionId: string | null;
}

// ── Signal Quality Panel ─────────────────────────────────────
// Inspired by the Databricks Supply-Chain Agent observability architecture:
//   Pillar 1 (User Driven)         → renter thumbs-up satisfaction rate
//   Pillar 2 (AI Judge Threshold)  → abstain rate (injection guards + decision refusals)
//   Pillar 3 (Coding Harness)      → corpus-gap rate (LLM fallback, not in frozen rules)
function SignalQualityPanel({ stats }: { stats: FeedbackStats | null }) {
  const { t } = useLanguage();
  if (!stats || stats.totalQueries === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/20 p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span><strong>{t("Signal Quality")}</strong> — {t("quality signals will appear here after your first question.")}</span>
      </div>
    );
  }

  const pillars = [
    {
      label: t("User Satisfaction"),
      sublabel: t("User Driven"),
      value: stats.satisfactionRate !== null ? `${stats.satisfactionRate}%` : "—",
      detail: t("{up}↑ {down}↓ of {total} rated", { up: stats.thumbsUp, down: stats.thumbsDown, total: stats.thumbsUp + stats.thumbsDown }),
      color: stats.satisfactionRate === null ? "text-muted-foreground"
        : stats.satisfactionRate >= 75 ? "text-green-700"
        : stats.satisfactionRate >= 50 ? "text-amber-700"
        : "text-red-700",
      bg: stats.satisfactionRate === null ? "bg-muted/30"
        : stats.satisfactionRate >= 75 ? "bg-green-50 border-green-200"
        : stats.satisfactionRate >= 50 ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200",
    },
    {
      label: t("Abstain Rate"),
      sublabel: t("AI Judge Gate"),
      value: stats.abstainRate !== null ? `${stats.abstainRate}%` : "—",
      detail: t("{count} of {total} deflected", { count: stats.abstainCount, total: stats.totalQueries }),
      color: stats.abstainRate === null ? "text-muted-foreground"
        : stats.abstainRate <= 20 ? "text-green-700"
        : stats.abstainRate <= 40 ? "text-amber-700"
        : "text-red-700",
      bg: stats.abstainRate === null ? "bg-muted/30"
        : stats.abstainRate <= 20 ? "bg-green-50 border-green-200"
        : stats.abstainRate <= 40 ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200",
    },
    {
      label: t("Corpus Gap Rate"),
      sublabel: t("Coding Harness"),
      value: stats.corpusGapRate !== null ? `${stats.corpusGapRate}%` : "—",
      detail: t("{count} LLM fallbacks of {total}", { count: stats.corpusGapCount, total: stats.totalQueries }),
      color: stats.corpusGapRate === null ? "text-muted-foreground"
        : stats.corpusGapRate <= 25 ? "text-green-700"
        : stats.corpusGapRate <= 50 ? "text-amber-700"
        : "text-red-700",
      bg: stats.corpusGapRate === null ? "bg-muted/30"
        : stats.corpusGapRate <= 25 ? "bg-green-50 border-green-200"
        : stats.corpusGapRate <= 50 ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200",
    },
  ];

  return (
    <section aria-label={t("Signal quality monitoring panel")} className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Activity className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">{t("Signal Quality")}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{t("{count} queries", { count: stats.totalQueries })}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {pillars.map((p) => (
          <div key={p.label} className={`rounded border p-2 ${p.bg}`}>
            <p className="text-[10px] text-muted-foreground leading-tight">{p.sublabel}</p>
            <p className={`text-lg font-bold leading-none mt-0.5 ${p.color}`}>{p.value}</p>
            <p className="text-[10px] font-medium text-foreground mt-0.5">{p.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{p.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Stage2Understand({ sessionId }: Props) {
  const { t } = useLanguage();
  const [question, setQuestion]           = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [result, setResult]               = useState<RulesResult | null>(null);
  const [resultQuestion, setResultQuestion] = useState<string>("");
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [expandedAnswer, setExpandedAnswer] = useState(true);
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  // Feedback state
  const [feedbackGiven, setFeedbackGiven]     = useState<"up" | "down" | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Signal quality stats
  const [stats, setStats] = useState<FeedbackStats | null>(null);

  async function fetchStats() {
    try {
      const res = await fetch("/api/copilot/feedback/stats");
      if (res.ok) setStats(await res.json());
    } catch {
      // non-critical — fail silently
    }
  }

  useEffect(() => { fetchStats(); }, []);

  async function askQuestion(q: string, hs?: number) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setFeedbackGiven(null);
    setResultQuestion(q);
    try {
      const res = await fetch("/api/copilot/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          sessionId,
          householdSize: hs ?? (householdSize ? parseInt(householdSize, 10) : undefined),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ? t(data.error) : t("Request failed.")); return; }
      setResult(data);
      setExpandedAnswer(true);
    } catch {
      setError(t("Network error — please check your connection and try again."));
    } finally {
      setIsLoading(false);
      setLoadingPreset(null);
    }
  }

  async function handlePreset(pq: typeof PRESET_QUESTIONS[0]) {
    setQuestion(pq.question);
    setLoadingPreset(pq.label);
    setIsLoading(true);
    await askQuestion(pq.question, pq.householdSize ?? undefined);
  }

  async function sendFeedback(rating: "up" | "down") {
    if (!result || feedbackGiven) return;
    setFeedbackLoading(true);
    try {
      await fetch("/api/copilot/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          question: resultQuestion,
          rating,
          deterministic: result.deterministic,
          abstained: result.abstained,
        }),
      });
      setFeedbackGiven(rating);
      await fetchStats();
    } catch {
      // non-critical — fail silently
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-primary mb-1" id="stage2-heading">
          {t("Stage 2 — Understand: Rules & Calculations")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("Ask questions about Section 8 HCV program rules (NYC/NYCHA, rule year 2026). Every answer shows the authoritative citation and effective date. This tool explains rules — it does not determine eligibility.")}
        </p>
      </div>

      {/* Preset questions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">{t("Common questions")}</h3>
        <div className="flex flex-wrap gap-2" role="list" aria-label={t("Preset rule questions")}>
          {PRESET_QUESTIONS.map((pq) => (
            <button
              key={pq.label}
              type="button"
              role="listitem"
              onClick={() => handlePreset(pq)}
              disabled={isLoading}
              className="text-xs rounded-full border border-primary/40 px-3 py-1.5 text-primary hover:bg-primary/5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              aria-busy={loadingPreset === pq.label}
            >
              {loadingPreset === pq.label
                ? <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> {t("Loading…")}</span>
                : t(pq.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Income-limit calculator */}
      <div className="rounded-md border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-secondary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">{t("Income Limit Calculator")}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {t("Enter your household size to see the exact HUD FY2026 MTSP income thresholds for NYC.")}
        </p>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label htmlFor="hs-input" className="block text-xs font-medium text-foreground mb-1">
              {t("Household Size (1–8)")}
            </label>
            <input
              id="hs-input"
              type="number"
              min={1}
              max={8}
              className="w-24 rounded border border-input bg-background px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-primary outline-none"
              value={householdSize}
              onChange={(e) => setHouseholdSize(e.target.value)}
              aria-label={t("Household size for income limit calculation")}
            />
          </div>
          <button
            type="button"
            onClick={() => askQuestion("What is the income limit?", householdSize ? parseInt(householdSize, 10) : undefined)}
            disabled={isLoading || !householdSize}
            className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
            aria-busy={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Calculator className="h-4 w-4" aria-hidden="true" />}
            {t("Calculate")}
          </button>
        </div>
      </div>

      {/* Free-text question */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">{t("Ask a rules question")}</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            className="flex-1 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary outline-none"
            placeholder={t("e.g. How do I report a change in income?")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            aria-label={t("Type a rules question about Section 8")}
            onKeyDown={(e) => { if (e.key === "Enter" && !isLoading && question.trim()) askQuestion(question); }}
            maxLength={600}
          />
          <button
            type="button"
            onClick={() => askQuestion(question)}
            disabled={isLoading || !question.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            aria-busy={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MessageSquare className="h-4 w-4" aria-hidden="true" />}
            {t("Ask")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t("Max 600 characters. Questions about eligibility decisions will be deflected.")}</p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Result card */}
      {result && (
        <>
          <section aria-label={t("Rules answer")} className="rounded-md border border-border bg-background shadow-sm overflow-hidden">
            {/* Abstain notice */}
            {result.abstained && (
              <div className="flex items-start gap-2 bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-800">
                <ShieldOff className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong>{t("This tool abstains from answering this question.")}</strong>
                  {result.abstainReason && <p className="mt-0.5 text-xs">{t(result.abstainReason)}</p>}
                </div>
              </div>
            )}

            {/* Answer */}
            <div className="px-4 py-4">
              <button
                type="button"
                onClick={() => setExpandedAnswer((v) => !v)}
                className="flex items-center justify-between w-full text-left gap-2 focus-visible:ring-2 focus-visible:ring-primary rounded outline-none"
                aria-expanded={expandedAnswer}
                aria-controls="answer-body"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-secondary" aria-hidden="true" />
                  <span className="text-sm font-semibold text-foreground">{t("Answer")}</span>
                  {result.deterministic && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 font-medium">
                      {t("Deterministic")}
                    </span>
                  )}
                </div>
                {expandedAnswer
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
              </button>

              {expandedAnswer && (
                <div id="answer-body" className="mt-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {t(result.answer)}
                </div>
              )}
            </div>

            {/* Calculated value */}
            {result.calculatedValue && (
              <div className="border-t border-border bg-muted/30 px-4 py-3">
                <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                  {t("Calculated Thresholds — Household of {size}", { size: result.calculatedValue.householdSize })}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded border border-green-200 bg-green-50 p-2">
                    <p className="text-xs text-muted-foreground">{t("Very Low Income (50% AMI)")}</p>
                    <p className="font-semibold text-green-800">${result.calculatedValue.vliAnnual.toLocaleString()} {t("/ yr")}</p>
                    <p className="text-xs text-muted-foreground">${result.calculatedValue.vliMonthly.toLocaleString()} {t("/ mo")}</p>
                  </div>
                  <div className="rounded border border-blue-200 bg-blue-50 p-2">
                    <p className="text-xs text-muted-foreground">{t("Extremely Low Income (30% AMI)")}</p>
                    <p className="font-semibold text-blue-800">${result.calculatedValue.eliAnnual.toLocaleString()} {t("/ yr")}</p>
                    <p className="text-xs text-muted-foreground">${result.calculatedValue.eliMonthly.toLocaleString()} {t("/ mo")}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {t("Income at or below VLI meets the Section 8 eligibility threshold. Priority is given to ELI households. These are thresholds — no determination is made here.")}
                </p>
              </div>
            )}

            {/* Formula */}
            {result.formula && (
              <div className="border-t border-border px-4 py-3 bg-muted/20">
                <p className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">{t("Formula")}</p>
                <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded block">{result.formula}</code>
              </div>
            )}

            {/* Citation */}
            {result.citation && (
              <div className="border-t border-border px-4 py-3 bg-slate-50">
                <p className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">{t("Authoritative Source")}</p>
                <p className="text-xs text-muted-foreground">{t(result.citation.authority)}</p>
                {result.citation.effectiveDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">{t("Effective:")} {result.citation.effectiveDate}</p>
                )}
                {result.citation.url && (
                  <a
                    href={result.citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded"
                    aria-label={t("Open source document: {authority} (opens in new tab)", { authority: result.citation.authority })}
                  >
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    {t("View source")}
                  </a>
                )}
              </div>
            )}
          </section>

          {/* ── Feedback row ── */}
          <div
            className="flex items-center gap-3 text-sm"
            aria-live="polite"
            aria-label={t("Answer feedback")}
          >
            {feedbackGiven ? (
              <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                {feedbackGiven === "up"
                  ? <ThumbsUp className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
                  : <ThumbsDown className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />}
                {t("Thank you — your signal helps improve answer quality.")}
              </span>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">{t("Was this answer helpful?")}</span>
                <button
                  type="button"
                  onClick={() => sendFeedback("up")}
                  disabled={feedbackLoading}
                  aria-label={t("Mark answer as helpful (thumbs up)")}
                  className="inline-flex items-center gap-1 rounded border border-green-300 bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none"
                >
                  {feedbackLoading
                    ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    : <ThumbsUp className="h-3 w-3" aria-hidden="true" />}
                  {t("Yes")}
                </button>
                <button
                  type="button"
                  onClick={() => sendFeedback("down")}
                  disabled={feedbackLoading}
                  aria-label={t("Mark answer as not helpful (thumbs down)")}
                  className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                >
                  {feedbackLoading
                    ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    : <ThumbsDown className="h-3 w-3" aria-hidden="true" />}
                  {t("No")}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Signal Quality panel ── */}
      <SignalQualityPanel stats={stats} />

      <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        <strong>{t("Rule version:")}</strong> {t("Section 8 HCV, NYCHA/NYC, rule year 2026 (frozen corpus). Rules are static — no live API calls are made to HUD. For a personalized assessment, contact the")} <a href="https://www.metcouncil.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Met Council on Housing</a> {t("at")} (212) 979-0611.
      </div>
    </div>
  );
}
