"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
}

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled,
  label,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-[var(--background-muted)]">
        <div
          className="absolute h-full bg-[var(--primary)] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "absolute inset-0 h-full w-full cursor-pointer opacity-0",
          disabled && "cursor-not-allowed"
        )}
      />
      <div
        className={cn(
          "absolute h-5 w-5 rounded-full border-2 border-[var(--primary)] bg-[var(--background-card)]",
          "shadow-md transition-transform hover:scale-110",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          disabled && "opacity-50"
        )}
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
}

export { Slider };
