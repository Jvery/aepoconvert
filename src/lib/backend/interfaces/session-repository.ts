import type { Session } from "../models";

/**
 * Repository interface for session management
 * Handles anonymous sessions (device-based)
 */
export interface ISessionRepository {
  /**
   * Get or create an anonymous session
   * Uses device fingerprint for identification
   */
  getOrCreate(sessionId: string, deviceFingerprint: string): Promise<Session>;

  /**
   * Update session activity timestamp
   */
  touch(sessionId: string): Promise<void>;

  /**
   * Get session by ID
   */
  get(sessionId: string): Promise<Session | null>;
}
