"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import en from "@/locales/en.json";
import ms from "@/locales/ms.json";

const translations = { en, ms };

type Language = "en" | "ms";

type LocalizationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined,
);

export const LocalizationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language | null;
    if (storedLang && ["en", "ms"].includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = useCallback(
    (key: string): string => {
      return translations[language][key as keyof typeof translations[Language]] || key;
    },
    [language],
  );

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LocalizationProvider");
  }
  return context;
};
