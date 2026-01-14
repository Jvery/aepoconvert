'use client';

import { Github, Shield } from 'lucide-react';

/**
 * Footer component with privacy message, GitHub link, and copyright
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        {/* Privacy Badge */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-green-500" />
          <span>All conversions happen locally in your browser</span>
        </div>

        {/* Copyright & GitHub */}
        <div className="flex items-center gap-4">
          {/* GitHub Link */}
          <a
            href="https://github.com/aepoconvert/aepoconvert"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="View source on GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          {/* Copyright */}
          <span className="text-sm text-muted-foreground">
            © {currentYear} aepoconvert
          </span>
        </div>
      </div>
    </footer>
  );
}
