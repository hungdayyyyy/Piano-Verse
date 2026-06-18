"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    name: "Minh Anh",
    title: "Hobbyist Pianist",
    avatar: null,
    rating: 5,
    text: "I've tried 4 piano apps before PianoVerse. The AI feedback is genuinely different — it noticed I was rushing 16th notes in my left hand and gave me a specific drill. Within 2 weeks my accuracy went from 67% to 89%.",
  },
  {
    name: "Sarah Chen",
    title: "Music Teacher",
    avatar: null,
    rating: 5,
    text: "I use PianoVerse for my students between lessons. The practice tracking lets me see exactly where they're struggling. The Educator features for managing multiple students are invaluable.",
  },
  {
    name: "Carlos Rivera",
    title: "Complete Beginner",
    avatar: null,
    rating: 5,
    text: "Played my first song (Für Elise, simplified) after just 12 days. The falling notes mode makes learning songs so intuitive. I practice for 30 minutes every day now — something I never did with traditional lessons.",
  },
  {
    name: "Priya Sharma",
    title: "Intermediate Pianist",
    avatar: null,
    rating: 5,
    text: "The Composer Studio is incredible. I hummed a melody on my commute, used Hum-to-MIDI, and had a full chord arrangement ready when I got home. It's transformed how I write music.",
  },
  {
    name: "James Park",
    title: "Classical Student",
    avatar: null,
    rating: 5,
    text: "The sheet music library and AI Teacher combo is unbeatable. Real-time note feedback while I practice Chopin nocturnes has accelerated my progress more than months of self-study.",
  },
  {
    name: "Lan Phương",
    title: "Parent & Learner",
    avatar: null,
    rating: 5,
    text: "Both my daughter and I use PianoVerse together. The gamification keeps her engaged and the leaderboard is friendly competition. We've both maintained 30-day streaks!",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-3.5 w-3.5", i < rating ? "fill-[var(--primary)] text-[var(--primary)]" : "text-[var(--border)]")}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAutoPlaying) return;
    intervalRef.current = setInterval(() => {
      setActive((v) => (v + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoPlaying]);

  const prev = () => {
    setIsAutoPlaying(false);
    setActive((v) => (v - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const next = () => {
    setIsAutoPlaying(false);
    setActive((v) => (v + 1) % TESTIMONIALS.length);
  };

  const visibleCount = 3;
  const visibleIndices = Array.from({ length: visibleCount }, (_, i) =>
    (active + i) % TESTIMONIALS.length
  );

  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-block rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-4 py-1.5 text-xs font-semibold text-[var(--accent)] mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Loved by musicians worldwide
          </h2>
          <p className="text-[var(--foreground-muted)] text-lg">
            Join thousands of learners who've transformed their piano skills with AI coaching.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {visibleIndices.map((idx, i) => {
            const t = TESTIMONIALS[idx];
            return (
              <div
                key={`${idx}-${i}`}
                className={cn(
                  "rounded-2xl border border-[var(--border)] bg-[var(--background-card)] p-6 transition-all duration-500",
                  i === 1 ? "md:scale-105 border-[var(--primary)]/30 shadow-lg shadow-[var(--primary)]/5" : "opacity-80"
                )}
              >
                <StarRating rating={t.rating} />
                <p className="mt-4 text-sm text-[var(--foreground-muted)] leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar firstName={t.name.split(" ")[0]} lastName={t.name.split(" ")[1]} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{t.title}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--border-muted)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setIsAutoPlaying(false); }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-[var(--primary)]" : "w-1.5 bg-[var(--border)]"
                )}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background-card)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--border-muted)] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
