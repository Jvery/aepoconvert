'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { detectFormat, ALL_FORMATS } from '@/lib/formats';
import { useConversionStore } from '@/store/conversion-store';

export interface DropZoneProps {
  /** Whether the drop zone is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Get accepted file extensions as a comma-separated string for display
 */
function getAcceptedExtensions(): string {
  const extensions = ALL_FORMATS.flatMap((format) => format.extensions);
  // Get unique extensions and return first 15 for display
  const unique = [...new Set(extensions)];
  const displayed = unique.slice(0, 15);
  const remaining = unique.length - displayed.length;
  const ext = displayed.map((e) => `.${e}`).join(', ');
  return remaining > 0 ? `${ext} and ${remaining}+ more` : ext;
}

/**
 * Get accept attribute string for file input
 */
function getAcceptAttribute(): string {
  const extensions = ALL_FORMATS.flatMap((format) => format.extensions);
  const mimeTypes = ALL_FORMATS.flatMap((format) => format.mimeTypes);
  const uniqueExtensions = [...new Set(extensions)].map((e) => `.${e}`);
  const uniqueMimeTypes = [...new Set(mimeTypes)];
  return [...uniqueExtensions, ...uniqueMimeTypes].join(',');
}

/**
 * DropZone component for drag-and-drop file upload
 * Large rectangular drop area with dashed border
 * Visual feedback on drag-over with color and scale animation
 * Filters files by supported formats and shows toast for unsupported files
 */
export function DropZone({ disabled = false, className = '' }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const addFiles = useConversionStore((state) => state.addFiles);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const fileArray = Array.from(files);
      const supportedFiles: File[] = [];
      const unsupportedFiles: string[] = [];

      // Filter files by supported formats
      for (const file of fileArray) {
        const format = detectFormat(file);
        if (format) {
          supportedFiles.push(file);
        } else {
          unsupportedFiles.push(file.name);
        }
      }

      // Show toast for unsupported files
      if (unsupportedFiles.length > 0) {
        const count = unsupportedFiles.length;
        const names = unsupportedFiles.slice(0, 3).join(', ');
        const message = count === 1
          ? `"${names}" is not a supported format`
          : count <= 3
            ? `${names} are not supported formats`
            : `${names} and ${count - 3} more files are not supported`;
        toast.error('Unsupported file format', {
          description: message,
        });
      }

      // Only add supported files to the store
      if (supportedFiles.length > 0) {
        addFiles(supportedFiles);
        // Show success toast for added files
        const count = supportedFiles.length;
        toast.success(`Added ${count} file${count === 1 ? '' : 's'}`, {
          description: count === 1
            ? supportedFiles[0].name
            : `${supportedFiles[0].name} and ${count - 1} more`,
        });
      }
    },
    [addFiles, disabled]
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
        relative min-h-[160px] sm:min-h-[200px] w-full
        flex flex-col items-center justify-center gap-3 sm:gap-4
        rounded-xl border-2 border-dashed
        cursor-pointer
        transition-all duration-200 ease-out
        px-4 py-6 sm:py-8
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
      <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10">
        <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
      </div>

      {/* Text */}
      <div className="text-center px-2">
        <p className="text-base sm:text-lg font-medium text-foreground">
          Drop files here or click to browse
        </p>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Supports images, audio, and documents
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70 hidden sm:block">
          {getAcceptedExtensions()}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={getAcceptAttribute()}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
