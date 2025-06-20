import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { cn } from '../../lib/utils';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

type Option = {
  label: string;
  value: string;
  description?: string;
};

type FormFieldRadioButtonGroupProps<T extends FieldValues> = {
  dataTestId?: string;
  className?: string;
  messageClassName?: string;
  form: UseFormReturn<T>;
  formLabel?: string;
  fieldName: Path<T>;
  options: Option[];
  disabled?: boolean;
  visibled?: boolean;
  required?: boolean;
  showErrorMessage?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export const FormFieldRadioButtonGroup = <T extends FieldValues>({
  dataTestId,
  className,
  messageClassName,
  form,
  formLabel,
  fieldName,
  options,
  disabled,
  visibled = true,
  required,
  showErrorMessage = true,
  defaultValue,
  onChange,
}: FormFieldRadioButtonGroupProps<T>) => {
  if (!visibled) return null;

  const handleValueChange = (value: string) => {
    if (disabled) return;
    onChange?.(value);
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className={className}>
          {formLabel && <FormLabel>{formLabel}</FormLabel>}
          <FormControl>
            <RadioGroup
              data-testid={dataTestId}
              defaultValue={defaultValue}
              value={field.value}
              disabled={disabled}
              required={required}
              className="inline-flex gap-0 rounded-lg"
              onValueChange={value => {
                if (disabled) return;
                field.onChange(value);
                handleValueChange(value);
              }}
            >
              {options.map((option, index) => (
                <div key={option.value} className={cn('relative', disabled && 'pointer-events-none')}>
                  <RadioGroupItem disabled={disabled} value={option.value} id={`${fieldName}-${option.value}`} className="peer sr-only" />
                  <label
                    htmlFor={`${fieldName}-${option.value}`}
                    className={cn(
                      'inline-flex h-10 min-w-[50px] cursor-pointer select-none items-center justify-center border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground',
                      index === 0 && 'rounded-l-md border-r-0',
                      index === options.length - 1 && 'rounded-r-md',
                      index > 0 && index < options.length - 1 && 'border-r-0',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                    aria-disabled={disabled}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {showErrorMessage && <FormMessage className={messageClassName} />}
        </FormItem>
      )}
    />
  );
};
