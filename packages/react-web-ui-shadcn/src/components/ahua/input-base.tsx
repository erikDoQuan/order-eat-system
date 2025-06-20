import type { FC, LabelHTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { FormLabel } from '../ui/form';

const inputLabelVariants = cva('block px-3 font-medium text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70', {
  variants: {
    size: {
      default: 'text-[12px] !leading-[26px]',
      sm: 'text-[10px] !leading-[16px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface IInputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  required?: boolean;
  size?: 'default' | 'sm';
}

export const InputLabel: FC<IInputLabelProps> = ({ className, label, required, size = 'default', ...rest }) => (
  <FormLabel className={cn(inputLabelVariants({ size }), className)} {...rest}>
    {label}
    {required && <span className="ml-0.5 text-destructive">*</span>}
  </FormLabel>
);

export const InputLabelOutside: FC<IInputLabelProps> = ({ className, label, required, ...rest }) => (
  <FormLabel className={cn(className)} {...rest}>
    {label}
    {required && <span className="ml-0.5 text-destructive">*</span>}
  </FormLabel>
);
