'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useConversionStore } from '@/store/conversion-store';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ClearAllButtonProps {
  /** Optional class name for layout control */
  className?: string;
}

/**
 * Ghost/outline action that asks for confirmation before clearing all files.
 * Hidden entirely when there are no files loaded.
 */
export function ClearAllButton({ className }: ClearAllButtonProps) {
  const { files, clearAll } = useConversionStore(
    useShallow((state) => ({
      files: state.files,
      clearAll: state.clearAll,
    }))
  );
  const [open, setOpen] = useState(false);

  if (files.length === 0) return null;

  const handleConfirm = () => {
    clearAll();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="lg"
          aria-label="Clear all files"
          className={cn(
            'group relative inline-flex h-12 min-w-[160px] items-center justify-center overflow-hidden border-dashed border-foreground/20 bg-transparent text-sm font-semibold text-foreground/80',
            'hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive transition-all duration-200 ease-out',
            'focus-visible:border-destructive/60 focus-visible:ring-2 focus-visible:ring-destructive/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            className
          )}
        >
          <span className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-amber-400/10 to-orange-500/10 blur-2xl" />
          </span>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-foreground/15 bg-gradient-to-br from-background to-muted/40 text-foreground/70 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.45)] transition-colors group-hover:border-destructive/50 group-hover:text-destructive">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="ml-3 flex flex-col text-left leading-tight">
            <span className="text-sm font-semibold tracking-wide">Clear all</span>
            <span className="text-[11px] text-muted-foreground">Reset the queue</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-md sm:max-w-md">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-gradient-to-r from-destructive via-amber-500 to-orange-400"
        />
        <DialogHeader className="pt-1">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive shadow-[0_12px_30px_-18px_rgba(239,68,68,0.7)]">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="text-left">
              <DialogTitle className="text-lg font-semibold">Clear all files?</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                This will remove every file from the conversion queue. You can&apos;t undo this action.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Keep files
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            className="shadow-[0_16px_40px_-20px_rgba(239,68,68,0.5)]"
            onClick={handleConfirm}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear everything
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
