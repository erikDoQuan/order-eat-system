'use client';

import type * as LabelPrimitive from '@radix-ui/react-label';
import type { ControllerProps, FieldError, FieldPath, FieldValues } from 'react-hook-form';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';

import { cn } from '../../lib/utils';
import { Label } from '../ui/label';

const Form = FormProvider;

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-1', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField();

    return <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />;
  },
);
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return <p ref={ref} id={formDescriptionId} className={cn('text-sm text-muted-foreground', className)} {...props} />;
});
FormDescription.displayName = 'FormDescription';

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string;
}

const getErrorMessage = (error: FieldError | undefined): string | undefined => {
  if (!error) return undefined;

  // Case 1: Direct message property
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  // Case 2: Array of errors (e.g. from Zod array validation)
  if (Array.isArray(error)) {
    const messages: string[] = [];
    error.forEach(item => {
      if (typeof item === 'object' && item?.message) {
        messages.push(item.message);
      }
    });
    return messages.length > 0 ? messages[0] : undefined;
  }

  // Case 3: Nested validation errors (e.g. from Zod object validation)
  if (typeof error === 'object') {
    // First check if there's a direct message in any of the first-level properties
    for (const key in error) {
      const value = (error as any)[key];
      if (typeof value === 'object' && value?.message) {
        return value.message;
      }
    }

    // If no direct message found, recursively search nested objects
    const findNestedMessage = (obj: any): string | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;

      // Check current level for message
      if ('message' in obj && typeof obj.message === 'string') {
        return obj.message;
      }

      // Check all nested properties
      for (const key in obj) {
        const nestedMessage = findNestedMessage(obj[key]);
        if (nestedMessage) return nestedMessage;
      }

      return undefined;
    };

    return findNestedMessage(error);
  }

  // Case 4: String error
  if (typeof error === 'string') {
    return error;
  }

  // Default: stringify the error
  return String(error);
};

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(({ className, children, message, ...props }, ref) => {
  const { error, formMessageId } = useFormField();

  const errorMessage = message || getErrorMessage(error);
  const body = errorMessage || children;

  if (!body) {
    return null;
  }

  return (
    <p ref={ref} id={formMessageId} className={cn('text-xs font-medium text-destructive', className)} {...props}>
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
