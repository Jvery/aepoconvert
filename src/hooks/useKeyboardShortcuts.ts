'use client';

import { useEffect, useCallback, useState } from 'react';
import { useConversionStore } from '@/store/conversion-store';
import { detectFormat } from '@/lib/formats';
import { toast } from 'sonner';

/**
 * Hook that sets up global keyboard shortcuts for the conversion app:
 * - Ctrl/Cmd + V: Paste files from clipboard
 * - Ctrl/Cmd + Enter: Start conversion
 * - Escape: Clear all files (with confirmation)
 */
export function useKeyboardShortcuts() {
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const addFiles = useConversionStore((state) => state.addFiles);
  const startConversion = useConversionStore((state) => state.startConversion);
  const clearAll = useConversionStore((state) => state.clearAll);
  const files = useConversionStore((state) => state.files);
  const isConverting = useConversionStore((state) => state.isConverting);

  // Handle paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.read) {
        toast.error('Clipboard access not available', {
          description: 'Your browser does not support clipboard file access',
        });
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];

      for (const item of clipboardItems) {
        // Check for file types
        for (const type of item.types) {
          if (type.startsWith('image/') || type.startsWith('audio/') || type.startsWith('text/')) {
            try {
              const blob = await item.getType(type);
              // Create a file from the blob
              const extension = type.split('/')[1] || 'bin';
              const fileName = `pasted-file.${extension}`;
              const file = new File([blob], fileName, { type });

              // Check if format is supported
              const format = detectFormat(file);
              if (format) {
                files.push(file);
              }
            } catch (e) {
              // Type might not be readable, skip it
              console.warn('Could not read clipboard item type:', type, e);
            }
          }
        }
      }

      if (files.length > 0) {
        addFiles(files);
        toast.success(`Pasted ${files.length} file(s)`, {
          description: files.map(f => f.name).join(', '),
        });
      } else {
        toast.info('No supported files in clipboard', {
          description: 'Copy an image, audio, or document file first',
        });
      }
    } catch (error) {
      // Clipboard read failed - user might have denied permission
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.error('Clipboard access denied', {
          description: 'Please allow clipboard access in your browser settings',
        });
      } else {
        console.error('Clipboard paste error:', error);
        toast.error('Could not paste from clipboard');
      }
    }
  }, [addFiles]);

  // Handle start conversion
  const handleStartConversion = useCallback(() => {
    if (files.length === 0) {
      toast.info('No files to convert', {
        description: 'Add files first by dropping or pasting them',
      });
      return;
    }

    if (isConverting) {
      toast.info('Conversion in progress', {
        description: 'Please wait for the current conversion to complete',
      });
      return;
    }

    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.info('No pending files', {
        description: 'All files have already been converted',
      });
      return;
    }

    startConversion();
  }, [files, isConverting, startConversion]);

  // Handle clear all with confirmation
  const handleClearAll = useCallback(() => {
    if (files.length === 0) {
      return; // Nothing to clear
    }
    setShowClearConfirmation(true);
  }, [files.length]);

  // Confirm clear all
  const confirmClearAll = useCallback(() => {
    clearAll();
    setShowClearConfirmation(false);
    toast.success('All files cleared');
  }, [clearAll]);

  // Cancel clear all
  const cancelClearAll = useCallback(() => {
    setShowClearConfirmation(false);
  }, []);

  // Main keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + V: Paste files
      if (cmdOrCtrl && e.key === 'v') {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Ctrl/Cmd + Enter: Start conversion
      if (cmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        handleStartConversion();
        return;
      }

      // Escape: Clear all (with confirmation state toggle)
      if (e.key === 'Escape') {
        if (showClearConfirmation) {
          cancelClearAll();
        } else {
          handleClearAll();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePaste, handleStartConversion, handleClearAll, cancelClearAll, showClearConfirmation]);

  return {
    showClearConfirmation,
    confirmClearAll,
    cancelClearAll,
  };
}

/**
 * Helper component to display keyboard shortcut hints
 */
export function getKeyboardShortcutHints() {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  return {
    paste: `${cmdKey}+V`,
    convert: `${cmdKey}+Enter`,
    clear: 'Esc',
  };
}
