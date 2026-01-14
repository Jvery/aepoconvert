"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedQualitySettings } from "@/components/settings/AdvancedQualitySettings";
import { SimpleQualitySettings } from "@/components/settings/SimpleQualitySettings";
import { useConversionStore } from "@/store/conversion-store";
import { cn } from "@/lib/utils";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/**
 * Collapsible settings panel that lets users switch between simple and advanced quality controls
 */
export function SettingsPanel() {
  const { globalSettings, setGlobalSettings } = useConversionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"simple" | "advanced">(
    globalSettings.mode === "advanced" ? "advanced" : "simple"
  );

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleTabChange = (value: string) => {
    if (value === "simple" || value === "advanced") {
      setActiveTab(value);
      setGlobalSettings({ mode: value });
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
            <span>Quality Settings</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Toggle presets or fine-tune advanced options for your conversions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls="settings-panel-content"
          className="gap-2"
        >
          {isOpen ? "Hide" : "Show"} settings
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen ? "rotate-180" : "rotate-0"
            )}
            aria-hidden
          />
        </Button>
      </div>

      <div
        id="settings-panel-content"
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
          isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!isOpen}
      >
        <div className="border-t p-4">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-4"
          >
            <TabsList className="w-full">
              <TabsTrigger value="simple">Simple</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="simple">
              <SimpleQualitySettings />
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedQualitySettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
