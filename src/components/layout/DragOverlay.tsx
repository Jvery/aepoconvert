'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { detectFormat } from '@/lib/formats';
import { useConversionStore } from '@/store/conversion-store';
import { toast } from 'sonner';

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

/**
 * DragOverlay component displays a full-screen overlay when files are dragged over the window
 * Provides visual feedback and handles file drops anywhere on the page
 */
export function DragOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const addFiles = useConversionStore((state) => state.addFiles);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only respond to file drags
    if (e.dataTransfer?.types.includes('Files')) {
      dragCounter.current += 1;
      if (dragCounter.current === 1) {
        setIsDragging(true);
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

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
        const message =
          count === 1
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

      // Add supported files to the store
      if (supportedFiles.length > 0) {
        addFiles(supportedFiles);
        const count = supportedFiles.length;
        toast.success(`Added ${count} file${count === 1 ? '' : 's'}`, {
          description:
            count === 1
              ? supportedFiles[0].name
              : `${supportedFiles[0].name} and ${count - 1} more`,
        });
      }
    },
    [addFiles]
  );

  useEffect(() => {
    // Add event listeners to window for drag events
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  if (!isDragging) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-background/80 backdrop-blur-md
        transition-opacity duration-200
      "
      aria-hidden="true"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-bg-animated opacity-30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Upload icon with animated pulse */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 animate-pulse">
          <Upload className="h-12 w-12 text-primary" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold gradient-text">Drop files to convert</h2>
          <p className="text-muted-foreground">
            Release to add your files for conversion
          </p>
        </div>
      </div>

      {/* Gradient border effect */}
      <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-primary/50 pointer-events-none" />
    </div>
  );
}
