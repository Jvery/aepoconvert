"use client";

import type { ISessionRepository } from "../../interfaces";
import type { Session } from "../../models";

const STORAGE_KEY = "aepoconvert_session";

/**
 * LocalStorage implementation of the session repository
 * Used as a fallback when Convex is unavailable
 */
export class LocalSessionAdapter implements ISessionRepository {
  async getOrCreate(sessionId: string, deviceFingerprint: string): Promise<Session> {
    if (typeof window === "undefined") {
      return {
        sessionId,
        deviceFingerprint,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        isNew: true,
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Update last active time
        const updated = {
          ...parsed,
          lastActiveAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        return {
          sessionId: parsed.sessionId,
          deviceFingerprint: parsed.deviceFingerprint,
          createdAt: new Date(parsed.createdAt),
          lastActiveAt: new Date(),
          isNew: false,
        };
      }
    } catch {
      // Ignore parse errors
    }

    // Create new session
    const now = Date.now();
    const session = {
      sessionId,
      deviceFingerprint,
      createdAt: now,
      lastActiveAt: now,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    return {
      sessionId,
      deviceFingerprint,
      createdAt: new Date(now),
      lastActiveAt: new Date(now),
      isNew: true,
    };
  }

  async touch(sessionId: string): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId === sessionId) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...parsed,
              lastActiveAt: Date.now(),
            })
          );
        }
      }
    } catch {
      // Ignore errors
    }
  }

  async get(sessionId: string): Promise<Session | null> {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId === sessionId) {
          return {
            sessionId: parsed.sessionId,
            deviceFingerprint: parsed.deviceFingerprint,
            createdAt: new Date(parsed.createdAt),
            lastActiveAt: new Date(parsed.lastActiveAt),
          };
        }
      }
    } catch {
      // Ignore parse errors
    }

    return null;
  }
}
