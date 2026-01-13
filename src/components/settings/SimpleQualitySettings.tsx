"use client";

import { useConversionStore } from "@/store/conversion-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Quality preset options with their corresponding values and descriptions
 */
const QUALITY_PRESETS = [
  {
    label: "Low",
    value: 60,
    description: "Smaller file size, lower quality",
  },
  {
    label: "Medium",
    value: 80,
    description: "Balanced quality and size",
  },
  {
    label: "High",
    value: 95,
    description: "Best quality, larger files",
  },
] as const;

/**
 * Simple quality settings component with Low/Medium/High presets
 * Updates global settings in the conversion store on selection
 */
export function SimpleQualitySettings() {
  const { globalSettings, setGlobalSettings } = useConversionStore();
  const currentQuality = globalSettings.quality;

  const handleSelect = (value: number) => {
    setGlobalSettings({ quality: value, mode: "simple" });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {QUALITY_PRESETS.map((preset) => {
          const isSelected = currentQuality === preset.value;
          return (
            <Button
              key={preset.label}
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleSelect(preset.value)}
              className={cn(
                "flex-1 transition-all",
                isSelected && "ring-2 ring-primary/20"
              )}
              aria-pressed={isSelected}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      {/* Description for selected preset */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {QUALITY_PRESETS.find((p) => p.value === currentQuality)?.description ||
            "Select a quality preset"}
        </p>
      </div>
    </div>
  );
}
