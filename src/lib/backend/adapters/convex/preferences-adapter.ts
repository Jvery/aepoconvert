"use client";

import type { ConvexReactClient } from "convex/react";
import type { IPreferencesRepository } from "../../interfaces";
import type { UserPreferences } from "../../models";
import { api } from "../../../../../convex/_generated/api";

/**
 * Convex implementation of the preferences repository
 * Note: Real-time subscriptions are handled via Convex's useQuery hook
 * in React components, not through this adapter's subscribe method.
 */
export class ConvexPreferencesAdapter implements IPreferencesRepository {
  constructor(private client: ConvexReactClient) {}

  async get(sessionId: string): Promise<UserPreferences> {
    const result = await this.client.query(api.preferences.get, { sessionId });

    return {
      sessionId: result.sessionId,
      qualityMode: result.qualityMode,
      defaultQuality: result.defaultQuality,
      defaultBitrate: result.defaultBitrate,
      defaultSampleRate: result.defaultSampleRate,
      updatedAt: new Date(result.updatedAt),
    };
  }

  async update(
    sessionId: string,
    data: Partial<Omit<UserPreferences, "sessionId" | "updatedAt">>
  ): Promise<void> {
    await this.client.mutation(api.preferences.upsert, {
      sessionId,
      qualityMode: data.qualityMode,
      defaultQuality: data.defaultQuality,
      defaultBitrate: data.defaultBitrate,
      defaultSampleRate: data.defaultSampleRate,
    });
  }

  // Note: Convex subscriptions are best handled via useQuery hook in React
  // The BackendProvider handles polling/refetching for cross-tab sync
}
