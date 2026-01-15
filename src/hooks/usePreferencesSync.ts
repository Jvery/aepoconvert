"use client";

import { useEffect, useRef } from "react";
import { useBackend } from "@/lib/backend";
import { useConversionStore } from "@/store/conversion-store";

/**
 * Hook that syncs Zustand store's globalSettings with backend preferences
 * Should be used once at the app root level
 */
export function usePreferencesSync() {
  const { currentPreferences, updatePreferences, isReady } = useBackend();
  const globalSettings = useConversionStore((state) => state.globalSettings);
  const setGlobalSettings = useConversionStore((state) => state.setGlobalSettings);

  // Track if we've done initial sync
  const hasInitialized = useRef(false);
  // Track the last settings we synced to avoid loops
  const lastSyncedSettings = useRef<string>("");

  // Load preferences from backend when ready
  useEffect(() => {
    if (!isReady || !currentPreferences || hasInitialized.current) {
      return;
    }

    // Apply backend preferences to store
    setGlobalSettings({
      mode: currentPreferences.qualityMode,
      quality: currentPreferences.defaultQuality,
      bitrate: currentPreferences.defaultBitrate,
      sampleRate: currentPreferences.defaultSampleRate,
    });

    // Mark as initialized and record the settings
    hasInitialized.current = true;
    lastSyncedSettings.current = JSON.stringify({
      mode: currentPreferences.qualityMode,
      quality: currentPreferences.defaultQuality,
      bitrate: currentPreferences.defaultBitrate,
      sampleRate: currentPreferences.defaultSampleRate,
    });
  }, [isReady, currentPreferences, setGlobalSettings]);

  // Sync store changes to backend (debounced)
  useEffect(() => {
    if (!isReady || !hasInitialized.current) {
      return;
    }

    const currentSettingsStr = JSON.stringify({
      mode: globalSettings.mode,
      quality: globalSettings.quality,
      bitrate: globalSettings.bitrate,
      sampleRate: globalSettings.sampleRate,
    });

    // Skip if settings haven't changed
    if (currentSettingsStr === lastSyncedSettings.current) {
      return;
    }

    // Debounce the sync
    const timeoutId = setTimeout(() => {
      updatePreferences({
        qualityMode: globalSettings.mode,
        defaultQuality: globalSettings.quality,
        defaultBitrate: globalSettings.bitrate,
        defaultSampleRate: globalSettings.sampleRate,
      });
      lastSyncedSettings.current = currentSettingsStr;
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isReady, globalSettings, updatePreferences]);

  // Sync backend changes back to store (for cross-tab sync)
  useEffect(() => {
    if (!isReady || !currentPreferences || !hasInitialized.current) {
      return;
    }

    const backendSettingsStr = JSON.stringify({
      mode: currentPreferences.qualityMode,
      quality: currentPreferences.defaultQuality,
      bitrate: currentPreferences.defaultBitrate,
      sampleRate: currentPreferences.defaultSampleRate,
    });

    // If backend has different settings (from another tab), update store
    if (backendSettingsStr !== lastSyncedSettings.current) {
      setGlobalSettings({
        mode: currentPreferences.qualityMode,
        quality: currentPreferences.defaultQuality,
        bitrate: currentPreferences.defaultBitrate,
        sampleRate: currentPreferences.defaultSampleRate,
      });
      lastSyncedSettings.current = backendSettingsStr;
    }
  }, [isReady, currentPreferences, setGlobalSettings]);
}
