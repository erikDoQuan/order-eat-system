import type { Editor } from 'ckeditor5';
import type { VariantProps } from 'class-variance-authority';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { lazy, Suspense, useState } from 'react';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'use-intl';

import type { Language, Translation } from '@loyalty-system/shared-universal';

import { cn } from '../../lib/utils';
import { CheckIndicator } from '../form-fields-base/check-indicator';
import { Button } from '../ui/button';
import { Command, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Loading } from '../ui/loading';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const CKEditor = lazy(() => import('../editors/ck-editor'));

const container = cva('w-full rounded-md border border-input bg-background ring-offset-background', {
  variants: {
    state: {
      default: '',
      focused: 'ring-2 ring-ring ring-offset-2',
      disabled: 'cursor-not-allowed bg-muted',
      readOnly: 'cursor-not-allowed bg-muted text-foreground',
      error: 'border-destructive bg-destructive/10',
      errorFocused: 'bg-destructive/10 ring-2 ring-destructive ring-offset-2',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

const tab = cva('relative h-full whitespace-nowrap px-3 text-sm transition-colors focus:outline-none', {
  variants: {
    state: {
      default: 'text-muted-foreground',
      active: 'text-primary',
      error: 'text-destructive',
      disabled: 'cursor-not-allowed opacity-50',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

const label = cva('font-medium', {
  variants: {
    state: {
      default: '',
      error: 'text-destructive',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

interface IFormFieldCKEditorMultiLanguageProps<T extends FieldValues> extends VariantProps<typeof container> {
  dataTestId?: string;
  className?: string;
  messageClassName?: string;
  form: UseFormReturn<T>;
  formLabel?: string;
  fieldName: Path<T>;
  locales: Language[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  visibled?: boolean;
  required?: boolean;
  showErrorMessage?: boolean;
  maxVisible?: number;
  minLength?: number;
  maxLength?: number;
  minHeight?: number;
  toolbar?: string[];
  editorRef: React.MutableRefObject<Editor | null>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  setVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FormFieldCKEditorMultiLanguage<T extends FieldValues>({
  dataTestId,
  className,
  messageClassName,
  form,
  formLabel,
  fieldName,
  locales,
  placeholder = 'Type something...',
  visibled = true,
  disabled = false,
  readOnly = false,
  required,
  showErrorMessage = true,
  maxVisible = 4,
  minLength,
  maxLength,
  minHeight = 360,
  toolbar,
  editorRef,
  setVisible,
}: IFormFieldCKEditorMultiLanguageProps<T>) {
  const t = useTranslations();
  const [activeLocale, setActiveLocale] = useState(locales[0]!.code);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  const visibleLocales = locales.slice(0, maxVisible);
  const dropdownLocales = locales.slice(maxVisible);

  const getCharCount = (values: Translation[] = [], lang: string): number => {
    const value = values.find(item => item.lang === lang)?.value || '';

    const valueOnlyText = value.replace(/<\/?[^>]+(>|$)/g, '');

    return valueOnlyText.length || 0;
  };

  const isOverMaxLength = (values: Translation[] = [], lang: string): boolean => {
    if (typeof maxLength === 'undefined') {
      return false;
    }
    return getCharCount(values, lang) > maxLength;
  };

  const getFormControlState = (error?: boolean) => {
    if (disabled) return 'disabled';
    if (readOnly) return 'readOnly';
    if (error) return isFocused ? 'errorFocused' : 'error';
    if (isFocused) return 'focused';

    return 'default';
  };

  const getTabState = (isActive: boolean, hasError: boolean) => {
    if (disabled) return 'disabled';
    if (hasError) return 'error';
    if (isActive) return 'active';

    return 'default';
  };

  const handleInputChange = (
    field: {
      value?: Translation[];
      onChange: (value: Translation[]) => void;
    },
    lang: string,
    value: string,
  ) => {
    const values = [...(field.value || [])];
    const index = values.findIndex(v => v.lang === lang);

    if (index >= 0) {
      // @ts-expect-error - TODO: fix this
      values[index] = { ...values[index], value };
    } else {
      values.push({ lang, value });
    }

    field.onChange(values);
  };

  if (!visibled) return null;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          {formLabel && (
            <FormLabel className={label({ state: error ? 'error' : 'default' })}>
              {formLabel}
              {required && <span className="ml-0.5 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div data-testid={dataTestId} className={cn(container({ state: getFormControlState(!!error) }), className)}>
              <div className="flex flex-col">
                <div className="order-2">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-3">
                        <Loading />
                      </div>
                    }
                  >
                    <CKEditor
                      {...field}
                      className="borderless backgroundless"
                      toolbar={toolbar}
                      minHeight={minHeight}
                      disabled={disabled}
                      readOnly={readOnly}
                      placeholder={placeholder}
                      value={field.value?.find((item: Translation) => item.lang === activeLocale)?.value || ''}
                      onChange={value => handleInputChange(field, activeLocale, value)}
                      onFocus={(_event, editor) => {
                        editorRef.current = editor;
                        setIsFocused(true);
                      }}
                      onBlur={() => setIsFocused(false)}
                      onShowFileManager={() => setVisible?.(true)}
                    />
                  </Suspense>
                </div>
                {locales.length > 1 && (
                  <div className="order-1 flex items-center border-b border-input">
                    {visibleLocales.map(locale => {
                      const isTooLong = isOverMaxLength(field.value, locale.code);
                      const isActive = activeLocale === locale.code;

                      return (
                        <Button
                          key={locale.code}
                          variant="transparent"
                          type="button"
                          disabled={disabled}
                          className={cn(tab({ state: getTabState(isActive, isTooLong) }), 'h-10')}
                          onClick={() => setActiveLocale(locale.code)}
                        >
                          <span className="flex items-center gap-1">
                            {locale.name}
                            {locale.isDefault && <span className="text-sm">(Default)</span>}
                            <CheckIndicator values={field.value} lang={locale.code} error={isTooLong} />
                          </span>
                          {isActive && <div className={cn('absolute bottom-0 left-0 h-0.5 w-full', isTooLong ? 'bg-destructive' : 'bg-primary')} />}
                        </Button>
                      );
                    })}
                    {dropdownLocales.length > 0 && (
                      <Popover open={isOpenDropdown} onOpenChange={setIsOpenDropdown}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" disabled={disabled} className="h-10 px-2 hover:bg-secondary/30">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-0" side="right" align="start">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {dropdownLocales.map((locale, index) => {
                                  const isTooLong = isOverMaxLength(field.value, locale.code);
                                  const isActive = activeLocale === locale.code;

                                  return (
                                    <CommandItem
                                      key={locale.code}
                                      tabIndex={index}
                                      className={isActive ? '!bg-primary/20' : ''}
                                      disabled={disabled}
                                      onSelect={() => {
                                        setActiveLocale(locale.code);
                                        setIsOpenDropdown(false);
                                      }}
                                    >
                                      <span className={cn('flex w-full items-center justify-between gap-1', isTooLong && 'text-destructive')}>
                                        {locale.name}
                                        <CheckIndicator values={field.value} lang={locale.code} />
                                      </span>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FormControl>
          {!error?.message && maxLength && (
            <p className={cn(isOverMaxLength(field.value, activeLocale) && 'text-destructive')}>
              {getCharCount(field.value, activeLocale)}/{maxLength}
            </p>
          )}
          {showErrorMessage && error?.message && (
            <FormMessage className={messageClassName} message={t(error.message, { min: minLength, max: maxLength })} />
          )}
        </FormItem>
      )}
    />
  );
}
