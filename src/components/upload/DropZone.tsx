'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

export interface DropZoneProps {
  /** Callback when files are dropped or selected */
  onFilesSelected?: (files: File[]) => void;
  /** Whether the drop zone is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * DropZone component for drag-and-drop file upload
 * Large rectangular drop area with dashed border
 * Visual feedback on drag-over with color and scale animation
 */
export function DropZone({ onFilesSelected, disabled = false, className = '' }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;
      const fileArray = Array.from(files);
      onFilesSelected?.(fileArray);
    },
    [onFilesSelected, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounter.current += 1;
      if (dragCounter.current === 1) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onKeyDown={handleKeyDown}
      aria-label="Drop files here or click to browse"
      aria-disabled={disabled}
      className={`
        relative min-h-[200px] w-full
        flex flex-col items-center justify-center gap-4
        rounded-xl border-2 border-dashed
        cursor-pointer
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${isDragging
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
        }
        ${className}
      `}
    >
      {/* Upload Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Upload className="h-8 w-8 text-primary" />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">
          Drop files here or click to browse
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Supports images, audio, and documents
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
