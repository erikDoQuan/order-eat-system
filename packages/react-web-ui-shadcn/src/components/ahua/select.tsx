import type { VariantProps } from 'class-variance-authority';
import type { FC, ForwardedRef } from 'react';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { CheckIcon, ChevronDownIcon, InfoIcon, PlusIcon, XIcon } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Loading } from '../ui/loading';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { InputLabel, InputLabelOutside } from './input-base';

const formControlVariants = cva('relative grid items-center rounded-md border border-input bg-background ring-offset-background', {
  variants: {
    size: {
      default: 'h-14',
      sm: 'h-10',
    },
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
    size: 'default',
    state: 'default',
  },
});

const contentVariants = cva('overflow-hidden truncate text-ellipsis whitespace-nowrap px-3 text-sm font-medium', {
  variants: {
    size: {
      default: 'h-[28px] !leading-[24px]',
      sm: 'h-[22px] !leading-[22px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const triggerVariants = cva('grid w-full justify-between text-left focus:outline-none', {
  variants: {
    size: {
      default: '',
      sm: '',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const triggerIconVariants = cva('absolute -translate-y-1/2', {
  variants: {
    size: {
      default: 'right-2 top-1/2 h-4 w-4',
      sm: 'right-2 top-1/2 h-3 w-3',
    },
    state: {
      default: '',
      disabled: 'opacity-50',
    },
  },
  defaultVariants: {
    size: 'default',
    state: 'default',
  },
});

const commandInputVariants = cva('', {
  variants: {
    size: {
      default: '',
      sm: 'h-8',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const commandItemVariants = cva('flex items-center justify-between rounded-none', {
  variants: {
    size: {
      default: 'h-9',
      sm: 'h-8 text-xs',
    },
    selected: {
      true: 'bg-primary/10',
      false: '',
    },
  },
  defaultVariants: {
    size: 'default',
    selected: false,
  },
});

const commandIconVariants = cva('flex items-center justify-center rounded-sm border border-primary', {
  variants: {
    size: {
      default: 'h-4 w-4',
      sm: 'h-3 w-3',
    },
    selected: {
      true: 'bg-primary text-primary-foreground',
      false: 'opacity-50 [&_svg]:invisible',
    },
  },
  defaultVariants: {
    size: 'default',
    selected: false,
  },
});

const tagVariants = cva('flex items-center whitespace-nowrap rounded-full border border-primary bg-primary/10 px-1.5 py-1 font-medium text-primary', {
  variants: {
    size: {
      default: 'text-xs',
      sm: 'text-[10px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const tagIconVariants = cva('ml-1 cursor-pointer', {
  variants: {
    size: {
      default: 'size-3',
      sm: 'size-2.5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type TagProps = {
  className?: string;
  label: string;
  value: string;
  size?: 'default' | 'sm';
  onRemove: (value: string, e: React.MouseEvent) => void;
};

const Tag: FC<TagProps> = ({ className, label, value, size = 'default', onRemove }) => (
  <span className={cn(tagVariants({ size }), className)}>
    {label}
    <XIcon className={tagIconVariants({ size })} strokeWidth={2} onClick={e => onRemove(value, e)} />
  </span>
);

export type OptionType = Record<string, string>;

type BaseSelectProps<T extends OptionType> = {
  dataTestId?: string;
  className?: string;
  options: T[];
  placeholder?: string;
  label?: string;
  popoverLabel?: string;
  labelDisplay?: 'inside' | 'outside';
  labelClassName?: string;
  tagListClassName?: string;
  tagItemClassName?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  valueField: keyof T;
  displayField: keyof T;
  size?: 'default' | 'sm';
  error?: boolean;
  searchText?: string;
  showSearch?: boolean;
  showClearAll?: boolean;
  showSelectAll?: boolean;
  showSelectedTags?: boolean;
  loading?: boolean;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onSearch?: (value: string) => void;
  onLoadMore?: () => void;
  onPopoverLabelClick?: () => void;
} & VariantProps<typeof formControlVariants>;

type SingleSelectProps<T extends OptionType> = BaseSelectProps<T> & {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiSelectProps<T extends OptionType> = BaseSelectProps<T> & {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
};

export type SelectProps<T extends OptionType> = SingleSelectProps<T> | MultiSelectProps<T>;

const Select = forwardRef(
  <T extends OptionType>(
    {
      dataTestId,
      className,
      label,
      popoverLabel,
      labelDisplay = 'inside',
      labelClassName,
      tagListClassName,
      tagItemClassName,
      options,
      value,
      valueField = 'id',
      displayField = 'name',
      placeholder = 'Select items...',
      disabled = false,
      readOnly = false,
      required = false,
      multiple,
      size = 'default',
      error = false,
      searchText = 'Enter search text...',
      showSearch = false,
      showClearAll = false,
      showSelectAll = true,
      showSelectedTags = false,
      loading = false,
      onChange,
      onBlur,
      onFocus,
      onSearch,
      onLoadMore,
      onPopoverLabelClick,
    }: SelectProps<T>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const ID = new Date().getTime();

    React.useImperativeHandle(ref, () => triggerRef.current!);

    const selectedValues = useMemo(() => {
      if (multiple) {
        return new Set(value.map(item => item[valueField]));
      }
      return new Set(value ? [value] : []);
    }, [value, valueField, multiple]);

    const selectedItems = useMemo(
      // @ts-expect-error - TODO: fix this
      () => options.filter(option => selectedValues.has(multiple ? option[valueField] : option[valueField])),
      [options, selectedValues, valueField, multiple],
    );

    const isAllSelected = useMemo(() => multiple && selectedValues.size === options.length, [multiple, selectedValues.size, options.length]);

    const getFormControlState = () => {
      if (disabled) return 'disabled';
      if (readOnly) return 'readOnly';
      if (error) return isFocused ? 'errorFocused' : 'error';
      if (isFocused) return 'focused';
      return 'default';
    };

    const handleSelectAll = () => {
      if (readOnly || disabled || !multiple) return;
      const multipleOnChange = onChange;
      const newValue = isAllSelected ? [] : [...options];
      multipleOnChange(newValue);
      setIsFocused(true);
    };

    const handleToggleOption = (option: T) => {
      if (readOnly || disabled) return;

      if (multiple) {
        const multipleOnChange = onChange;
        // @ts-expect-error - TODO: fix this
        const newItems = selectedValues.has(option[valueField])
          ? selectedItems.filter(item => item[valueField] !== option[valueField])
          : [...selectedItems, option];
        multipleOnChange(newItems);
      } else {
        const singleOnChange = onChange;
        singleOnChange(option[valueField]!);
        setIsOpen(false);
      }

      setIsFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      const relatedTarget = e.relatedTarget as Node | null;
      const isInsidePopover = popoverRef.current?.contains(relatedTarget);
      const isInsideCommandInput = relatedTarget instanceof Element && relatedTarget.closest('[cmdk-input-wrapper]');

      if (!isInsidePopover && !isInsideCommandInput) {
        setIsFocused(false);
        onBlur?.(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      if (!readOnly || !disabled) {
        setIsFocused(true);
        onFocus?.(e);
      }
    };

    const handleClearAll = () => {
      if (readOnly || disabled) return;

      if (multiple) {
        const multipleOnChange = onChange;
        multipleOnChange([]);
      } else {
        const singleOnChange = onChange;
        singleOnChange('');
      }

      setIsFocused(true);
    };

    const handleOpenChange = (open: boolean) => {
      if (disabled) {
        setIsOpen(false);
        return;
      }

      setIsOpen(open);
      if (open) {
        setIsFocused(true);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = useCallback((event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsidePopover = popoverRef.current?.contains(target);
      const isInsideCommandInput = target instanceof Element && target.closest('[cmdk-input-wrapper]');

      if (!isInsideContainer && !isInsidePopover && !isInsideCommandInput) {
        setIsFocused(false);
      }
    }, []);

    const handleRemoveTag = (tagValue: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (readOnly || disabled) return;

      if (multiple) {
        const multipleOnChange = onChange;
        const newItems = selectedItems.filter(item => item[valueField] !== tagValue);
        multipleOnChange(newItems);
      } else {
        const singleOnChange = onChange;
        singleOnChange('');
      }

      setIsFocused(true);
    };

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight;

      if (isAtBottom) {
        onLoadMore?.();
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    return (
      <>
        {label && labelDisplay === 'outside' && (
          <InputLabelOutside htmlFor={`input-${ID}`} label={label} required={required} className={cn(labelClassName)} />
        )}
        <div data-testid={dataTestId} ref={containerRef} className={cn(formControlVariants({ size, state: getFormControlState(), className }))}>
          <Popover open={isOpen && !disabled} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <button
                ref={triggerRef}
                className={cn(triggerVariants({ size }), disabled && 'cursor-not-allowed')}
                aria-expanded={isOpen}
                disabled={disabled}
                type="button"
                aria-label="select"
                onClick={() => !disabled && setIsFocused(true)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <ChevronDownIcon className={triggerIconVariants({ size: 'default', state: disabled ? 'disabled' : 'default' })} />
                {label && labelDisplay === 'inside' && (
                  <InputLabel htmlFor={`input-${ID}`} label={label} required={required} size={size} className={cn(labelClassName)} />
                )}
                <p className={cn(contentVariants({ size }), !selectedItems.length && 'text-muted-foreground', disabled && 'opacity-50')}>
                  {!selectedItems.length && placeholder}
                  {selectedItems.length > 0 && selectedItems.map(item => item[displayField]).join(', ')}
                </p>
              </button>
            </PopoverTrigger>
            <PopoverContent ref={popoverRef} className="min-w-[--radix-popover-trigger-width] p-0" sideOffset={6} align="start">
              <Command>
                {showSearch && (
                  <CommandInput
                    className={commandInputVariants({ size: 'default' })}
                    placeholder={searchText}
                    onFocus={() => setIsFocused(true)}
                    onValueChange={value => onSearch?.(value)}
                  />
                )}
                <CommandList className="scrollbar max-h-[300px] overflow-auto" onScroll={handleScroll}>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {popoverLabel && (
                    <CommandGroup
                      heading={
                        <div
                          className="flex cursor-pointer items-center gap-2"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            onPopoverLabelClick?.();
                          }}
                        >
                          <PlusIcon className="h-4 w-4" />
                          <span>{popoverLabel}</span>
                        </div>
                      }
                      className="p-2"
                    >
                      <Separator />
                    </CommandGroup>
                  )}
                  {multiple && showSelectAll && (
                    <CommandGroup className="p-0">
                      <CommandItem className={cn(commandItemVariants({ size: 'default', selected: isAllSelected }))} onSelect={handleSelectAll}>
                        <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
                        <div className={commandIconVariants({ size: 'default', selected: isAllSelected })}>
                          <CheckIcon />
                        </div>
                      </CommandItem>
                      <Separator />
                    </CommandGroup>
                  )}
                  <CommandGroup className="p-0">
                    {options.map((option, index) => {
                      // @ts-expect-error - TODO: fix this
                      const isSelected = selectedValues.has(option[valueField]);

                      return (
                        <CommandItem
                          disabled={disabled}
                          key={option[valueField]}
                          tabIndex={index}
                          className={cn(commandItemVariants({ size: 'default', selected: isSelected }))}
                          onSelect={() => handleToggleOption(option)}
                        >
                          <span>{option[displayField]}</span>
                          <div className="flex items-center space-x-1">
                            {multiple && (
                              <div className={commandIconVariants({ size: 'default', selected: isSelected })}>
                                <CheckIcon />
                              </div>
                            )}
                            {option.tooltip && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon size={18} className="text-primary" />
                                  </TooltipTrigger>
                                  <TooltipContent className="z-[1402] whitespace-pre-line break-words border-black bg-black text-white">
                                    <p>{option.tooltip}</p>
                                    <TooltipArrow className="fill-black" />
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {loading && (
                    <div className="flex items-center justify-center p-2">
                      <Loading size="xs" />
                    </div>
                  )}
                </CommandList>
                {showClearAll && selectedValues.size > 0 && (
                  <>
                    <Separator />
                    <CommandGroup>
                      <Button className="w-full" size="sm" variant="secondary" onClick={handleClearAll}>
                        Clear all
                      </Button>
                    </CommandGroup>
                  </>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {showSelectedTags && (
          <div className={cn('mt-2 flex flex-wrap gap-1', tagListClassName)}>
            {selectedItems.map(item => (
              <Tag
                key={item[valueField]}
                className={tagItemClassName}
                label={item[displayField]!}
                value={item[valueField]!}
                size={size}
                onRemove={handleRemoveTag}
              />
            ))}
          </div>
        )}
      </>
    );
  },
);

Select.displayName = 'Select';

export { Select };
