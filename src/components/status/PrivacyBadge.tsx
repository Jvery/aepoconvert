'use client';

import { ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * PrivacyBadge component showing privacy assurance
 * Displays a badge with tooltip explaining local processing
 */
export function PrivacyBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-green-400"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>100% Private</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-center">
          <p className="font-medium">Your files never leave your device</p>
          <p className="mt-1 text-xs text-muted-foreground">
            All conversions are processed locally in your browser using WebAssembly.
            No data is uploaded to any server.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
