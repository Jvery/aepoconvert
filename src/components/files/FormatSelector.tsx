"use client";

import { FormatInfo, FormatCategory } from "@/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormatSelectorProps {
  /** Currently selected format extension */
  currentFormat: string | null;
  /** Available formats to choose from */
  availableFormats: FormatInfo[];
  /** Callback when format is selected */
  onSelect: (format: string) => void;
}

/**
 * Component for selecting output format from available options
 * Groups formats by category (image, audio, document)
 */
export function FormatSelector({
  currentFormat,
  availableFormats,
  onSelect,
}: FormatSelectorProps) {
  const hasFormats = availableFormats.length > 0;
  const selectedValue =
    currentFormat ??
    availableFormats[0]?.extensions[0] ??
    '';

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

  // Category display names
  const categoryLabels: Record<FormatCategory, string> = {
    image: "Images",
    audio: "Audio",
    document: "Documents",
  };

  // Categories with formats (in display order)
  const orderedCategories: FormatCategory[] = ["image", "audio", "document"];
  const categoriesWithFormats = orderedCategories.filter(
    (cat) => formatsByCategory[cat].length > 0
  );

  // Find the selected format for display
  const selectedFormat = availableFormats.find(
    (f) => f.extensions.includes(selectedValue)
  );

  return (
    <Select
      value={selectedValue || undefined}
      onValueChange={onSelect}
      disabled={!hasFormats}
    >
      <SelectTrigger
        className="w-[160px]"
        aria-label={hasFormats ? "Select output format" : "No compatible outputs"}
      >
        <SelectValue placeholder={hasFormats ? "Select format" : "No formats available"}>
          {selectedFormat && (
            <span className="flex items-center gap-1.5">
              <span className="font-medium uppercase">
                {selectedFormat.extensions[0]}
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      {hasFormats && (
        <SelectContent>
          {categoriesWithFormats.map((category) => (
            <SelectGroup key={category}>
              <SelectLabel>{categoryLabels[category]}</SelectLabel>
              {formatsByCategory[category].map((format) => (
                <SelectItem key={format.extensions[0]} value={format.extensions[0]}>
                  <span className="flex items-center justify-between gap-3 w-full">
                    <span className="font-medium uppercase">
                      {format.extensions[0]}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {format.name}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      )}
    </Select>
  );
}
