import { Globe, Loader2 } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSelectProps {
  className?: string;
  /** Use light styles for dark backgrounds (e.g. the hero). */
  onDark?: boolean;
}

export function LanguageSelect({ className, onDark }: LanguageSelectProps) {
  const { language, setLanguage, isTranslating } = useLanguage();

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {isTranslating ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", onDark ? "text-white/80" : "text-muted-foreground")} aria-hidden="true" />
      ) : (
        <Globe className={cn("h-4 w-4", onDark ? "text-white/80" : "text-muted-foreground")} aria-hidden="true" />
      )}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Language / Idioma"
        className={cn(
          "h-9 rounded-md border px-2 pr-7 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer",
          onDark
            ? "bg-primary-foreground/10 border-primary-foreground/20 text-white [&>option]:text-foreground [&>option]:bg-background"
            : "bg-background border-input text-foreground"
        )}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
