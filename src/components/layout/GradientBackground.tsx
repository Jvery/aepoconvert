'use client';

import { useEffect, useState } from 'react';

/**
 * Animated gradient background with floating blobs
 * Uses low opacity to not distract from main content
 * Respects prefers-reduced-motion media query
 */
export function GradientBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Top-left blob */}
      <div
        className={`
          absolute -left-40 -top-40 h-80 w-80 rounded-full
          bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-pink-500/15
          blur-3xl
          ${reducedMotion ? '' : 'animate-blob'}
        `}
      />

      {/* Top-right blob */}
      <div
        className={`
          absolute -right-40 -top-20 h-96 w-96 rounded-full
          bg-gradient-to-bl from-cyan-400/10 via-blue-500/15 to-indigo-500/10
          blur-3xl
          ${reducedMotion ? '' : 'animate-blob animation-delay-2000'}
        `}
      />

      {/* Bottom-left blob */}
      <div
        className={`
          absolute -left-20 bottom-0 h-72 w-72 rounded-full
          bg-gradient-to-tr from-emerald-400/10 via-teal-500/15 to-cyan-400/10
          blur-3xl
          ${reducedMotion ? '' : 'animate-blob animation-delay-4000'}
        `}
      />

      {/* Bottom-right blob */}
      <div
        className={`
          absolute -bottom-32 -right-32 h-80 w-80 rounded-full
          bg-gradient-to-tl from-orange-400/10 via-rose-500/15 to-pink-500/10
          blur-3xl
          ${reducedMotion ? '' : 'animate-blob animation-delay-6000'}
        `}
      />

      {/* Center blob (subtle) */}
      <div
        className={`
          absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-gradient-to-r from-violet-500/5 via-purple-500/10 to-fuchsia-500/5
          blur-3xl
          ${reducedMotion ? '' : 'animate-blob-slow'}
        `}
      />
    </div>
  );
}
