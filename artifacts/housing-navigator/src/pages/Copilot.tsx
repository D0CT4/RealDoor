import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ClipboardList, FileSearch, HelpCircle, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Stage1Profile, { type ExtractedField } from "@/components/copilot/Stage1Profile";
import Stage2Understand from "@/components/copilot/Stage2Understand";
import Stage3Prepare from "@/components/copilot/Stage3Prepare";

type Stage = 1 | 2 | 3;

const STAGES = [
  { id: 1 as Stage, label: "Profile",    shortLabel: "1",  icon: FileSearch,   desc: "Extract & confirm" },
  { id: 2 as Stage, label: "Understand", shortLabel: "2",  icon: HelpCircle,   desc: "Rules & citations" },
  { id: 3 as Stage, label: "Prepare",    shortLabel: "3",  icon: ClipboardList, desc: "Checklist & packet" },
];

export default function Copilot() {
  const { t } = useLanguage();
  const [stage, setStage] = useState<Stage>(1);
  const [sessionId, setSessionId] = useState<string | null>(() => sessionStorage.getItem("copilot_session_id"));
  const [profileComplete, setProfileComplete] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Skip to stage 2 if session already confirmed
  useEffect(() => {
    if (sessionId) setProfileComplete(true);
  }, []);

  function handleProfileConfirmed(sid: string, _fields: ExtractedField[]) {
    setSessionId(sid);
    setProfileComplete(true);
    setStage(2);
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSessionDeleted() {
    setSessionId(null);
    setProfileComplete(false);
    setStage(1);
    sessionStorage.removeItem("copilot_session_id");
  }

  function goToStage(s: Stage) {
    if (s === 1) { setStage(1); return; }
    if (s === 2) { setStage(2); return; }
    if (s === 3) { setStage(3); return; }
  }

  return (
    <>
      {/* Skip nav */}
      <a
        href="#copilot-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm"
      >
        {t("Skip to main content")}
      </a>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Page header */}
        <header>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-secondary" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{t("Application-Readiness Copilot")}</span>
          </div>
          <h1 className="text-3xl font-bold text-primary leading-tight">
            RealDoor
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            {t("A renter-side tool for Section 8 / Housing Choice Voucher preparation (NYC/NYCHA, 2026).")}{" "}
            {t("The AI extracts, explains, and prepares —")} <strong>{t("you confirm")}</strong> {t("— a qualified human decides.")}
          </p>

          {/* Responsible AI notice */}
          <div className="mt-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <div className="flex items-start gap-2">
              <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-secondary" aria-hidden="true" />
              <div>
                <strong className="text-foreground">{t("No eligibility decisions are made here.")}</strong>{" "}
                {t("This tool never approves, denies, scores, or ranks applicants. All extracted values require your confirmation before use. Session data is ephemeral and can be deleted at any time.")}
              </div>
            </div>
          </div>
        </header>

        {/* Stage navigation */}
        <nav aria-label={t("Application-readiness stages")}>
          <ol className="flex gap-0 rounded-lg border border-border overflow-hidden" role="list">
            {STAGES.map((s, idx) => {
              const isActive = stage === s.id;
              const isDone = profileComplete && s.id === 1;
              const isAccessible = s.id === 1 || profileComplete || s.id <= stage;
              const Icon = s.icon;
              return (
                <li key={s.id} className="flex-1" role="listitem">
                  <button
                    type="button"
                    onClick={() => isAccessible && goToStage(s.id)}
                    disabled={!isAccessible}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`${t("Stage")} ${s.id}: ${t(s.label)} — ${t(s.desc)}${isDone ? ` (${t("complete")})` : isActive ? ` (${t("current")})` : ""}`}
                    className={`w-full flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors border-r last:border-r-0 border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none
                      ${isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-green-50 text-green-700" : isAccessible ? "bg-background text-muted-foreground hover:bg-muted" : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isDone
                        ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        : <Icon className="h-4 w-4" aria-hidden="true" />}
                      <span className="hidden sm:inline">{t(s.label)}</span>
                      <span className="sm:hidden font-bold">{s.shortLabel}</span>
                    </div>
                    <span className="hidden sm:block text-[10px] opacity-80">{t(s.desc)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Stage content */}
        <main id="copilot-main" ref={mainRef} tabIndex={-1} className="outline-none">
          {stage === 1 && (
            <Stage1Profile
              sessionId={sessionId}
              onConfirmed={handleProfileConfirmed}
            />
          )}
          {stage === 2 && (
            <Stage2Understand sessionId={sessionId} />
          )}
          {stage === 3 && (
            <Stage3Prepare
              sessionId={sessionId}
              onSessionDeleted={handleSessionDeleted}
            />
          )}
        </main>

        {/* Stage nav footer */}
        {(stage === 2 || stage === 3) && (
          <div className="flex justify-between pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setStage((s) => (s - 1) as Stage)}
              className="text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1 focus-visible:outline-none"
              aria-label={`${t("Go back to Stage")} ${stage - 1}`}
            >
              ← {t("Back")}
            </button>
            {stage < 3 && (
              <button
                type="button"
                onClick={() => setStage((s) => (s + 1) as Stage)}
                className="text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1 focus-visible:outline-none"
                aria-label={`${t("Continue to Stage")} ${stage + 1}`}
              >
                {t("Continue")} →
              </button>
            )}
          </div>
        )}

        {/* Help contacts */}
        <aside aria-label={t("Housing assistance contacts")} className="rounded-md border border-border bg-muted/20 p-4 text-sm">
          <h2 className="font-semibold text-foreground mb-2">{t("Need Human Help?")}</h2>
          <ul className="space-y-1 text-muted-foreground text-xs">
            <li>
              <strong className="text-foreground">Met Council on Housing</strong> — {t("Free tenant counseling:")}{" "}
              <a href="tel:+12129790611" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">(212) 979-0611</a>
            </li>
            <li>
              <strong className="text-foreground">Legal Aid Society</strong> — {t("Free legal help:")}{" "}
              <a href="https://legalaidnyc.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">legalaidnyc.org</a>
            </li>
            <li>
              <strong className="text-foreground">NYCHA Section 8</strong> — {t("Official program info:")}{" "}
              <a href="https://www1.nyc.gov/site/nycha/section-8/apply-for-section-8.page" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">nycha.info</a>
            </li>
            <li>
              <strong className="text-foreground">311</strong> — {t("NYC general housing assistance:")}{" "}
              <a href="tel:311" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">{t("Call 311")}</a>
            </li>
          </ul>
        </aside>
      </div>
    </>
  );
}
