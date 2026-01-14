'use client';

import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ConvertibleFile } from '@/types';
import { CheckCircle2, DownloadCloud, Loader2 } from 'lucide-react';

interface DownloadButtonProps {
  /** List of files (only completed ones should be passed in) */
  files: ConvertibleFile[];
  /** Optional class name for layout control */
  className?: string;
}

type CompletedFile = ConvertibleFile & { result: Blob };

/**
  * Creates a browser download for a given blob and filename.
  */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Builds a unique filename using the original name plus the target extension.
 */
function buildFilename(file: CompletedFile, usedNames: Set<string>): string {
  const ext = (file.to ?? file.from ?? 'converted').replace(/^\./, '').toLowerCase() || 'converted';
  const lastDot = file.name.lastIndexOf('.');
  const base = lastDot > 0 ? file.name.slice(0, lastDot) : file.name || 'file';
  let candidate = `${base}.${ext}`;
  let counter = 1;

  while (usedNames.has(candidate)) {
    candidate = `${base}-${counter}.${ext}`;
    counter += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

/**
 * Button to download completed conversions.
 * - Single file: direct download with updated extension
 * - Multiple files: downloads a ZIP archive
 */
export function DownloadButton({ files, className }: DownloadButtonProps) {
  const completedFiles = useMemo(
    () => files.filter((file): file is CompletedFile => file.status === 'complete' && file.result !== null),
    [files]
  );

  const [isProcessing, setIsProcessing] = useState(false);

  if (completedFiles.length === 0) return null;

  const isMultiple = completedFiles.length > 1;
  const usedNames = new Set<string>();

  const downloadSingle = async (file: CompletedFile) => {
    const filename = buildFilename(file, usedNames);
    triggerDownload(file.result, filename);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    completedFiles.forEach((file) => {
      const filename = buildFilename(file, usedNames);
      zip.file(filename, file.result);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(blob, 'aepoconvert-files.zip');
  };

  const handleClick = async () => {
    setIsProcessing(true);
    try {
      if (isMultiple) {
        await downloadZip();
      } else {
        await downloadSingle(completedFiles[0]);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isProcessing}
      aria-busy={isProcessing}
      className={cn(
        'group relative inline-flex h-12 min-w-[190px] items-center justify-center overflow-hidden rounded-xl px-6 text-base font-semibold text-white',
        'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 shadow-[0_18px_45px_-24px_rgba(16,185,129,0.65)]',
        'transition-all duration-200 ease-out hover:scale-[1.015] active:scale-[0.99]',
        'focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
    >
      <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 blur-lg" />
      </span>
      <div className="flex items-center gap-2">
        <motion.span
          initial={{ scale: 0.9, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white shadow-inner shadow-emerald-900/20"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="absolute -z-10 h-9 w-9 rounded-full bg-emerald-300/40 blur-md group-hover:animate-ping" />
        </motion.span>
        <div className="flex flex-col text-left leading-tight">
          <span>{isMultiple ? 'Download all' : 'Download file'}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-50/90">
            <DownloadCloud className="h-3.5 w-3.5" aria-hidden="true" />
            {isMultiple ? 'ZIP archive' : 'Direct download'}
          </span>
        </div>
        <span className="ml-2 rounded-full bg-white/15 px-2 py-1 text-xs font-semibold leading-none">
          {completedFiles.length}
        </span>
      </div>
    </Button>
  );
}
