"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ConvexReactClient } from "convex/react";
import type { IPreferencesRepository, ISessionRepository } from "./interfaces";
import type { UserPreferences } from "./models";
import {
  generateSessionId,
  generateDeviceFingerprint,
  DEFAULT_PREFERENCES,
} from "./models";
import { createAdapters, type BackendType } from "./adapters";

const SESSION_STORAGE_KEY = "aepoconvert_session_id";

interface BackendContextValue {
  preferences: IPreferencesRepository;
  sessions: ISessionRepository;
  sessionId: string | null;
  isReady: boolean;
  currentPreferences: UserPreferences | null;
  updatePreferences: (
    data: Partial<Omit<UserPreferences, "sessionId" | "updatedAt">>
  ) => Promise<void>;
}

const BackendContext = createContext<BackendContextValue | null>(null);

/**
 * Hook to access backend repositories
 */
export function useBackend() {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error("useBackend must be used within BackendProvider");
  }
  return context;
}

interface BackendProviderProps {
  children: ReactNode;
  /**
   * Which backend to use.
   * - "convex": Use Convex (requires ConvexProvider as parent)
   * - "local": Use localStorage only
   */
  adapter?: BackendType;
  /**
   * Convex client instance (required when adapter is "convex")
   */
  convexClient?: ConvexReactClient;
}

/**
 * Provides backend repositories to the app
 * Handles session initialization and preferences sync
 */
export function BackendProvider({
  children,
  adapter = "convex",
  convexClient,
}: BackendProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentPreferences, setCurrentPreferences] =
    useState<UserPreferences | null>(null);

  // Create adapters
  const { preferences, sessions } = useMemo(() => {
    return createAdapters(adapter, convexClient);
  }, [adapter, convexClient]);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      // Check for existing session ID in localStorage
      let storedSessionId =
        typeof window !== "undefined"
          ? localStorage.getItem(SESSION_STORAGE_KEY)
          : null;

      const fingerprint = generateDeviceFingerprint();

      if (!storedSessionId) {
        storedSessionId = generateSessionId();
        if (typeof window !== "undefined") {
          localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
        }
      }

      try {
        // Register/update session in backend
        await sessions.getOrCreate(storedSessionId, fingerprint);
        setSessionId(storedSessionId);

        // Load preferences
        const prefs = await preferences.get(storedSessionId);
        setCurrentPreferences(prefs);
      } catch (error) {
        console.error("Failed to initialize backend session:", error);
        // Still set session ID so app can work in offline mode
        setSessionId(storedSessionId);
        setCurrentPreferences({
          ...DEFAULT_PREFERENCES,
          sessionId: storedSessionId,
          updatedAt: new Date(),
        });
      }

      setIsReady(true);
    };

    initSession();
  }, [sessions, preferences]);

  // Subscribe to preference changes (real-time sync)
  useEffect(() => {
    if (!sessionId || !preferences.subscribe) {
      return;
    }

    const unsubscribe = preferences.subscribe(sessionId, (prefs) => {
      setCurrentPreferences(prefs);
    });

    return unsubscribe;
  }, [sessionId, preferences]);

  // Helper to update preferences
  const updatePreferences = async (
    data: Partial<Omit<UserPreferences, "sessionId" | "updatedAt">>
  ) => {
    if (!sessionId) {
      return;
    }

    // Optimistic update
    setCurrentPreferences((prev) =>
      prev ? { ...prev, ...data, updatedAt: new Date() } : null
    );

    try {
      await preferences.update(sessionId, data);
    } catch (error) {
      console.error("Failed to update preferences:", error);
      // Revert on error by reloading
      const prefs = await preferences.get(sessionId);
      setCurrentPreferences(prefs);
    }
  };

  const value: BackendContextValue = {
    preferences,
    sessions,
    sessionId,
    isReady,
    currentPreferences,
    updatePreferences,
  };

  return (
    <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
  );
}
