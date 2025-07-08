

import type { Language } from '../interfaces/language.interface';
import { LANGUAGES } from '../constants/language.constant';

export const getLanguages = (locale: string): Language[] => {
  return LANGUAGES.sort((a, b) => (a.code === locale ? -1 : b.code === locale ? 1 : 0));
};
