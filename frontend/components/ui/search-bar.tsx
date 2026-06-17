"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className,
  onClear,
  autoFocus,
}: SearchBarProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-[var(--foreground-muted)] pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background-card)]",
          "pl-9 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)]",
          "transition-colors hover:border-[var(--border-muted)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent",
          value && "pr-9"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); onClear?.(); }}
          className="absolute right-3 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
