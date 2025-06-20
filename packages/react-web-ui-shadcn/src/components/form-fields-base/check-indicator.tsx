/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2024-12-29 20:29:49
 */

import type { FC } from 'react';
import { CircleCheckBigIcon, InfoIcon } from 'lucide-react';

import type { Translation } from '@loyalty-system/shared-universal';

import { cn } from '../../lib/utils';

type CheckIndicatorProps = {
  className?: string;
  values: Translation[];
  lang: string;
  error?: boolean;
};

export const CheckIndicator: FC<CheckIndicatorProps> = ({ className, values = [], lang, error }) => {
  const hasValue = values.find(item => item.lang === lang)?.value.trim();

  if (!hasValue) return null;

  if (error) {
    return <InfoIcon size={12} className={cn(className, 'text-destructive')} />;
  } else {
    return <CircleCheckBigIcon size={12} className={cn(className, 'text-primary')} />;
  }
};
