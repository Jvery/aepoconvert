'use client';

import { useMemo } from "react";
import { ConvertButton } from "@/components/actions/ConvertButton";
import { ClearAllButton } from "@/components/actions/ClearAllButton";
import { DownloadButton } from "@/components/actions/DownloadButton";
import { FileList } from "@/components/files/FileList";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { DropZone } from "@/components/upload/DropZone";
import { PrivacyBadge } from "@/components/status/PrivacyBadge";
import { useConversionStore } from "@/store/conversion-store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getFormatByExtension } from "@/lib/formats";
import type { FormatCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Home() {
  const files = useConversionStore((state) => state.files);
  const { showClearConfirmation, confirmClearAll, cancelClearAll } = useKeyboardShortcuts();

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

  const hasFiles = files.length > 0;

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-primary/15 via-fuchsia-500/10 to-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-12 h-72 w-72 rounded-full bg-gradient-to-bl from-emerald-400/12 via-sky-400/10 to-indigo-500/15 blur-3xl" />
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-14">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Drop Zone */}
          <section className="rounded-2xl border border-foreground/5 bg-card/70 p-3 shadow-[0_20px_60px_-45px_rgba(59,130,246,0.35)] backdrop-blur">
            <div className="mb-3 flex justify-center">
              <PrivacyBadge />
            </div>
            <DropZone className="bg-transparent" />
          </section>

          {/* File List */}
          <section className="rounded-2xl border border-foreground/5 bg-card/60 p-4 shadow-[0_20px_70px_-50px_rgba(12,10,44,0.35)] backdrop-blur">
            <FileList />
          </section>

          {/* Quality Settings - only shown when files are added */}
          {hasFiles && (
            <section className="rounded-2xl border border-foreground/5 bg-card/60 p-4 shadow-[0_20px_70px_-52px_rgba(12,10,44,0.35)] backdrop-blur">
              <SettingsPanel activeCategories={activeCategories} />
            </section>
          )}

          {/* Action Buttons */}
          <section className="rounded-2xl border border-foreground/5 bg-card/70 p-4 shadow-[0_18px_60px_-48px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <ConvertButton className="flex-1 sm:flex-none" />
              <DownloadButton files={files} className="flex-1 sm:flex-none" />
              <ClearAllButton className="flex-1 sm:flex-none" />
            </div>
          </section>
        </div>
      </div>

      {/* Keyboard Shortcut Clear Confirmation Dialog */}
      <Dialog open={showClearConfirmation} onOpenChange={(open) => !open && cancelClearAll()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all files?</DialogTitle>
            <DialogDescription>
              This will remove all files from the list. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={cancelClearAll}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClearAll}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
