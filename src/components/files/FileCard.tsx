'use client';

import { X, FileImage, FileAudio, FileText, File } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ConvertibleFile, FormatInfo } from '@/types';
import { detectFormat } from '@/lib/formats';
import { FormatSelector } from './FormatSelector';

export interface FileCardProps {
  /** The file data to display */
  file: ConvertibleFile;
  /** Callback when remove button is clicked */
  onRemove: () => void;
  /** Callback when output format is changed */
  onFormatChange: (format: string) => void;
  /** Available output formats */
  availableFormats: FormatInfo[];
}

/**
 * Format file size to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "256 KB")
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  // Show 2 decimal places for MB and larger, 0 for smaller
  const decimals = i >= 2 ? 2 : i >= 1 ? 1 : 0;
  return `${size.toFixed(decimals)} ${units[i]}`;
}

/**
 * Get the appropriate icon component for a file category
 * @param category - The file format category
 * @returns The lucide icon component
 */
function getFileIcon(category: string) {
  switch (category) {
    case 'image':
      return FileImage;
    case 'audio':
      return FileAudio;
    case 'document':
      return FileText;
    default:
      return File;
  }
}

/**
 * Truncate file name if too long, preserving extension
 * @param name - The file name
 * @param maxLength - Maximum length before truncation
 * @returns Truncated file name with ellipsis
 */
function truncateFileName(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) return name;

  const lastDot = name.lastIndexOf('.');
  if (lastDot === -1) {
    // No extension, just truncate
    return name.slice(0, maxLength - 3) + '...';
  }

  const extension = name.slice(lastDot);
  const baseName = name.slice(0, lastDot);
  const availableLength = maxLength - extension.length - 3; // 3 for "..."

  if (availableLength <= 0) {
    return name.slice(0, maxLength - 3) + '...';
  }

  return baseName.slice(0, availableLength) + '...' + extension;
}

/**
 * FileCard component displays a single uploaded file with its details
 * Shows file type icon, name, size, detected format badge, and remove button
 */
export function FileCard({ file, onRemove, onFormatChange, availableFormats }: FileCardProps) {
  // Detect format info for category-based icon
  const formatInfo = detectFormat(file.file);
  const category = formatInfo?.category || 'document';
  const FileIcon = getFileIcon(category);

  // Determine badge variant based on category
  const badgeVariant = category === 'image' ? 'default'
    : category === 'audio' ? 'secondary'
    : 'outline';

  const currentOutput = file.to ?? availableFormats[0]?.extensions[0] ?? null;

  return (
    <Card className="relative p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Remove button in top-right corner */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-60 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="flex items-start gap-3 pr-8">
        {/* File type icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* File details */}
        <div className="min-w-0 flex-1">
          {/* File name - truncated if long */}
          <p
            className="font-medium text-foreground truncate"
            title={file.name}
          >
            {truncateFileName(file.name)}
          </p>

          {/* File size */}
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatFileSize(file.size)}
          </p>

          {/* Format badge */}
          <div className="mt-2">
            <Badge variant={badgeVariant}>
              {file.from.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Convert to
          </p>
          <p className="text-sm text-muted-foreground">
            {availableFormats.length ? 'Choose your output format' : 'No compatible outputs'}
          </p>
        </div>
        <FormatSelector
          currentFormat={currentOutput}
          availableFormats={availableFormats}
          onSelect={onFormatChange}
        />
      </div>
    </Card>
  );
}
