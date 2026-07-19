import { useEffect, useRef, useState } from "react";
import { ClipboardList, FileSearch, HelpCircle, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Stage1Profile, { type ExtractedField } from "@/components/copilot/Stage1Profile";
import Stage2Understand from "@/components/copilot/Stage2Understand";
import Stage3Prepare from "@/components/copilot/Stage3Prepare";

type Tab = "apply" | "understand";

const TABS = [
  { id: "apply" as Tab,      label: "Apply",      icon: FileSearch,    desc: "Upload & prepare" },
  { id: "understand" as Tab, label: "Understand",  icon: HelpCircle,    desc: "Rules & citations" },
];

export default function Copilot() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("apply");
  const [sessionId, setSessionId] = useState<string | null>(() => sessionStorage.getItem("copilot_session_id"));
  const mainRef = useRef<HTMLDivElement>(null);

  // Restore session on mount
  useEffect(() => {}, []);

  function handleProfileConfirmed(sid: string, _fields: ExtractedField[]) {
    setSessionId(sid);
    // Stay on Apply tab — checklist below auto-updates
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSessionDeleted() {
    setSessionId(null);
    sessionStorage.removeItem("copilot_session_id");
    setTab("apply");
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

        {/* Tab navigation */}
        <nav aria-label={t("Copilot sections")}>
          <div className="flex gap-0 rounded-lg border border-border overflow-hidden">
            {TABS.map((t_) => {
              const isActive = tab === t_.id;
              const Icon = t_.icon;
              return (
                <button
                  key={t_.id}
                  type="button"
                  onClick={() => setTab(t_.id)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${t(t_.label)} — ${t(t_.desc)}`}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium transition-colors border-r last:border-r-0 border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none
                    ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{t(t_.label)}</span>
                  </div>
                  <span className="text-[10px] opacity-80">{t(t_.desc)}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Tab content */}
        <main id="copilot-main" ref={mainRef} tabIndex={-1} className="outline-none">
          {tab === "apply" && (
            <div className="space-y-10">
              {/* Profile — upload & extract */}
              <section aria-labelledby="section-profile">
                <div className="flex items-center gap-2 mb-4">
                  <FileSearch className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 id="section-profile" className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {t("Profile")}
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Stage1Profile
                  sessionId={sessionId}
                  onConfirmed={handleProfileConfirmed}
                />
              </section>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Prepare — checklist & packet */}
              <section aria-labelledby="section-prepare">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h2 id="section-prepare" className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {t("Prepare")}
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Stage3Prepare
                  sessionId={sessionId}
                  onSessionDeleted={handleSessionDeleted}
                />
              </section>
            </div>
          )}

          {tab === "understand" && (
            <Stage2Understand sessionId={sessionId} />
          )}
        </main>

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
              <a href="https://www.nyc.gov/site/nycha/section-8/applicants.page" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary rounded">nycha.info</a>
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
