"use client";

export default function CopyrightFooter() {
  return (
    <p className="mt-8 text-xs text-[var(--foreground-subtle)]">
      © {new Date().getFullYear()} PianoVerse AI. All rights reserved.
    </p>
  );
}
