import type { Language } from '../interfaces/language.interface';

export const LANGUAGES: Language[] = [{ name: 'English', code: 'en-us', isDefault: true }];

export const LANGUAGE_LABELS = LANGUAGES.reduce(
  (acc, lang) => {
    acc[lang.code] = lang.name;

    return acc;
  },
  {} as Record<string, string>,
);
