'use client';

import React, { useEffect, useState } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const formControlVariants = cva(
  'relative grid w-full items-center rounded-md border border-input bg-background leading-none ring-offset-background',
  {
    variants: {
      size: {
        default: 'h-10',
      },
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
      size: 'default',
      state: 'default',
    },
  },
);

const inputContentVariants = cva(
  'w-full bg-transparent px-3 text-sm font-medium file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        default: 'py-1',
        sm: 'py-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  dataTestId?: string;
  size?: 'default';
  error?: boolean;
  labelClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      dataTestId,
      className,
      type,
      labelClassName,
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
    const [inputValue, setInputValue] = useState(defaultValue?.toString() || value.toString() || '');

    const getFormControlState = () => {
      if (disabled) return 'disabled';
      if (readOnly) return 'readOnly';
      if (error) return isFocused ? 'errorFocused' : 'error';
      if (isFocused) return 'focused';
      return 'default';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      props.onChange?.(e);
    };

    useEffect(() => {
      setInputValue(defaultValue?.toString() || value.toString() || '');
    }, [value]);

    return (
      <div className={cn(formControlVariants({ size, state: getFormControlState() }), className)}>
        <input
          {...props}
          data-testid={dataTestId}
          ref={ref}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          value={value || inputValue}
          className={cn(inputContentVariants({ size }), 'scrollbar peer', disabled && 'opacity-50')}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
