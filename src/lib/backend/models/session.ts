/**
 * Backend-agnostic session model
 * Represents an anonymous user session
 */
export interface Session {
  sessionId: string;
  deviceFingerprint: string;
  createdAt: Date;
  lastActiveAt: Date;
  isNew?: boolean;
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate a simple device fingerprint based on browser properties
 * This is not meant to be a secure fingerprint, just a way to identify returning devices
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ];

  // Simple hash function
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `fp_${Math.abs(hash).toString(36)}`;
}
