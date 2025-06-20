/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2024-12-29 20:30:27
 */

import { InfoIcon } from 'lucide-react';

import { cn } from '../../lib/utils';

type HelperTextProps = {
  text?: string;
  className?: string;
};

export function HelperText({ className, text }: HelperTextProps) {
  if (!text) return null;

  return (
    <div className={cn('flex items-center gap-1 text-xs font-medium text-cyan-600', className)}>
      <InfoIcon className="size-4" />
      {text}
    </div>
  );
}
