"use client";

import { useRef, useEffect } from "react";
import { UserPlus, Target, Piano, TrendingUp } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Free Account",
    description: "Sign up in 30 seconds. No credit card required. Set your skill level and musical goals to personalize your experience.",
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary)]/10",
  },
  {
    step: "02",
    icon: Target,
    title: "Get Your Learning Path",
    description: "AI analyzes your skill level and goals to recommend the perfect starting point — courses, songs, and exercises tailored to you.",
    color: "text-[var(--accent)]",
    bg: "bg-[var(--accent)]/10",
  },
  {
    step: "03",
    icon: Piano,
    title: "Practice Every Day",
    description: "Use the virtual piano, follow courses, record sessions. The AI teacher gives real-time feedback on every note you play.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Watch your accuracy improve, build streaks, earn achievements, and climb the leaderboard. Every session makes you better.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

export function HowItWorksSection() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.height = "100%";
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el.parentElement!);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-24 bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-block rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-4 py-1.5 text-xs font-semibold text-[var(--accent)] mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            From zero to playing in weeks
          </h2>
          <p className="text-[var(--foreground-muted)] text-lg">
            Our AI-powered system adapts to your pace. Most students play their first song within 7 days.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-[28px] top-8 bottom-8 w-0.5 bg-[var(--border)] lg:left-1/2 lg:-translate-x-px overflow-hidden">
            <div
              ref={lineRef}
              className="w-full bg-gradient-to-b from-[var(--primary)] to-[var(--accent)]"
              style={{ height: "0%", transition: "height 1.5s ease" }}
            />
          </div>

          <div className="space-y-12">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isRight = i % 2 === 1;
              return (
                <div
                  key={step.step}
                  className={`relative flex items-start gap-6 lg:gap-0 ${
                    isRight ? "lg:flex-row-reverse" : "lg:flex-row"
                  }`}
                >
                  {/* Icon bubble — center on desktop */}
                  <div className="relative z-10 flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[var(--background)] bg-[var(--background-card)] shadow-lg lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.bg}`}>
                      <Icon className={`h-4 w-4 ${step.color}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 lg:w-[calc(50%-3.5rem)] ${isRight ? "lg:pr-16" : "lg:pl-16"} ${isRight ? "lg:text-right" : ""}`}>
                    <span className={`text-xs font-bold tracking-widest ${step.color}`}>{step.step}</span>
                    <h3 className="text-xl font-bold mt-1 mb-2">{step.title}</h3>
                    <p className="text-[var(--foreground-muted)] text-sm leading-relaxed">{step.description}</p>
                  </div>

                  {/* Empty side on desktop */}
                  <div className="hidden lg:block flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
