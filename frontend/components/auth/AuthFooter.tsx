"use client";

export function AuthFooter() {
  const year = new Date().getFullYear();
  return (
    <p className="mt-8 text-xs text-[var(--foreground-subtle)]">
      © {year} PianoVerse AI. All rights reserved.
    </p>
  );
}
