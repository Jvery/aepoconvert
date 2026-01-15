"use client";

import type { ConvexReactClient } from "convex/react";
import type { IPreferencesRepository, ISessionRepository } from "../../interfaces";
import { ConvexPreferencesAdapter } from "./preferences-adapter";
import { ConvexSessionAdapter } from "./session-adapter";

export { ConvexPreferencesAdapter } from "./preferences-adapter";
export { ConvexSessionAdapter } from "./session-adapter";

/**
 * Create all Convex adapters from a client instance
 */
export function createConvexAdapters(client: ConvexReactClient): {
  preferences: IPreferencesRepository;
  sessions: ISessionRepository;
} {
  return {
    preferences: new ConvexPreferencesAdapter(client),
    sessions: new ConvexSessionAdapter(client),
  };
}
