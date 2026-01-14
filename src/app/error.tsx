"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-destructive">
          Oops!
        </h1>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Something went wrong
        </h2>

        {/* Description */}
        <p className="mb-8 max-w-md text-muted-foreground">
          We encountered an unexpected error. Please try again, or return to the
          home page if the problem persists.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={reset}
            size="lg"
            className="gradient-bg-animated"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
