import { create } from "zustand";
import translations from "../lib/translations";

export const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem("ams-language") || "en",
  
  setLanguage: (lang) => {
    localStorage.setItem("ams-language", lang);
    set({ language: lang });
  },

  // Get translation by key
  t: (key) => {
    const lang = get().language;
    return translations[lang]?.[key] || translations.en[key] || key;
  },
}));
