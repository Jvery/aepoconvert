import type { QualityMode } from "@/types";

/**
 * Backend-agnostic user preferences model
 */
export interface UserPreferences {
  sessionId: string;
  qualityMode: QualityMode;
  defaultQuality: number;
  defaultBitrate?: number;
  defaultSampleRate?: number;
  updatedAt: Date;
}

/**
 * Default preferences for new sessions
 */
export const DEFAULT_PREFERENCES: Omit<UserPreferences, "sessionId" | "updatedAt"> = {
  qualityMode: "simple",
  defaultQuality: 80,
  defaultBitrate: undefined,
  defaultSampleRate: undefined,
};
