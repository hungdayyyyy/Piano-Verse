"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-[var(--background-secondary)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative rounded-3xl bg-gradient-to-br from-[var(--primary)]/15 via-[var(--background-card)] to-[var(--accent)]/10 border border-[var(--primary)]/20 px-8 py-16 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--primary)]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none" />

          {/* Floating piano keys decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-b-sm bg-[var(--foreground)]/[0.03] border border-[var(--foreground)]/[0.05]"
                style={{
                  width: `${20 + i * 3}px`,
                  height: `${50 + i * 5}px`,
                  top: `${10 + (i % 3) * 25}%`,
                  left: `${5 + i * 12}%`,
                  transform: `rotate(${-10 + i * 3}deg)`,
                  opacity: 0.4,
                }}
              />
            ))}
          </div>

          <div className="relative space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span className="text-xs font-semibold text-[var(--primary)]">Start your journey today</span>
            </div>

            <h2 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Your first song is{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                7 days away
              </span>
            </h2>

            <p className="text-[var(--foreground-muted)] text-lg leading-relaxed">
              Join over 10,000 learners who started with zero experience and are now playing
              beautiful music. Free forever plan available.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-10 shadow-xl shadow-[var(--primary)]/25 text-base">
                  Start for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base">
                  Sign In
                </Button>
              </Link>
            </div>

            <p className="text-xs text-[var(--foreground-subtle)]">
              No credit card · Free plan forever · Upgrade anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
