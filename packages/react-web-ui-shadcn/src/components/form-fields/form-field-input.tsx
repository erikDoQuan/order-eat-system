import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import type { AutocompleteTypes } from '@loyalty-system/shared-web';

import type { IInputProps } from '../ahua/input';
import { Input } from '../ahua/input';
import { CharacterCount } from '../form-fields-base/character-count';
import { HelperText } from '../form-fields-base/helper-text';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';

interface IFormFieldInputProps<T extends FieldValues> extends Omit<IInputProps, 'form' | 'onChange' | 'pattern'> {
  messageClassName?: string;
  form: UseFormReturn<T>;
  formLabel?: string;
  fieldName: Path<T>;
  visibled?: boolean;
  multiple?: boolean;
  required?: boolean;
  autoComplete?: AutocompleteTypes;
  showErrorMessage?: boolean;
  helperText?: string;
  showCharacterCount?: boolean;
  pattern?: {
    regex: RegExp;
    message?: string;
  };
  translator?: any;
  onChange?: (value: string) => void;
}

export function FormFieldInput<T extends FieldValues>({
  className,
  messageClassName,
  form,
  formLabel,
  fieldName,
  placeholder = '',
  visibled = true,
  labelDisplay = 'inside',
  disabled,
  readOnly,
  size = 'default',
  multiple,
  required,
  showErrorMessage = true,
  helperText,
  showCharacterCount = false,
  minLength,
  maxLength,
  pattern,
  translator,
  onChange,
}: IFormFieldInputProps<T>) {
  if (!visibled) return null;

  const inputValue = form.watch(fieldName);
  const shouldShowCount = !helperText && showCharacterCount && maxLength !== undefined;
  const currentLength = inputValue?.length || 0;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field, fieldState: { error } }) => {
        return (
          <FormItem className={className}>
            <FormControl>
              <Input
                {...field}
                labelDisplay={labelDisplay}
                multiple={multiple}
                required={required}
                placeholder={placeholder}
                label={formLabel}
                value={field.value}
                disabled={disabled}
                readOnly={readOnly}
                size={size}
                error={!!error}
                maxLength={maxLength}
                onKeyDown={e => {
                  if (pattern?.regex) {
                    const char = e.key;

                    if (!pattern.regex.test(char)) {
                      e.preventDefault();

                      return;
                    }
                  }
                }}
                onChange={e => {
                  const value = e.target.value;

                  if (maxLength && value.length > maxLength) return;

                  onChange?.(value);
                  field.onChange(value);
                }}
              />
            </FormControl>
            {!error && (
              <>
                <HelperText text={helperText} />
                <CharacterCount current={currentLength} max={maxLength} visibled={shouldShowCount} />
              </>
            )}
            {showErrorMessage && error?.message && (
              <FormMessage
                className={messageClassName}
                message={translator ? translator?.(error.message, { min: minLength, max: maxLength }) : error.message}
              />
            )}
          </FormItem>
        );
      }}
    />
  );
}
