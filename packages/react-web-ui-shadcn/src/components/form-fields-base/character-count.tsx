/*
 * @Author: <Tin Tran> (tindl88@gmail.com)
 * @Created: 2024-12-29 20:31:01
 */

import { cn } from '../../lib/utils';

type CharacterCountProps = {
  className?: string;
  visibled?: boolean;
  current: number;
  max?: number;
};

export function CharacterCount({ className, visibled, current, max }: CharacterCountProps) {
  if (!visibled || !max) return null;

  return (
    <div className={cn('text-xs font-medium text-muted-foreground', className)}>
      {current}/{max}
    </div>
  );
}
