"use client";

import { useConversionStore } from "@/store/conversion-store";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FormatCategory } from "@/types";

/**
 * Audio bitrate options in kbps
 */
const BITRATE_OPTIONS = [
  { value: 64, label: "64 kbps" },
  { value: 128, label: "128 kbps" },
  { value: 192, label: "192 kbps" },
  { value: 256, label: "256 kbps" },
  { value: 320, label: "320 kbps" },
] as const;

/**
 * Sample rate options in Hz
 */
const SAMPLE_RATE_OPTIONS = [
  { value: 22050, label: "22,050 Hz" },
  { value: 44100, label: "44,100 Hz" },
  { value: 48000, label: "48,000 Hz" },
] as const;

interface AdvancedQualitySettingsProps {
  activeCategories: Set<FormatCategory>;
}

/**
 * Advanced quality settings component with fine-grained control
 * Shows only settings relevant to the file types currently added:
 * - Quality slider: shown for image and audio files
 * - Audio bitrate/sample rate: shown only for audio files
 */
export function AdvancedQualitySettings({ activeCategories }: AdvancedQualitySettingsProps) {
  const { globalSettings, setGlobalSettings } = useConversionStore();

  const hasImageFiles = activeCategories.has("image");
  const hasAudioFiles = activeCategories.has("audio");
  const showQualitySlider = hasImageFiles || hasAudioFiles;

  const handleQualityChange = (value: number[]) => {
    setGlobalSettings({ quality: value[0], mode: "advanced" });
  };

  const handleBitrateChange = (value: string) => {
    const bitrate = parseInt(value, 10);
    setGlobalSettings({ bitrate, mode: "advanced" });
  };

  const handleSampleRateChange = (value: string) => {
    const sampleRate = parseInt(value, 10);
    setGlobalSettings({ sampleRate, mode: "advanced" });
  };

  return (
    <div className="space-y-6">
      {/* Quality Slider - shown for image and audio files */}
      {showQualitySlider && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="quality-slider" className="text-sm font-medium">
              Quality
            </Label>
            <span className="text-sm text-muted-foreground font-mono">
              {globalSettings.quality}%
            </span>
          </div>
          <Slider
            id="quality-slider"
            min={1}
            max={100}
            step={1}
            value={[globalSettings.quality]}
            onValueChange={handleQualityChange}
            aria-label="Quality slider"
          />
          <p className="text-xs text-muted-foreground">
            Higher quality produces larger files
          </p>
        </div>
      )}

      {/* Audio Settings - shown only for audio files */}
      {hasAudioFiles && (
        <div className="grid grid-cols-2 gap-4">
          {/* Bitrate Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bitrate-select" className="text-sm font-medium">
                Audio Bitrate
              </Label>
              <span className="text-xs text-muted-foreground font-mono">
                {globalSettings.bitrate ? `${globalSettings.bitrate} kbps` : "Not set"}
              </span>
            </div>
            <Select
              value={globalSettings.bitrate?.toString() ?? ""}
              onValueChange={handleBitrateChange}
              aria-label="Select audio bitrate"
            >
              <SelectTrigger id="bitrate-select" className="w-full">
                <SelectValue placeholder="Select bitrate" />
              </SelectTrigger>
              <SelectContent>
                {BITRATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sample Rate Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sample-rate-select" className="text-sm font-medium">
                Sample Rate
              </Label>
              <span className="text-xs text-muted-foreground font-mono">
                {globalSettings.sampleRate ? `${globalSettings.sampleRate} Hz` : "Not set"}
              </span>
            </div>
            <Select
              value={globalSettings.sampleRate?.toString() ?? ""}
              onValueChange={handleSampleRateChange}
              aria-label="Select audio sample rate"
            >
              <SelectTrigger id="sample-rate-select" className="w-full">
                <SelectValue placeholder="Select rate" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_RATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Show message when only document files are added */}
      {!showQualitySlider && !hasAudioFiles && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No advanced settings available for document conversions
        </p>
      )}
    </div>
  );
}
