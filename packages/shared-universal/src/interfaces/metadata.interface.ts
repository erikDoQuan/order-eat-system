/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2025-01-13 20:25:05
 */

import type { Translation } from './language.interface';

export type SeoMetadata = {
  titleLocalized?: Translation[];
  descriptionLocalized?: Translation[];
  keywords?: string;
};
