'use client';

import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConversionStore } from '@/store/conversion-store';
import { Loader2 } from 'lucide-react';

interface ConvertButtonProps {
  /** Optional class name to customize layout when placed in button rows */
  className?: string;
}

/**
 * Primary action button to start conversions.
 * Displays file count, disables when nothing to convert, and shows a spinner while converting.
 */
export function ConvertButton({ className }: ConvertButtonProps) {
  const { files, isConverting, startConversion } = useConversionStore(
    useShallow((state) => ({
      files: state.files,
      isConverting: state.isConverting,
      startConversion: state.startConversion,
    }))
  );

  const fileCount = files.length;
  const isDisabled = fileCount === 0 || isConverting;

  const handleClick = () => {
    if (isDisabled) return;
    startConversion();
  };

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={isConverting}
      className={cn(
        'group relative inline-flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-white shadow-lg shadow-primary/25',
        'gradient-bg-animated transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.99]',
        className
      )}
    >
      {isConverting && (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      )}
      <span>Convert</span>
      {fileCount > 0 && (
        <span className="flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold leading-none">
          {fileCount}
        </span>
      )}
    </Button>
  );
}
