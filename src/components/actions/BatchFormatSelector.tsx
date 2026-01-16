'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Layers } from 'lucide-react';
import { useConversionStore } from '@/store/conversion-store';
import { getFormatByExtension, getConvertibleFormats } from '@/lib/formats';
import { cn } from '@/lib/utils';
import type { FormatInfo, FormatCategory } from '@/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BatchFormatSelectorProps {
  className?: string;
}

/**
 * Batch format selector that appears when all files share the same source format.
 * Allows setting the output format for all files at once.
 */
export function BatchFormatSelector({ className }: BatchFormatSelectorProps) {
  const { files, setAllOutputFormats } = useConversionStore(
    useShallow((state) => ({
      files: state.files,
      setAllOutputFormats: state.setAllOutputFormats,
    }))
  );

  // Check if all pending files have the same source format
  const batchInfo = useMemo(() => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return null;

    const firstFormat = pendingFiles[0].from;
    const allSameFormat = pendingFiles.every((f) => f.from === firstFormat);

    if (!allSameFormat) return null;

    const formatInfo = getFormatByExtension(firstFormat);
    if (!formatInfo) return null;

    const availableFormats = getConvertibleFormats(formatInfo);
    if (availableFormats.length === 0) return null;

    // Get the current common target format (if all have the same)
    const firstTarget = pendingFiles[0].to;
    const allSameTarget = pendingFiles.every((f) => f.to === firstTarget);

    return {
      sourceFormat: firstFormat,
      availableFormats,
      currentTarget: allSameTarget ? firstTarget : null,
      fileCount: pendingFiles.length,
    };
  }, [files]);

  if (!batchInfo) return null;

  const { availableFormats, currentTarget, fileCount } = batchInfo;

  // Group formats by category
  const formatsByCategory = availableFormats.reduce<
    Record<FormatCategory, FormatInfo[]>
  >(
    (acc, format) => {
      acc[format.category].push(format);
      return acc;
    },
    { image: [], audio: [], document: [] }
  );

  const categoryLabels: Record<FormatCategory, string> = {
    image: 'Images',
    audio: 'Audio',
    document: 'Documents',
  };

  const orderedCategories: FormatCategory[] = ['image', 'audio', 'document'];
  const categoriesWithFormats = orderedCategories.filter(
    (cat) => formatsByCategory[cat].length > 0
  );

  const selectedFormat = availableFormats.find(
    (f) => f.extensions.includes(currentTarget ?? '')
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        value={currentTarget ?? undefined}
        onValueChange={setAllOutputFormats}
      >
        <SelectTrigger
          className={cn(
            'h-12 w-full gap-2 rounded-xl border-foreground/10 px-3 sm:w-auto sm:min-w-[180px]',
            'bg-gradient-to-br from-muted/50 to-muted/30',
            'hover:border-primary/30 hover:from-primary/10 hover:to-primary/5',
            'transition-all duration-300'
          )}
          aria-label={fileCount === 1 ? "Set output format" : "Set output format for all files"}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-3.5 w-3.5" />
          </span>
          <SelectValue placeholder={fileCount === 1 ? "Convert to..." : "Convert all to..."}>
            {selectedFormat ? (
              <span className="flex items-center gap-1.5">
                {fileCount > 1 && <span className="text-sm">All to</span>}
                <span className="font-semibold uppercase">
                  {selectedFormat.extensions[0]}
                </span>
                {fileCount > 1 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {fileCount}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {fileCount === 1 ? "Convert to..." : "Convert all to..."}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {categoriesWithFormats.map((category) => (
            <SelectGroup key={category}>
              <SelectLabel>{categoryLabels[category]}</SelectLabel>
              {formatsByCategory[category].map((format) => (
                <SelectItem key={format.extensions[0]} value={format.extensions[0]}>
                  <span className="flex w-full items-center justify-between gap-3">
                    <span className="font-medium uppercase">
                      {format.extensions[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format.name}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
