'use client';

import { ConvertButton } from "@/components/actions/ConvertButton";
import { ClearAllButton } from "@/components/actions/ClearAllButton";
import { DownloadButton } from "@/components/actions/DownloadButton";
import { FileList } from "@/components/files/FileList";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { DropZone } from "@/components/upload/DropZone";
import { useConversionStore } from "@/store/conversion-store";

export default function Home() {
  const { addFiles, files } = useConversionStore((state) => ({
    addFiles: state.addFiles,
    files: state.files,
  }));

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-primary/15 via-fuchsia-500/10 to-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-12 h-72 w-72 rounded-full bg-gradient-to-bl from-emerald-400/12 via-sky-400/10 to-indigo-500/15 blur-3xl" />
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-14">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Drop Zone */}
          <section className="rounded-2xl border border-foreground/5 bg-card/70 p-3 shadow-[0_20px_60px_-45px_rgba(59,130,246,0.35)] backdrop-blur">
            <DropZone onFilesSelected={addFiles} className="bg-transparent" />
          </section>

          {/* File List */}
          <section className="rounded-2xl border border-foreground/5 bg-card/60 p-4 shadow-[0_20px_70px_-50px_rgba(12,10,44,0.35)] backdrop-blur">
            <FileList />
          </section>

          {/* Quality Settings */}
          <section className="rounded-2xl border border-foreground/5 bg-card/60 p-4 shadow-[0_20px_70px_-52px_rgba(12,10,44,0.35)] backdrop-blur">
            <SettingsPanel />
          </section>

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
    </div>
  );
}
