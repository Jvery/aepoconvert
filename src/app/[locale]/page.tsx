'use client';

import { DropZone } from "@/components/upload/DropZone";
import { FileList } from "@/components/files/FileList";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { useConversionStore } from "@/store/conversion-store";

export default function Home() {
  const addFiles = useConversionStore((state) => state.addFiles);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Drop Zone */}
        <DropZone onFilesSelected={addFiles} />

        {/* File List */}
        <FileList />

        {/* Quality Settings */}
        <SettingsPanel />
      </div>
    </div>
  );
}
