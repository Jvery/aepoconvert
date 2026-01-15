import type { UserPreferences } from "../models";

/**
 * Repository interface for user preferences
 * Implementations can use Convex, localStorage, or other backends
 */
export interface IPreferencesRepository {
  /**
   * Get preferences for a session
   * Returns default preferences if none exist
   */
  get(sessionId: string): Promise<UserPreferences>;

  /**
   * Update preferences (partial update)
   */
  update(sessionId: string, data: Partial<Omit<UserPreferences, "sessionId" | "updatedAt">>): Promise<void>;

  /**
   * Subscribe to real-time preference changes
   * Returns unsubscribe function
   */
  subscribe?(
    sessionId: string,
    onUpdate: (prefs: UserPreferences) => void
  ): () => void;
}
