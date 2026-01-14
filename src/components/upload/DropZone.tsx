'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { detectFormat, ALL_FORMATS } from '@/lib/formats';
import { useConversionStore } from '@/store/conversion-store';

// File size constants
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const LARGE_FILE_WARNING_SIZE = 100 * 1024 * 1024; // 100MB
const ESTIMATED_TIME_THRESHOLD = 50 * 1024 * 1024; // 50MB

/**
 * Format file size as human-readable string (B, KB, MB, GB)
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`;
}

/**
 * Estimate conversion time based on file size
 * Returns estimated time in seconds
 */
function estimateConversionTime(bytes: number): number {
  // Rough estimate: ~5MB per second for average conversion
  // This varies greatly based on format and settings
  const mbPerSecond = 5;
  const megabytes = bytes / (1024 * 1024);
  return Math.ceil(megabytes / mbPerSecond);
}

/**
 * Format time duration as human-readable string
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `~${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} minute${minutes === 1 ? '' : 's'}`;
}

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
      const blockedFiles: { name: string; size: number }[] = [];
      const largeFiles: { name: string; size: number }[] = [];
      const filesWithEstimate: { name: string; size: number; estimate: string }[] = [];

      // Filter files by supported formats and size limits
      for (const file of fileArray) {
        // Check for files exceeding 2GB limit first
        if (file.size > MAX_FILE_SIZE) {
          blockedFiles.push({ name: file.name, size: file.size });
          continue;
        }

        const format = detectFormat(file);
        if (format) {
          supportedFiles.push(file);

          // Track large files for warnings
          if (file.size > LARGE_FILE_WARNING_SIZE) {
            largeFiles.push({ name: file.name, size: file.size });
          }

          // Track files that need time estimate
          if (file.size > ESTIMATED_TIME_THRESHOLD) {
            const estimate = formatDuration(estimateConversionTime(file.size));
            filesWithEstimate.push({ name: file.name, size: file.size, estimate });
          }
        } else {
          unsupportedFiles.push(file.name);
        }
      }

      // Show error toast for blocked files (> 2GB)
      if (blockedFiles.length > 0) {
        const count = blockedFiles.length;
        const fileInfo = blockedFiles.slice(0, 2).map(
          (f) => `${f.name} (${formatFileSize(f.size)})`
        );
        const message = count === 1
          ? `"${fileInfo[0]}" exceeds the 2GB file size limit`
          : count <= 2
            ? `${fileInfo.join(' and ')} exceed the 2GB file size limit`
            : `${fileInfo.join(', ')} and ${count - 2} more exceed the 2GB limit`;
        toast.error('File too large', {
          description: message,
        });
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

      // Show warning toast for large files (> 100MB)
      if (largeFiles.length > 0) {
        const count = largeFiles.length;
        const fileInfo = largeFiles.slice(0, 2).map(
          (f) => `${f.name} (${formatFileSize(f.size)})`
        );
        const message = count === 1
          ? `${fileInfo[0]} is a large file and may take longer to convert`
          : count <= 2
            ? `${fileInfo.join(' and ')} are large files`
            : `${fileInfo.join(', ')} and ${count - 2} more are large files`;
        toast.warning('Large file warning', {
          description: message,
        });
      }

      // Show info toast for estimated conversion time (> 50MB)
      if (filesWithEstimate.length > 0) {
        // Show estimate for the largest file
        const largestFile = filesWithEstimate.reduce((max, f) =>
          f.size > max.size ? f : max
        );
        toast.info('Conversion time estimate', {
          description: `${largestFile.name} (${formatFileSize(largestFile.size)}) may take ${largestFile.estimate} to convert`,
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
        <p className="mt-2 text-xs text-muted-foreground hidden sm:block">
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
