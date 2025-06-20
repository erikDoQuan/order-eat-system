import React, { useState } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { InputLabel, InputLabelOutside } from './input-base';

const formControlVariants = cva(
  'relative grid w-full items-center rounded-md border border-input bg-background leading-none ring-offset-background',
  {
    variants: {
      size: {
        default: '',
        sm: 'h-20',
      },
      state: {
        default: '',
        focused: 'ring-2 ring-ring ring-offset-2',
        disabled: 'cursor-not-allowed bg-muted',
        readOnly: 'cursor-not-allowed bg-muted text-foreground',
        error: 'border-destructive bg-destructive/10',
        errorFocused: 'bg-destructive/10 ring-2 ring-destructive ring-offset-2',
      },
    },
    defaultVariants: {
      size: 'default',
      state: 'default',
    },
  },
);

const inputContentVariants = cva(
  'w-full bg-transparent px-3 text-sm font-medium placeholder:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        default: 'min-h-24 py-1',
        sm: 'py-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface ITextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  labelDisplay?: 'inside' | 'outside';
  required?: boolean;
  size?: 'default' | 'sm';
  labelClassName?: string;
  textareaClassName?: string;
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, ITextareaProps>(
  (
    {
      className,
      label,
      labelDisplay = 'inside',
      labelClassName,
      textareaClassName,
      required = false,
      size = 'default',
      disabled = false,
      readOnly = false,
      error,
      maxLength,
      value = '',
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const ID = new Date().getTime();

    const getFormControlState = () => {
      if (disabled) return 'disabled';
      if (readOnly) return 'readOnly';
      if (error) return isFocused ? 'errorFocused' : 'error';
      if (isFocused) return 'focused';
      return 'default';
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      props.onChange?.(e);
    };

    return (
      <>
        {label && labelDisplay === 'outside' && (
          <InputLabelOutside htmlFor={`textarea-${ID}`} label={label} required={required} className={cn(labelClassName)} />
        )}
        <div className={cn(formControlVariants({ size, state: getFormControlState() }), className)}>
          <div>
            {label && labelDisplay === 'inside' && (
              <InputLabel htmlFor={`textarea-${ID}`} label={label} required={required} size={size} className={cn(labelClassName)} />
            )}
            <textarea
              {...props}
              id={`textarea-${ID}`}
              ref={ref}
              disabled={disabled}
              readOnly={readOnly}
              maxLength={maxLength}
              value={value}
              className={cn('scrollbar', inputContentVariants({ size }), 'peer', textareaClassName, disabled && 'opacity-50')}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={handleChange}
            />
          </div>
        </div>
      </>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
