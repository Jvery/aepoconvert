"use client";

import { type ReactNode, useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BackendProvider } from "@/lib/backend";
import { PreferencesSync } from "./PreferencesSync";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Combined providers for the app
 * Handles Convex + Backend with automatic fallback to localStorage
 */
export function Providers({ children }: ProvidersProps) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  // Create Convex client only if URL is configured
  const convex = useMemo(() => {
    if (!convexUrl) return null;
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  // If Convex is not configured, use local-only backend
  if (!convex) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BackendProvider adapter="local">
          <PreferencesSync />
          {children}
        </BackendProvider>
      </ThemeProvider>
    );
  }

  // Convex is configured, use it as the backend
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ConvexProvider client={convex}>
        <BackendProviderWithConvex convex={convex}>
          <PreferencesSync />
          {children}
        </BackendProviderWithConvex>
      </ConvexProvider>
    </ThemeProvider>
  );
}

/**
 * Inner component that can safely use Convex hooks
 */
function BackendProviderWithConvex({
  children,
  convex,
}: {
  children: ReactNode;
  convex: ConvexReactClient;
}) {
  return (
    <BackendProvider adapter="convex" convexClient={convex}>
      {children}
    </BackendProvider>
  );
}
