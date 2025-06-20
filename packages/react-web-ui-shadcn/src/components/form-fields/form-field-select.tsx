import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import type { OptionType, SelectProps } from '../ahua/select';
import { Select } from '../ahua/select';
import { HelperText } from '../form-fields-base/helper-text';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';

type StringKeyOf<T> = Extract<keyof T, string>;

type FormFieldSelectProps<T extends FieldValues, O extends OptionType> = Omit<
  SelectProps<O>,
  'form' | 'onChange' | 'value' | 'valueField' | 'displayField'
> & {
  messageClassName?: string;
  form: UseFormReturn<T>;
  formLabel?: string;
  popoverLabel?: string;
  fieldName: Path<T>;
  visibled?: boolean;
  showErrorMessage?: boolean;
  helperText?: string;
  valueField?: StringKeyOf<O>;
  displayField?: StringKeyOf<O>;
  value?: unknown | unknown[];
  translator?: any;
  onChange?: (value: unknown | unknown[]) => void;
  onPopoverLabelClick?: () => void;
};

export function FormFieldSelect<T extends FieldValues, O extends OptionType>({
  className,
  messageClassName,
  form,
  formLabel,
  popoverLabel,
  fieldName,
  labelDisplay = 'inside',
  options = [],
  placeholder = '',
  visibled = true,
  disabled,
  readOnly,
  valueField = 'id' as StringKeyOf<O>,
  displayField = 'name' as StringKeyOf<O>,
  size = 'default',
  required,
  multiple = false,
  showSearch = true,
  showClearAll = false,
  showSelectAll = false,
  showSelectedTags = false,
  showErrorMessage = true,
  helperText,
  loading = false,
  translator,
  onSearch,
  onFocus,
  onLoadMore,
  onChange,
  onPopoverLabelClick,
}: FormFieldSelectProps<T, O>) {
  if (!visibled) return null;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field, fieldState: { error } }) => {
        return (
          <FormItem className={className}>
            <FormControl>
              <Select
                {...field}
                multiple={multiple}
                required={required}
                placeholder={placeholder}
                label={formLabel}
                popoverLabel={popoverLabel}
                onPopoverLabelClick={onPopoverLabelClick}
                labelDisplay={labelDisplay}
                valueField={valueField}
                displayField={displayField}
                options={options}
                value={field.value}
                disabled={disabled}
                readOnly={readOnly}
                size={size}
                showSearch={showSearch}
                showClearAll={showClearAll}
                showSelectAll={showSelectAll}
                showSelectedTags={showSelectedTags}
                error={!!error}
                loading={loading}
                onChange={(value: unknown | unknown[]) => {
                  if (multiple) {
                    field.onChange(value as O[]);
                  } else {
                    field.onChange(value as string);
                  }
                  onChange?.(value);
                }}
                onSearch={onSearch}
                onFocus={onFocus}
                onLoadMore={onLoadMore}
              />
            </FormControl>
            {!error && <HelperText text={helperText} />}
            {showErrorMessage && error?.message && (
              <FormMessage className={messageClassName} message={translator ? translator(error.message || '') : error.message} />
            )}
          </FormItem>
        );
      }}
    />
  );
}
