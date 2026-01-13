'use client';

import { FileCard } from './FileCard';
import { useConversionStore } from '@/store/conversion-store';
import { getConvertibleFormats, getFormatByExtension } from '@/lib/formats';
import { FileX } from 'lucide-react';

/**
 * FileList component displays all uploaded files from the conversion store
 * Shows an empty state message when no files are added
 * Uses CSS grid for responsive layout
 */
export function FileList() {
  // Read files from conversion store
  const files = useConversionStore((state) => state.files);
  const removeFile = useConversionStore((state) => state.removeFile);
  const setOutputFormat = useConversionStore((state) => state.setOutputFormat);

  // Empty state when no files
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          No files added yet
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Drag and drop files above or click to browse
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => {
        // Get available output formats for this file
        const formatInfo = getFormatByExtension(file.from);
        const availableFormats = formatInfo ? getConvertibleFormats(formatInfo) : [];

        return (
          <FileCard
            key={file.id}
            file={file}
            onRemove={() => removeFile(file.id)}
            onFormatChange={(format) => setOutputFormat(file.id, format)}
          />
        );
      })}
    </div>
  );
}
