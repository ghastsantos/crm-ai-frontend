import { createContext } from 'react';

export type Locale = 'pt-BR' | 'en';

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);
