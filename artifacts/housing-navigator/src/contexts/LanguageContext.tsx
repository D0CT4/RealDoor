import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

// ── Supported languages (any language works — this list powers the picker) ──
export interface LanguageOption {
  code: string;
  label: string;      // native name shown in the picker
  english: string;    // English name sent to the translation service
  rtl?: boolean;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', english: 'English' },
  { code: 'es', label: 'Español', english: 'Spanish' },
  { code: 'zh', label: '中文', english: 'Chinese (Simplified)' },
  { code: 'ru', label: 'Русский', english: 'Russian' },
  { code: 'bn', label: 'বাংলা', english: 'Bengali' },
  { code: 'ht', label: 'Kreyòl Ayisyen', english: 'Haitian Creole' },
  { code: 'ko', label: '한국어', english: 'Korean' },
  { code: 'ar', label: 'العربية', english: 'Arabic', rtl: true },
  { code: 'fr', label: 'Français', english: 'French' },
  { code: 'ur', label: 'اردو', english: 'Urdu', rtl: true },
  { code: 'pl', label: 'Polski', english: 'Polish' },
  { code: 'pt', label: 'Português', english: 'Portuguese' },
  { code: 'hi', label: 'हिन्दी', english: 'Hindi' },
  { code: 'vi', label: 'Tiếng Việt', english: 'Vietnamese' },
  { code: 'tl', label: 'Tagalog', english: 'Tagalog' },
  { code: 'el', label: 'Ελληνικά', english: 'Greek' },
  { code: 'he', label: 'עברית', english: 'Hebrew', rtl: true },
  { code: 'it', label: 'Italiano', english: 'Italian' },
  { code: 'de', label: 'Deutsch', english: 'German' },
  { code: 'ja', label: '日本語', english: 'Japanese' },
];

interface LanguageContextType {
  language: string; // language code from LANGUAGES
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isTranslating: boolean;
}

// ── Built-in dictionaries ────────────────────────────────────
// `en` doubles as the source-text lookup for dynamic translation.
// Keys not present in the dictionary are treated as literal English text,
// so components can call t('Any English sentence') directly.
const translations: Record<'en' | 'es', Record<string, string>> = {
  en: {
    'home.hero.title': 'Understand Your Rent Situation.',
    'home.hero.subtitle': 'Answer a few questions to see if your rent is considered a burden and discover housing assistance programs you might qualify for.',
    'home.form.income': 'Monthly Household Income ($)',
    'home.form.size': 'Household Size',
    'home.form.rent': 'Current Monthly Rent ($)',
    'home.form.bedrooms': 'Bedrooms',
    'home.form.borough': 'Borough',
    'home.form.submit': 'Check Eligibility',
    'home.form.loading': 'Checking...',
    'home.results.title': 'Your Results',
    'home.results.burden_title': 'Rent Burden Status',
    'home.results.burden_desc': 'You spend {percent}% of your income on rent.',
    'home.results.burden_affordable': 'Affordable (< 30%)',
    'home.results.burden_burdened': 'Burdened (30% - 50%)',
    'home.results.burden_severe': 'Severely Burdened (> 50%)',
    'home.results.fmr_title': 'Market Comparison',
    'home.results.fmr_desc': 'The Fair Market Rent for a {bedrooms} BR in {borough} is ${fmr}. Your rent is ${rent}.',
    'home.programs.title': 'Programs You May Qualify For',
    'home.programs.likely_eligible': 'Income within program threshold',
    'home.programs.may_qualify': 'Income near program threshold',
    'home.programs.income_likely_too_high': 'Income above program threshold',
    'home.programs.needs_review': 'Check listing',
    'home.programs.apply': 'Learn More & Apply',
    'home.contacts.title': 'Need Legal Help?',
    'home.contacts.desc': 'If you are facing eviction or harassment, free legal resources are available.',
    'home.contacts.link': 'Find Legal Aid',
    'borough.bronx': 'Bronx',
    'borough.brooklyn': 'Brooklyn',
    'borough.manhattan': 'Manhattan',
    'borough.queens': 'Queens',
    'borough.statenisland': 'Staten Island',
    'bedrooms.studio': 'Studio',
    'bedrooms.1': '1 Bedroom',
    'bedrooms.2': '2 Bedrooms',
    'bedrooms.3': '3 Bedrooms',
    'bedrooms.4': '4+ Bedrooms',
  },
  es: {
    'home.hero.title': 'Entienda su Situación de Alquiler.',
    'home.hero.subtitle': 'Responda algunas preguntas para ver si su alquiler se considera una carga y descubra programas de asistencia de vivienda para los que podría calificar.',
    'home.form.income': 'Ingreso Mensual del Hogar ($)',
    'home.form.size': 'Tamaño del Hogar',
    'home.form.rent': 'Alquiler Mensual Actual ($)',
    'home.form.bedrooms': 'Habitaciones',
    'home.form.borough': 'Condado',
    'home.form.submit': 'Verificar Elegibilidad',
    'home.form.loading': 'Verificando...',
    'home.results.title': 'Sus Resultados',
    'home.results.burden_title': 'Estado de Carga de Alquiler',
    'home.results.burden_desc': 'Usted gasta el {percent}% de sus ingresos en alquiler.',
    'home.results.burden_affordable': 'Asequible (< 30%)',
    'home.results.burden_burdened': 'Con Carga (30% - 50%)',
    'home.results.burden_severe': 'Con Carga Severa (> 50%)',
    'home.results.fmr_title': 'Comparación de Mercado',
    'home.results.fmr_desc': 'El Alquiler Justo de Mercado para un {bedrooms} hab. en {borough} es ${fmr}. Su alquiler es ${rent}.',
    'home.programs.title': 'Programas a los que podría calificar',
    'home.programs.likely_eligible': 'Ingreso dentro del límite del programa',
    'home.programs.may_qualify': 'Ingreso cerca del límite del programa',
    'home.programs.income_likely_too_high': 'Ingreso por encima del límite del programa',
    'home.programs.needs_review': 'Revisar listado',
    'home.programs.apply': 'Más Información y Solicitar',
    'home.contacts.title': '¿Necesita Ayuda Legal?',
    'home.contacts.desc': 'Si enfrenta desalojo o acoso, hay recursos legales gratuitos disponibles.',
    'home.contacts.link': 'Buscar Ayuda Legal',
    'borough.bronx': 'El Bronx',
    'borough.brooklyn': 'Brooklyn',
    'borough.manhattan': 'Manhattan',
    'borough.queens': 'Queens',
    'borough.statenisland': 'Staten Island',
    'bedrooms.studio': 'Estudio',
    'bedrooms.1': '1 Habitación',
    'bedrooms.2': '2 Habitaciones',
    'bedrooms.3': '3 Habitaciones',
    'bedrooms.4': '4+ Habitaciones',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'nido-language';
const txStorageKey = (lang: string) => `nido-tx-${lang}`;

function loadCachedMap(lang: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(txStorageKey(lang));
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveCachedMap(lang: string, map: Record<string, string>): void {
  try {
    localStorage.setItem(txStorageKey(lang), JSON.stringify(map));
  } catch {
    // localStorage full or unavailable — dynamic map still works in memory.
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    } catch { /* ignore */ }
    return 'en';
  });
  // Dynamic translations for the current language: englishSource → translated.
  const [dynamicMap, setDynamicMap] = useState<Record<string, string>>(() =>
    language === 'en' || language === 'es' ? {} : loadCachedMap(language)
  );
  const [isTranslating, setIsTranslating] = useState(false);

  const pendingRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const languageRef = useRef(language);
  languageRef.current = language;
  const dynamicMapRef = useRef(dynamicMap);
  dynamicMapRef.current = dynamicMap;

  const setLanguage = useCallback((lang: string) => {
    if (!LANGUAGES.some((l) => l.code === lang)) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current.clear();
    setLanguageState(lang);
    setDynamicMap(lang === 'en' || lang === 'es' ? {} : loadCachedMap(lang));
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch { /* ignore */ }
  }, []);

  // Keep <html lang dir> in sync (RTL support for Arabic/Urdu/Hebrew).
  useEffect(() => {
    const opt = LANGUAGES.find((l) => l.code === language);
    document.documentElement.lang = language;
    document.documentElement.dir = opt?.rtl ? 'rtl' : 'ltr';
  }, [language]);

  const flushQueue = useCallback(async () => {
    const lang = languageRef.current;
    if (lang === 'en') { pendingRef.current.clear(); return; }
    const texts = Array.from(pendingRef.current).slice(0, 120);
    if (texts.length === 0) return;
    texts.forEach((t) => pendingRef.current.delete(t));
    const opt = LANGUAGES.find((l) => l.code === lang);
    setIsTranslating(true);
    try {
      const resp = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage: opt?.english ?? lang, texts }),
      });
      if (!resp.ok) throw new Error(`translate failed: ${resp.status}`);
      const data = (await resp.json()) as { translations: Record<string, string> };
      // Ignore stale responses if the user switched language mid-flight.
      if (languageRef.current !== lang) return;
      setDynamicMap((prev) => {
        const merged = { ...prev, ...data.translations };
        saveCachedMap(lang, merged);
        return merged;
      });
    } catch (err) {
      console.error('Translation request failed:', err);
      // Leave texts untranslated (English fallback); they can retry on next render.
    } finally {
      setIsTranslating(false);
      if (pendingRef.current.size > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => void flushQueue(), 200);
      }
    }
  }, []);

  const enqueue = useCallback((text: string) => {
    if (pendingRef.current.has(text)) return;
    pendingRef.current.add(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flushQueue(), 200);
  }, [flushQueue]);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    // Resolve the English source: dictionary value if the key exists,
    // otherwise the key itself is treated as literal English text.
    const source = translations.en[key] ?? key;
    let text: string;
    if (language === 'en') {
      text = source;
    } else if (language === 'es' && translations.es[key] !== undefined) {
      text = translations.es[key];
    } else {
      const dyn = dynamicMapRef.current[source];
      if (dyn !== undefined) {
        text = dyn;
      } else {
        enqueue(source);
        text = source; // English fallback until the translation arrives
      }
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }, [language, dynamicMap, enqueue]); // dynamicMap dependency re-renders consumers when translations arrive

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
