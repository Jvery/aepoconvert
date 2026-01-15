"use client";

import type { IPreferencesRepository } from "../../interfaces";
import type { UserPreferences } from "../../models";
import { DEFAULT_PREFERENCES } from "../../models";

const STORAGE_KEY = "aepoconvert_preferences";

/**
 * LocalStorage implementation of the preferences repository
 * Used as a fallback when Convex is unavailable
 */
export class LocalPreferencesAdapter implements IPreferencesRepository {
  private getStorageKey(sessionId: string): string {
    return `${STORAGE_KEY}_${sessionId}`;
  }

  async get(sessionId: string): Promise<UserPreferences> {
    if (typeof window === "undefined") {
      return {
        ...DEFAULT_PREFERENCES,
        sessionId,
        updatedAt: new Date(),
      };
    }

    try {
      const stored = localStorage.getItem(this.getStorageKey(sessionId));
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          updatedAt: new Date(parsed.updatedAt),
        };
      }
    } catch {
      // Ignore parse errors
    }

    return {
      ...DEFAULT_PREFERENCES,
      sessionId,
      updatedAt: new Date(),
    };
  }

  async update(
    sessionId: string,
    data: Partial<Omit<UserPreferences, "sessionId" | "updatedAt">>
  ): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    const current = await this.get(sessionId);
    const updated: UserPreferences = {
      ...current,
      ...data,
      sessionId,
      updatedAt: new Date(),
    };

    localStorage.setItem(this.getStorageKey(sessionId), JSON.stringify(updated));

    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: this.getStorageKey(sessionId),
        newValue: JSON.stringify(updated),
      })
    );
  }

  subscribe(
    sessionId: string,
    onUpdate: (prefs: UserPreferences) => void
  ): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }

    const key = this.getStorageKey(sessionId);

    const handler = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          onUpdate({
            ...parsed,
            updatedAt: new Date(parsed.updatedAt),
          });
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("storage", handler);
    };
  }
}
