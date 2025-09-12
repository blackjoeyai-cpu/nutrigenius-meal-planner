'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Language = 'English' | 'Malay';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    set => ({
      language: 'English',
      setLanguage: language => set({ language }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
