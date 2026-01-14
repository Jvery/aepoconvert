import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>

            {/* Heading */}
            <h1 className="mb-2 text-4xl font-bold tracking-tight gradient-text">
              404
            </h1>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Page not found
            </h2>

            {/* Description */}
            <p className="mb-8 max-w-md text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It
              might have been moved or doesn&apos;t exist.
            </p>

            {/* Back to home button */}
            <Button asChild size="lg" className="gradient-bg-animated">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
