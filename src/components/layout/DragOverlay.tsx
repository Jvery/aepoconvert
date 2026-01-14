'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { detectFormat } from '@/lib/formats';
import { useConversionStore } from '@/store/conversion-store';
import { toast } from 'sonner';

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
