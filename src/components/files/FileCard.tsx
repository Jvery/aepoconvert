'use client';

import { X, FileImage, FileAudio, FileText, File, RotateCcw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ConvertibleFile, FormatInfo } from '@/types';
import { detectFormat } from '@/lib/formats';
import { FormatSelector } from './FormatSelector';
import { cn } from '@/lib/utils';

export interface FileCardProps {
  /** The file data to display */
  file: ConvertibleFile;
  /** Callback when remove button is clicked */
  onRemove: () => void;
  /** Callback when output format is changed */
  onFormatChange: (format: string) => void;
  /** Available output formats */
  availableFormats: FormatInfo[];
  /** Callback when retry button is clicked */
  onRetry?: () => void;
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
export function FileCard({ file, onRemove, onFormatChange, availableFormats, onRetry }: FileCardProps) {
  // Detect format info for category-based icon
  const formatInfo = detectFormat(file.file);
  const category = formatInfo?.category || 'document';
  const FileIcon = getFileIcon(category);

  // Determine badge variant based on category
  const badgeVariant = category === 'image' ? 'default'
    : category === 'audio' ? 'secondary'
    : 'outline';

  const currentOutput = file.to ?? availableFormats[0]?.extensions[0] ?? null;
  const isError = file.status === 'error';

  const hasPreview = !!file.previewUrl;

  return (
    <Card className={cn(
      "relative p-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
      hasPreview && "bg-transparent",
      isError && "border-destructive border-2 bg-destructive/5"
    )}>
      {/* Background preview layer for images */}
      {hasPreview && (
        <div className="absolute inset-0 z-0">
          <img
            src={file.previewUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Remove button in top-right corner */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-60 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive z-10"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="relative z-10 flex items-start gap-3 pr-8">
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

          {/* Error message displayed below file name */}
          {isError && file.error && (
            <div className="mt-2 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive line-clamp-2">
                {file.error}
              </p>
            </div>
          )}

          {/* Format badge */}
          <div className="mt-2">
            <Badge variant={badgeVariant}>
              {file.from.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Error state with retry button */}
      {isError && onRetry ? (
        <div className="relative z-10 mt-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-destructive">
              Conversion failed
            </p>
            <p className="text-sm text-muted-foreground">
              Click retry to try again
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Retry conversion for ${file.name}`}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Convert to
            </p>
            {/* Animated output format badge with pop effect on change */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentOutput}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Badge variant="outline" className="text-xs">
                  {currentOutput?.toUpperCase() || 'Select format'}
                </Badge>
              </motion.div>
            </AnimatePresence>
          </div>
          <FormatSelector
            currentFormat={currentOutput}
            availableFormats={availableFormats}
            onSelect={onFormatChange}
          />
        </div>
      )}
    </Card>
  );
}
