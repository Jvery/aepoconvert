"use client";

import type { ConvexReactClient } from "convex/react";
import type { IPreferencesRepository, ISessionRepository } from "../interfaces";
import { createConvexAdapters } from "./convex";
import { createLocalAdapters } from "./local";

export type BackendType = "convex" | "local";

export interface BackendAdapters {
  preferences: IPreferencesRepository;
  sessions: ISessionRepository;
}

/**
 * Create backend adapters based on the specified type
 *
 * @param type - The backend type to use
 * @param convexClient - Required when type is "convex"
 */
export function createAdapters(
  type: BackendType,
  convexClient?: ConvexReactClient
): BackendAdapters {
  switch (type) {
    case "convex":
      if (!convexClient) {
        console.warn("Convex client not provided, falling back to local storage");
        return createLocalAdapters();
      }
      return createConvexAdapters(convexClient);

    case "local":
    default:
      return createLocalAdapters();
  }
}

export { createConvexAdapters } from "./convex";
export { createLocalAdapters } from "./local";
