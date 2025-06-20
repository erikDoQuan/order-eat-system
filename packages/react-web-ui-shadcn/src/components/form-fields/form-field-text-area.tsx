import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import type { AutocompleteTypes } from '@loyalty-system/shared-web';

import type { ITextareaProps } from '../ahua/textarea';
import { Textarea } from '../ahua/textarea';
import { CharacterCount } from '../form-fields-base/character-count';
import { HelperText } from '../form-fields-base/helper-text';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';

interface IFormFieldTextAreaProps<T extends FieldValues> extends Omit<ITextareaProps, 'form' | 'onChange' | 'pattern'> {
  messageClassName?: string;
  form: UseFormReturn<T>;
  formLabel?: string;
  fieldName: Path<T>;
  visibled?: boolean;
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

export function FormFieldTextArea<T extends FieldValues>({
  className,
  messageClassName,
  textareaClassName,
  form,
  formLabel,
  fieldName,
  placeholder = '',
  visibled = true,
  labelDisplay = 'inside',
  disabled,
  readOnly,
  size = 'default',
  required,
  showErrorMessage = true,
  helperText,
  showCharacterCount = false,
  minLength,
  maxLength,
  pattern,
  translator,
  onChange,
}: IFormFieldTextAreaProps<T>) {
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
              <Textarea
                {...field}
                textareaClassName={textareaClassName}
                labelDisplay={labelDisplay}
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
