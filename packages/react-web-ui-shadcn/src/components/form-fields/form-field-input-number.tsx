import type { IInputProps } from '@/components/ahua';
import type { ControllerRenderProps, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ahua';
import { HelperText } from '@/components/form-fields-base/helper-text';
import { FormField } from '@/components/ui';
import { FormControl, FormItem, FormMessage } from '@/components/ui/form';

import type { AutocompleteTypes } from '@loyalty-system/shared-web';

interface FormFieldInputNumberProps<T extends FieldValues> extends Omit<IInputProps, 'form' | 'onChange' | 'pattern'> {
  messageClassName?: string;
  form: UseFormReturn<T>;
  formLabel?: string;
  fieldName: Path<T>;
  visible?: boolean;
  required?: boolean;
  autoComplete?: AutocompleteTypes;
  showErrorMessage?: boolean;
  helperText?: string;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  maxDecimalPlaces?: number;
  translator?: any;
  step?: number;
  onChange?: (value: string) => void;
}

export function FormFieldInputNumber<T extends FieldValues>({
  className,
  messageClassName,
  form,
  formLabel,
  fieldName,
  placeholder = '',
  visible = true,
  labelDisplay = 'inside',
  disabled,
  readOnly,
  size = 'default',
  required,
  autoComplete = 'off',
  showErrorMessage = true,
  helperText,
  minLength,
  maxLength = 10,
  min,
  max,
  allowDecimal = false,
  allowNegative = false,
  maxDecimalPlaces,
  translator,
  step,
  onChange,
}: FormFieldInputNumberProps<T>) {
  if (!visible) return null;

  const getValidationPattern = (maxLength: number, allowDecimal: boolean, allowNegative: boolean, maxDecimalPlaces?: number): string => {
    const decimalLimit = maxDecimalPlaces !== undefined ? maxDecimalPlaces : maxLength;

    if (allowDecimal) {
      const negativePrefix = allowNegative ? '-?' : '';
      const regularPattern = `[1-9]\\d{0,${maxLength - 1}}(\\.\\d{1,${decimalLimit}})?`;
      const zeroPattern = `0(\\.\\d{1,${decimalLimit}})?`;

      return `^${negativePrefix}(${regularPattern}|${zeroPattern})$`;
    } else {
      return `^${allowNegative ? '-?' : ''}\\d{1,${maxLength}}$`;
    }
  };

  const validateNumberLength = (value: string, maxLength: number): boolean => {
    const [integerPart] = value.split('.');
    const integerLength = integerPart?.replace('-', '').length ?? 0;
    if (integerLength > maxLength) return false;

    const numericLength = value.replace(/[-.]/g, '').length;
    return numericLength <= maxLength;
  };

  const validateNumberBounds = (value: string, min?: number, max?: number): boolean => {
    const numValue = Number(value);
    if (isNaN(numValue)) return true;
    if (min !== undefined && numValue < min) return false;
    if (max !== undefined && numValue > max) return false;
    return true;
  };

  const validateNumberInput = (value: string): boolean => {
    if (value === '' || (allowNegative && value === '-')) return true;

    const pattern = getValidationPattern(maxLength, allowDecimal, allowNegative, maxDecimalPlaces);
    const regex = new RegExp(pattern);
    if (!regex.test(value)) return false;

    if (!validateNumberLength(value, maxLength) || !validateNumberBounds(value, min, max)) return false;

    if (step !== undefined) {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        const remainder = (numValue - (min || 0)) % step;
        const epsilon = 1e-10;
        if (Math.abs(remainder) > epsilon && Math.abs(remainder - step) > epsilon) {
          return false;
        }
      }
    }

    return true;
  };

  const adjustValueToBounds = (value: string, field: ControllerRenderProps<T, Path<T>>): void => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return;

    let adjustedValue = numericValue;
    if (min !== undefined && numericValue < min) adjustedValue = min;
    if (max !== undefined && numericValue > max) adjustedValue = max;

    if (adjustedValue !== numericValue) {
      const stringValue = adjustedValue.toString();
      field.onChange(adjustedValue);
      onChange?.(stringValue);
    } else {
      onChange?.(value);
      field.onChange(numericValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: ControllerRenderProps<T, Path<T>>): void => {
    const currentValue = field.value?.toString() || '';
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const selectionLength = (input.selectionEnd || 0) - cursorPosition;
    const isAllSelected = selectionLength === currentValue.length && currentValue.length > 0;

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape', 'Home', 'End'].includes(e.key)) return;

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const numValue = Number(currentValue) || 0;
      const stepValue = step || 1;
      const stepDirection = e.key === 'ArrowUp' ? stepValue : -stepValue;

      let newValue = numValue + stepDirection;
      if (min !== undefined) newValue = Math.max(newValue, min);
      if (max !== undefined) newValue = Math.min(newValue, max);

      if (allowDecimal && maxDecimalPlaces !== undefined) {
        newValue = Number(newValue.toFixed(maxDecimalPlaces));
      }

      if (validateNumberInput(newValue.toString())) {
        field.onChange(newValue);
        onChange?.(newValue.toString());
      }
      return;
    }

    if (/^\d$/.test(e.key)) {
      if (isAllSelected) {
        e.preventDefault();
        const newValue = e.key;
        if (validateNumberInput(newValue)) {
          field.onChange(Number(newValue));
          onChange?.(newValue);
        }
        return;
      }

      if (allowDecimal && maxDecimalPlaces !== undefined && currentValue.includes('.')) {
        const parts = currentValue.split('.');
        const decimalPart = parts[1] || '';
        const decimalPointIndex = currentValue.indexOf('.');

        if (cursorPosition > decimalPointIndex && decimalPart.length >= maxDecimalPlaces) {
          if (cursorPosition <= decimalPointIndex + decimalPart.length + 1) {
            e.preventDefault();
            return;
          }
        }
      }

      const newValue = currentValue.slice(0, cursorPosition) + e.key + currentValue.slice(cursorPosition + selectionLength);
      if (!validateNumberInput(newValue)) {
        e.preventDefault();
      }
      return;
    }

    if (e.key === '-') {
      if (isAllSelected && allowNegative) {
        e.preventDefault();
        field.onChange('-');
        onChange?.('-');
        return;
      }

      if (!allowNegative || cursorPosition !== 0 || currentValue.includes('-') || (min !== undefined && min >= 0)) {
        e.preventDefault();
      }
      return;
    }

    if (e.key === '.') {
      if (isAllSelected && allowDecimal) {
        e.preventDefault();
        field.onChange('0.');
        onChange?.('0.');
        return;
      }

      if (!allowDecimal || currentValue.includes('.') || currentValue === '' || currentValue === '-') {
        e.preventDefault();
      }
      return;
    }

    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const handleChange = (value: string, field: ControllerRenderProps<T, Path<T>>): void => {
    if (value === '' || (allowNegative && value === '-')) {
      onChange?.(value);
      field.onChange(value === '' ? null : value);
      return;
    }

    if (value === '0' && allowDecimal) {
      onChange?.(value);
      field.onChange(0);
      return;
    }

    if (allowDecimal && (value === '.' || value === '-.')) {
      const prefixedValue = value.startsWith('-') ? '-0.' : '0.';
      onChange?.(prefixedValue);
      field.onChange(prefixedValue);
      return;
    }

    if (allowDecimal && value.endsWith('.')) {
      onChange?.(value);
      field.onChange(value);
      return;
    }

    if (allowDecimal && /^-?0\.\d+$/.test(value)) {
      const numValue = parseFloat(value);
      if (min === undefined || numValue >= min) {
        if (max === undefined || numValue <= max) {
          onChange?.(value);
          field.onChange(numValue);
          return;
        }
      }
    }

    if (allowDecimal && maxDecimalPlaces !== undefined && value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > maxDecimalPlaces) {
        const truncatedValue = `${parts[0]}.${parts[1].substring(0, maxDecimalPlaces)}`;

        if (validateNumberInput(truncatedValue)) {
          adjustValueToBounds(truncatedValue, field);
          return;
        }
      }
    }

    if (validateNumberInput(value)) {
      adjustValueToBounds(value, field);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, field: ControllerRenderProps<T, Path<T>>): void => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const input = e.target as HTMLInputElement;
    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    const currentValue = field.value?.toString() || '';
    const isAllSelected = selectionStart === 0 && selectionEnd === currentValue.length && currentValue.length > 0;

    if (isAllSelected) {
      if (validateNumberInput(pastedText)) {
        adjustValueToBounds(pastedText, field);
      }
      return;
    }

    const newValue = currentValue.slice(0, selectionStart) + pastedText + currentValue.slice(selectionEnd);

    if (allowDecimal && maxDecimalPlaces !== undefined && newValue.includes('.')) {
      const parts = newValue.split('.');
      if (parts[1] && parts[1].length > maxDecimalPlaces) {
        const truncatedValue = `${parts[0]}.${parts[1].substring(0, maxDecimalPlaces)}`;

        if (validateNumberInput(truncatedValue)) {
          adjustValueToBounds(truncatedValue, field);
          return;
        }
      }
    }

    if (validateNumberInput(newValue)) {
      adjustValueToBounds(newValue, field);
    }
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field, fieldState: { error } }) => (
        <FormItem className={className}>
          <FormControl>
            <Input
              {...field}
              labelDisplay={labelDisplay}
              autoComplete={autoComplete}
              required={required}
              placeholder={placeholder}
              label={formLabel}
              value={field.value ?? ''}
              disabled={disabled}
              readOnly={readOnly}
              size={size}
              error={!!error}
              onKeyDown={e => handleKeyDown(e, field)}
              onChange={e => handleChange(e.target.value, field)}
              onPaste={e => handlePaste(e, field)}
            />
          </FormControl>
          {!error && <HelperText text={helperText} />}
          {showErrorMessage && error?.message && (
            <FormMessage
              className={messageClassName}
              message={translator ? translator?.(error.message, { min: minLength, max: maxLength }) : error.message}
            />
          )}
        </FormItem>
      )}
    />
  );
}
