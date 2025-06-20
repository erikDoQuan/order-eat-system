import type { VariantProps } from 'class-variance-authority';
import type { ForwardedRef } from 'react';
import React, { forwardRef, Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Loading } from '../ui/loading';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
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

const contentVariants = cva('overflow-hidden truncate text-ellipsis whitespace-nowrap px-3', {
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

const commandItemVariants = cva('flex items-center justify-between rounded-none pl-6', {
  variants: {
    size: {
      default: 'h-9',
      sm: 'h-8',
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

const groupHeaderVariants = cva('flex items-center justify-between px-2 py-2 font-semibold', {
  variants: {
    size: {
      default: 'h-9',
      sm: 'h-8',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const checkboxVariants = cva('flex items-center justify-center rounded-sm border border-primary', {
  variants: {
    size: {
      default: 'h-4 w-4',
      sm: 'h-3 w-3',
    },
    selected: {
      all: 'bg-primary text-primary-foreground',
      partial: '!border-primary/30 bg-primary/50',
      none: 'opacity-50',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const tagVariants = cva(
  'flex items-center whitespace-nowrap rounded-full border border-primary bg-primary/10 px-1.5 py-[1px] font-medium text-primary',
  {
    variants: {
      size: {
        default: 'text-xs',
        sm: 'text-[10px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

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

export type OptionType = Record<string, string>;

export interface GroupOption<T extends OptionType> {
  id: string;
  name: string;
  childrens: T[];
}

export interface SelectGroupProps<T extends OptionType> extends VariantProps<typeof formControlVariants> {
  dataTestId?: string;
  className?: string;
  value: T[];
  options: GroupOption<T>[];
  placeholder?: string;
  label?: string;
  labelDisplay?: 'inside' | 'outside';
  labelClassName?: string;
  tagListClassName?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  valueField?: keyof T;
  displayField?: keyof T;
  size?: 'default' | 'sm';
  searchText?: string;
  showSearch?: boolean;
  showClearAll?: boolean;
  showSelectAll?: boolean;
  showSelectedTags?: boolean;
  error?: boolean;
  loading?: boolean;
  onChange: (value: T[]) => void;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  onSearch?: (value: string) => void;
  onLoadMore?: () => void;
}

const SelectGroup = forwardRef(
  <T extends OptionType>(
    {
      dataTestId,
      className,
      value = [],
      options,
      placeholder = 'Select items...',
      label,
      labelDisplay = 'inside',
      labelClassName,
      tagListClassName,
      required = false,
      disabled = false,
      readOnly = false,
      valueField = 'id' as keyof T,
      displayField = 'name' as keyof T,
      size = 'default',
      error = false,
      searchText = 'Enter search text...',
      showSearch = true,
      showClearAll = true,
      showSelectedTags = true,
      loading = false,
      onChange,
      onBlur,
      onFocus,
      onSearch,
      onLoadMore,
    }: SelectGroupProps<T>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const ID = new Date().getTime();

    const selectedIds = useMemo(() => new Set(value.map(v => v[valueField])), [value, valueField]);

    const groupedTags = useMemo(() => {
      return options.map(group => {
        const selectedInGroup = value.filter(v => group.childrens.some(child => child[valueField] === v[valueField]));
        const isAllSelected = selectedInGroup.length === group.childrens.length;

        return {
          group,
          selected: selectedInGroup,
          showAllTag: isAllSelected,
          showIndividualTags: !isAllSelected && selectedInGroup.length > 0,
        };
      });
    }, [options, value, valueField]);

    const isOptionSelected = useCallback(
      (option: T) => {
        return value.some(v => v[valueField] === option[valueField]);
      },
      [value, valueField],
    );

    const displayValue = useMemo(() => {
      if (value.length === 0) {
        return placeholder;
      }

      const groupedSelections = options.map(group => {
        const selectedInGroup = value.filter(v => group.childrens.some(child => child[valueField] === v[valueField]));
        const isAllSelected = selectedInGroup.length === group.childrens.length;

        return { group, selected: selectedInGroup, isAllSelected };
      });

      const displayParts = groupedSelections
        .map(({ group, selected, isAllSelected }) => {
          if (selected.length === 0) {
            return null;
          }
          if (isAllSelected) {
            return `${group.name} (All)`;
          }
          return selected.map(item => String(item[displayField])).join(', ');
        })
        .filter(Boolean);

      return displayParts.join(', ') || placeholder;
    }, [value, options, placeholder, valueField, displayField]);

    const handleOpenChange = (open: boolean) => {
      if (disabled) {
        setIsOpen(false);
        return;
      }
      setIsOpen(open);
      if (open) setIsFocused(true);
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
      if (disabled) return;
      onChange([]);
      setIsFocused(true);
    };

    const handleClickOutside = useCallback((event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideSelect = selectRef.current?.contains(target);
      const isInsidePopover = popoverRef.current?.contains(target);
      const isInsideCommandInput = target instanceof Element && target.closest('[cmdk-input-wrapper]');

      if (!isInsideSelect && !isInsidePopover && !isInsideCommandInput) {
        setIsFocused(false);
      }
    }, []);

    const getFormControlState = () => {
      if (disabled) return 'disabled';
      if (readOnly) return 'readOnly';
      if (error) return isFocused ? 'errorFocused' : 'error';
      if (isFocused) return 'focused';
      return 'default';
    };

    const handleSelectAllInGroup = (group: GroupOption<T>, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (disabled) return;

      const currentSelection = new Set(value);
      group.childrens.forEach(child => {
        if (!selectedIds.has(child[valueField])) {
          currentSelection.add(child);
        }
      });
      onChange([...currentSelection]);
    };

    const handleDeselectAllInGroup = (group: GroupOption<T>, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (disabled) return;

      const groupIds = new Set(group.childrens.map(child => child[valueField]));
      onChange(value.filter(v => !groupIds.has(v[valueField])));
    };

    const handleOptionSelect = (option: T) => {
      if (disabled) return;

      if (selectedIds.has(option[valueField])) {
        onChange(value.filter(v => v[valueField] !== option[valueField]));
      } else {
        onChange([...value, option]);
      }
    };

    const handleRemoveTag = (option: T, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange(value.filter(v => v[valueField] !== option[valueField]));
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
        <div data-testid={dataTestId} ref={ref} className={cn(formControlVariants({ size, state: getFormControlState(), className }))}>
          <div ref={selectRef}>
            <Popover open={isOpen && !disabled} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <button
                  ref={triggerRef}
                  className={cn(triggerVariants({ size }), disabled && 'cursor-not-allowed')}
                  aria-expanded={isOpen}
                  disabled={disabled}
                  type="button"
                  aria-label="open-select-group"
                  onClick={() => !disabled && setIsFocused(true)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <ChevronDownIcon className={triggerIconVariants({ size: 'default', state: disabled ? 'disabled' : 'default' })} />
                  {label && labelDisplay === 'inside' && (
                    <InputLabel htmlFor={`input-${ID}`} label={label} required={required} size={size} className={cn(labelClassName)} />
                  )}
                  <p className={cn(contentVariants({ size }), !value.length && 'text-muted-foreground', disabled && 'opacity-50')}>{displayValue}</p>
                </button>
              </PopoverTrigger>
              <PopoverContent ref={popoverRef} className="min-w-[--radix-popover-trigger-width] p-0" sideOffset={6} align="start">
                <Command>
                  {showSearch && (
                    <CommandInput
                      placeholder={searchText}
                      className={commandInputVariants({ size: 'default' })}
                      onFocus={() => setIsFocused(true)}
                      onValueChange={value => onSearch?.(value)}
                    />
                  )}
                  <CommandList className="scrollbar max-h-[300px] overflow-auto" onScroll={handleScroll}>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {options.map(group => {
                      return (
                        <CommandGroup key={group.id} className="p-0">
                          <div className={groupHeaderVariants({ size })}>
                            <div className="flex flex-1 items-center justify-between">
                              <span>{group.name}</span>
                              <div className="flex gap-2 text-muted-foreground">
                                <button
                                  aria-label="select-all"
                                  type="button"
                                  className="cursor-pointer hover:text-primary"
                                  onClick={e => handleSelectAllInGroup(group, e)}
                                >
                                  Select all
                                </button>
                                <span>|</span>
                                <button
                                  aria-label="deselect-all"
                                  type="button"
                                  className="cursor-pointer hover:text-primary"
                                  onClick={e => handleDeselectAllInGroup(group, e)}
                                >
                                  Deselect all
                                </button>
                              </div>
                            </div>
                          </div>
                          {group.childrens.map(option => {
                            const isSelected = isOptionSelected(option);
                            return (
                              <CommandItem
                                key={`${group.id}-${String(option[valueField])}`}
                                onSelect={() => handleOptionSelect(option)}
                                className={commandItemVariants({ size, selected: isSelected })}
                              >
                                <span>{String(option[displayField])}</span>
                                <div className={checkboxVariants({ size: 'default', selected: isSelected ? 'all' : 'none' })}>
                                  <CheckIcon
                                    className={cn('h-4 w-4 text-primary-foreground', {
                                      'opacity-100': isSelected,
                                      'opacity-0': !isSelected,
                                    })}
                                  />
                                </div>
                              </CommandItem>
                            );
                          })}
                          <Separator />
                        </CommandGroup>
                      );
                    })}
                    {loading && (
                      <div className="flex items-center justify-center p-2">
                        <Loading size="xs" />
                      </div>
                    )}
                  </CommandList>
                  {showClearAll && value.length > 0 && (
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
        </div>
        {showSelectedTags && (
          <div className={cn('!mt-1.5 flex flex-wrap gap-1', tagListClassName)}>
            {groupedTags.map(({ group, selected, showAllTag, showIndividualTags }) => (
              <Fragment key={group.id}>
                {showAllTag ? (
                  <span className={tagVariants({ size: 'default' })}>
                    <span>{`${group.name} (All)`}</span>
                  </span>
                ) : showIndividualTags ? (
                  selected.map(item => (
                    <span key={`${group.id}-${String(item[valueField])}`} className={tagVariants({ size: 'default' })}>
                      <span>{String(item[displayField])}</span>
                      <XIcon className={tagIconVariants({ size })} strokeWidth={2} onClick={e => handleRemoveTag(item, e)} />
                    </span>
                  ))
                ) : null}
              </Fragment>
            ))}
          </div>
        )}
      </>
    );
  },
);

SelectGroup.displayName = 'SelectGroup';

export { SelectGroup };
