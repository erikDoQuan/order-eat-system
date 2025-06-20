'use client';

import React, { useEffect, useState } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const formControlVariants = cva(
  'relative grid w-full items-center rounded-md border border-input bg-background leading-none ring-offset-background',
  {
    variants: {
      state: {
        default: '',
        focused: 'ring-2 ring-ring ring-offset-2',
        disabled: 'cursor-not-allowed bg-muted',
        readOnly: 'cursor-not-allowed bg-muted',
        error: 'border-destructive bg-destructive/10',
        errorFocused: 'bg-destructive/10 ring-2 ring-destructive ring-offset-2',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
);

const textareaContentVariants = cva(
  'w-full bg-transparent px-3 py-2 text-sm font-medium placeholder:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed',
  {
    variants: {},
    defaultVariants: {},
  },
);

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  dataTestId?: string;
  error?: boolean;
  inputClassName?: string;
  labelClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      dataTestId,
      className,
      inputClassName,
      labelClassName,
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
    const [textareaValue, setTextareaValue] = useState((defaultValue?.toString() ?? value.toString()) || '');

    const getFormControlState = () => {
      if (disabled) return 'disabled';
      if (readOnly) return 'readOnly';
      if (error) return isFocused ? 'errorFocused' : 'error';
      if (isFocused) return 'focused';
      return 'default';
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextareaValue(e.target.value);
      props.onChange?.(e);
    };

    useEffect(() => {
      setTextareaValue((defaultValue?.toString() ?? value.toString()) || '');
    }, [value]);

    return (
      <div className={cn(formControlVariants({ state: getFormControlState() }), className)}>
        <textarea
          {...props}
          data-testid={dataTestId}
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          value={value || textareaValue}
          className={cn(textareaContentVariants(), inputClassName, 'scrollbar peer', disabled && 'opacity-50')}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
        />
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
