import React, { useRef, useState } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Loading } from '../ui/loading';

const dropzoneVariants = cva('relative flex cursor-pointer items-center justify-center rounded-lg border border-dashed text-center', {
  variants: {
    state: {
      default: 'bg-muted hover:border-primary',
      active: 'border-primary !bg-primary/10',
      error: 'border-destructive !bg-destructive/10',
      focused: 'border-primary ring-2 ring-primary',
      disabled: 'cursor-not-allowed !bg-muted',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

interface IFileUploadProps {
  className?: string;
  label?: string;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  imageDimensions?: {
    width: number;
    height: number;
  };
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  isUploading?: boolean;
  onSelectFile?: (files: File[], filenames: string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const FileUpload: React.FC<IFileUploadProps> = ({
  className,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'],
  maxFiles = 10,
  error,
  disabled = false,
  isUploading = false,
  onSelectFile,
  onFocus,
  onBlur,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) return;

    const fileArray = Array.from(files);
    if (fileArray.length > maxFiles) return;

    const filenames = fileArray.map(file => file.name);
    onSelectFile?.(fileArray, filenames);
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsFocused(true);
      onFocus?.();
    }
  };

  const handleBlur = () => {
    if (!disabled) {
      setIsFocused(false);
      onBlur?.();
    }
  };

  const getDropzoneState = () => {
    if (disabled) return 'disabled';
    if (isDragActive) return 'active';
    if (isFocused) return 'focused';
    if (error) return 'error';
    return 'default';
  };

  return (
    <div
      className={cn(
        dropzoneVariants({
          state: getDropzoneState(),
        }),
        className,
      )}
    >
      <DropZone
        isDragActive={isDragActive}
        disabled={disabled}
        inputRef={inputRef}
        acceptedFileTypes={acceptedFileTypes}
        onDragOver={e => {
          if (!disabled) {
            e.preventDefault();
            setIsDragActive(true);
          }
        }}
        onDragLeave={e => {
          if (!disabled) {
            e.preventDefault();
            setIsDragActive(false);
          }
        }}
        onDrop={e => {
          if (!disabled) {
            e.preventDefault();
            setIsDragActive(false);
            handleFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.click();
          }
        }}
        onInputChange={e => handleFiles(e.target.files)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {isUploading && (
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-lg bg-black/70">
          <Loading />
        </div>
      )}
    </div>
  );
};

type DropZoneProps = {
  className?: string;
  isDragActive: boolean;
  disabled?: boolean;
  multiple?: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  acceptedFileTypes: string[];
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
};

const DropZone: React.FC<DropZoneProps> = ({
  className,
  isDragActive,
  disabled,
  inputRef,
  acceptedFileTypes,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onInputChange,
  onFocus,
  onBlur,
}) => (
  <div
    className={cn('flex h-full w-full items-center justify-center p-3', disabled && 'cursor-not-allowed', className)}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    onClick={onClick}
  >
    <input
      ref={inputRef}
      type="file"
      accept={acceptedFileTypes.join(',')}
      className="hidden"
      disabled={disabled}
      onChange={e => {
        onInputChange(e);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
    {isDragActive ? (
      <p className="font-bold">Drop your files here</p>
    ) : (
      <div className="grid gap-5">
        <p className="font-bold">Drag and drop files here, or</p>
        <Button type="button" disabled={disabled}>
          Choose file to upload
        </Button>
        <p className="text-xs text-muted-foreground">Please upload images with format JPEG, PNG, JPG, HEIC</p>
      </div>
    )}
  </div>
);

export default FileUpload;
