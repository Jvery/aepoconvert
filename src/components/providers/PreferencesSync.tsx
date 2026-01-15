"use client";

import { usePreferencesSync } from "@/hooks/usePreferencesSync";

/**
 * Component that syncs preferences between Zustand store and backend
 * Should be rendered once inside the Providers tree
 */
export function PreferencesSync() {
  usePreferencesSync();
  return null;
}
