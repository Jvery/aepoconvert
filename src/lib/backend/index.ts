// Interfaces
export type { IPreferencesRepository, ISessionRepository } from "./interfaces";

// Models
export type { UserPreferences, Session } from "./models";
export {
  DEFAULT_PREFERENCES,
  generateSessionId,
  generateDeviceFingerprint,
} from "./models";

// Adapters
export type { BackendType, BackendAdapters } from "./adapters";
export { createAdapters, createConvexAdapters, createLocalAdapters } from "./adapters";

// Provider
export { BackendProvider, useBackend } from "./provider";
