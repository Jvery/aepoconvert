"use client";

import type { ConvexReactClient } from "convex/react";
import type { ISessionRepository } from "../../interfaces";
import type { Session } from "../../models";
import { api } from "../../../../../convex/_generated/api";

/**
 * Convex implementation of the session repository
 */
export class ConvexSessionAdapter implements ISessionRepository {
  constructor(private client: ConvexReactClient) {}

  async getOrCreate(sessionId: string, deviceFingerprint: string): Promise<Session> {
    const result = await this.client.mutation(api.sessions.getOrCreate, {
      sessionId,
      deviceFingerprint,
    });

    return {
      sessionId: result.sessionId,
      deviceFingerprint,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      isNew: result.isNew,
    };
  }

  async touch(sessionId: string): Promise<void> {
    await this.client.mutation(api.sessions.touch, { sessionId });
  }

  async get(sessionId: string): Promise<Session | null> {
    const result = await this.client.query(api.sessions.get, { sessionId });

    if (!result) {
      return null;
    }

    return {
      sessionId: result.sessionId,
      deviceFingerprint: result.deviceFingerprint,
      createdAt: new Date(result.createdAt),
      lastActiveAt: new Date(result.lastActiveAt),
    };
  }
}
