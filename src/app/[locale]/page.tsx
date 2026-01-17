'use client';

import { FileList } from "@/components/files/FileList";
import { DropZone } from "@/components/upload/DropZone";
import { PrivacyBadge } from "@/components/status/PrivacyBadge";
import { ActionBar } from "@/components/actions/ActionBar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
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
  const { showClearConfirmation, confirmClearAll, cancelClearAll } = useKeyboardShortcuts();

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-primary/15 via-fuchsia-500/10 to-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-12 h-72 w-72 rounded-full bg-gradient-to-bl from-emerald-400/12 via-sky-400/10 to-indigo-500/15 blur-3xl" />
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-14">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Action Bar - Top of page */}
          <ActionBar />

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
