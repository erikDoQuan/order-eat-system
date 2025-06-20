import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

type Option = {
  label: string;
  value: string;
  description?: string;
};

type FormFieldRadioBlockProps<T extends FieldValues> = {
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
};

export function FormFieldRadioBlock<T extends FieldValues>({
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
}: FormFieldRadioBlockProps<T>) {
  if (!visibled) return null;

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
              className="flex items-center space-x-2"
              defaultValue={defaultValue}
              value={field.value}
              disabled={disabled}
              required={required}
              onValueChange={field.onChange}
            >
              {options.map(option => (
                <div key={option.value} className="relative flex w-full items-center space-x-2 rounded-md border p-2">
                  <RadioGroupItem value={option.value} id={`${fieldName}-${option.value}`} className="sr-only" />
                  <div className="flex space-x-2">
                    <div className="mt-[2px]">
                      <div
                        className={`icon flex size-4 items-center justify-center rounded-full border ${field.value === option.value ? 'border-primary' : 'border-gray-200'} `}
                      >
                        <div className={`size-2 rounded-full ${field.value === option.value ? 'bg-primary' : 'bg-transparent'} `} />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      {option.description && <p className="mt-1.5 text-xs">{option.description}</p>}
                    </div>
                  </div>
                  <Label className="absolute left-0 top-0 size-full cursor-pointer" htmlFor={`${fieldName}-${option.value}`}></Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {showErrorMessage && <FormMessage className={messageClassName} />}
        </FormItem>
      )}
    />
  );
}
