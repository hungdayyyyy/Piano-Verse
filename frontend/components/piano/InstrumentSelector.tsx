"use client";

import { Piano, Music2, Radio, Waves } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setInstrument, selectInstrument } from "@/features/piano/pianoSlice";
import { cn } from "@/lib/utils";

const INSTRUMENTS = [
  { id: "piano" as const, label: "Piano", icon: Piano, desc: "Grand piano" },
  { id: "organ" as const, label: "Organ", icon: Music2, desc: "Church organ" },
  { id: "synth" as const, label: "Synth", icon: Radio, desc: "Synthesizer" },
  { id: "strings" as const, label: "Strings", icon: Waves, desc: "String ensemble" },
];

export function InstrumentSelector() {
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectInstrument);

  return (
    <div className="flex gap-2">
      {INSTRUMENTS.map(({ id, label, icon: Icon, desc }) => (
        <button
          key={id}
          onClick={() => dispatch(setInstrument(id))}
          title={desc}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
            current === id
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
