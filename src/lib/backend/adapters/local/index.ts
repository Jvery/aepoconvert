"use client";

import type { IPreferencesRepository, ISessionRepository } from "../../interfaces";
import { LocalPreferencesAdapter } from "./preferences-adapter";
import { LocalSessionAdapter } from "./session-adapter";

export { LocalPreferencesAdapter } from "./preferences-adapter";
export { LocalSessionAdapter } from "./session-adapter";

/**
 * Create all local adapters (localStorage-based)
 */
export function createLocalAdapters(): {
  preferences: IPreferencesRepository;
  sessions: ISessionRepository;
} {
  return {
    preferences: new LocalPreferencesAdapter(),
    sessions: new LocalSessionAdapter(),
  };
}
