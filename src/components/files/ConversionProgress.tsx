'use client';

import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { ConversionStatus } from '@/types';
import { cn } from '@/lib/utils';

export interface ConversionProgressProps {
  /** Current conversion status */
  status: ConversionStatus;
  /** Conversion progress (0-100) */
  progress: number;
  /** Error message if status is 'error' */
  error: string | null;
}

/**
 * ConversionProgress component displays the conversion progress for a file
 * Shows a progress bar when converting, checkmark when complete, or error message when failed
 */
export function ConversionProgress({ status, progress, error }: ConversionProgressProps) {
  // Pending state - show nothing or minimal indicator
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span>Waiting to convert</span>
      </div>
    );
  }

  // Converting state - show animated gradient progress bar
  if (status === 'converting') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">
            Converting... {Math.round(progress)}%
          </span>
        </div>
        <div className="relative">
          {/* Custom progress bar with gradient animation */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300 ease-out",
                "gradient-bg-animated"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Shimmer effect overlay */}
          <div
            className="absolute inset-0 h-2 overflow-hidden rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite linear',
            }}
          />
        </div>
      </div>
    );
  }

  // Complete state - show checkmark
  if (status === 'complete') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        </div>
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          Complete
        </span>
      </div>
    );
  }

  // Error state - show error icon and message
  if (status === 'error') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-3 w-3 text-destructive" />
          </div>
          <span className="text-sm font-medium text-destructive">
            Error
          </span>
        </div>
        {error && (
          <p className="text-xs text-destructive/80 pl-7 line-clamp-2">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Fallback for unknown status
  return null;
}
