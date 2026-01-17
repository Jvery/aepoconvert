'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, ChevronDown } from 'lucide-react';
import { ConvertButton } from '@/components/actions/ConvertButton';
import { ClearAllButton } from '@/components/actions/ClearAllButton';
import { DownloadButton } from '@/components/actions/DownloadButton';
import { BatchFormatSelector } from '@/components/actions/BatchFormatSelector';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConversionStore } from '@/store/conversion-store';
import { getFormatByExtension } from '@/lib/formats';
import { cn } from '@/lib/utils';
import type { FormatCategory } from '@/types';

/**
 * Action bar positioned at the top of the page content.
 * Contains convert, download, clear buttons and a settings toggle.
 */
export function ActionBar() {
  const files = useConversionStore((state) => state.files);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const hasFiles = files.length > 0;

  // Derive active file categories from added files
  const activeCategories = useMemo<Set<FormatCategory>>(() => {
    const categories = new Set<FormatCategory>();
    for (const file of files) {
      const format = getFormatByExtension(file.from);
      if (format) {
        categories.add(format.category);
      }
    }
    return categories;
  }, [files]);

  return (
    <>
      {/* Action Bar - Top of page */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          opacity: { duration: 0.2 }
        }}
        className="w-full"
      >
        <div
          className={cn(
            'mx-auto max-w-4xl',
            'rounded-2xl border border-white/10 dark:border-white/5',
            'bg-background/80 backdrop-blur-xl',
            'shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_4px_24px_-4px_rgba(0,0,0,0.08)]',
            'dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4),0_4px_24px_-4px_rgba(0,0,0,0.3)]',
            'p-3 sm:p-4'
          )}
        >
          {/* Subtle bottom gradient line */}
          <div className="absolute inset-x-0 bottom-0 h-px rounded-b-2xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Main Actions */}
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <BatchFormatSelector className="w-full sm:w-auto" />
              <ConvertButton className="w-full sm:w-auto" />
              <DownloadButton files={files} className="w-full sm:w-auto" />
              <ClearAllButton className="w-full sm:w-auto" />
            </div>

            {/* Settings Button */}
            <AnimatePresence>
              {hasFiles && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSettingsOpen(true)}
                    className={cn(
                      'group relative h-12 w-full gap-2 overflow-hidden rounded-xl border-foreground/10 px-4 sm:w-auto',
                      'bg-gradient-to-br from-muted/50 to-muted/30',
                      'hover:border-primary/30 hover:from-primary/10 hover:to-primary/5',
                      'transition-all duration-300'
                    )}
                    aria-label="Open quality settings"
                  >
                    {/* Animated background on hover */}
                    <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
                    </span>

                    <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Settings2 className="h-4 w-4" />
                    </span>
                    <span className="relative flex flex-col items-start text-left">
                      <span className="text-sm font-semibold">Settings</span>
                      <span className="text-[10px] text-muted-foreground">Quality options</span>
                    </span>
                    <ChevronDown className="relative ml-1 h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-y-0.5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          {/* Gradient accent line */}
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Settings2 className="h-4 w-4" />
              </span>
              Quality Settings
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            <SettingsPanel activeCategories={activeCategories} isEmbedded />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
