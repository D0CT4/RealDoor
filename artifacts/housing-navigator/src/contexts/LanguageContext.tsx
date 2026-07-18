import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
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
    'home.programs.likely_eligible': 'Likely eligible',
    'home.programs.may_qualify': 'May qualify',
    'home.programs.income_likely_too_high': 'Income may be too high',
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
    'home.programs.likely_eligible': 'Probablemente elegible',
    'home.programs.may_qualify': 'Podría calificar',
    'home.programs.income_likely_too_high': 'El ingreso podría ser demasiado alto',
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
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
