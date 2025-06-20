import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import type { GroupOption, OptionType, SelectGroupProps } from '../ahua/select-group';
import { SelectGroup } from '../ahua/select-group';
import { HelperText } from '../form-fields-base/helper-text';
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form';

type StringKeyOf<T> = Extract<keyof T, string>;

type FormFieldSelectGroupProps<T extends FieldValues, O extends OptionType> = Omit<
  SelectGroupProps<O>,
  'form' | 'onChange' | 'value' | 'valueField' | 'displayField'
> & {
  labelClassName?: string;
  messageClassName?: string;
  form: UseFormReturn<T>;
  formLabel?: string;
  fieldName: Path<T>;
  options: GroupOption<O>[];
  visibled?: boolean;
  valueField?: StringKeyOf<O>;
  displayField?: StringKeyOf<O>;
  size?: 'default' | 'sm';
  required?: boolean;
  showErrorMessage?: boolean;
  helperText?: string;
  translator?: any;
  onChange?: (value: unknown[]) => void;
};

export function FormFieldSelectGroup<T extends FieldValues, O extends OptionType>({
  className,
  messageClassName,
  form,
  formLabel,
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
}: FormFieldSelectGroupProps<T, O>) {
  if (!visibled) return null;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field, fieldState: { error } }) => {
        return (
          <FormItem className={className}>
            <FormControl>
              <SelectGroup
                {...field}
                placeholder={placeholder}
                label={formLabel}
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
                required={required}
                error={!!error}
                loading={loading}
                onChange={(value: unknown[]) => {
                  field.onChange(value as O[]);
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
