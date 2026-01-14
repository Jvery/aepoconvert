'use client';

/**
 * SkipLink component provides a "Skip to main content" link for keyboard users.
 * The link is visually hidden by default and becomes visible when focused,
 * allowing keyboard users to bypass navigation and jump directly to main content.
 */
export function SkipLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[100]
        bg-background text-foreground
        px-4 py-2 rounded-md
        border border-border
        font-medium text-sm
        shadow-lg
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        transition-all duration-200
      "
    >
      Skip to main content
    </a>
  );
}
