"use client";

import { useRef, useEffect } from "react";
import {
  Piano, Brain, Music2, Wand2, Activity, Trophy,
  Mic, BookOpen, Users, Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Piano,
    title: "88-Key Virtual Piano",
    description: "Full-range piano with 4 instrument sounds, WebMIDI support, and keyboard mapping. Practice anywhere, anytime.",
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
    badge: "Core",
  },
  {
    icon: Brain,
    title: "AI Teacher",
    description: "Real-time performance analysis, personalized feedback, and adaptive recommendations that evolve with your skill level.",
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
    badge: "AI",
  },
  {
    icon: Activity,
    title: "Practice Tracking",
    description: "Detailed session history, accuracy trends, streak heatmaps, and performance analytics to keep you motivated.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    badge: "Core",
  },
  {
    icon: Music2,
    title: "Music Streaming",
    description: "Thousands of piano tracks organized by difficulty, artist, and style. Build playlists, save favorites.",
    color: "from-green-500/20 to-green-600/5",
    iconColor: "text-green-400",
    badge: "Pro",
  },
  {
    icon: Wand2,
    title: "Composer Studio",
    description: "Piano roll editor with AI harmony suggestions, chord progression generator, and MIDI export.",
    color: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-400",
    badge: "Pro",
  },
  {
    icon: Mic,
    title: "Hum to MIDI",
    description: "Hum or sing a melody, let AI convert it to sheet music and MIDI. Bring your ideas to life instantly.",
    color: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-400",
    badge: "AI",
  },
  {
    icon: BookOpen,
    title: "Structured Courses",
    description: "Curated learning paths from beginner to advanced, with video lessons, exercises, and progress tracking.",
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
    badge: "Starter",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "XP system, streak rewards, achievements, and global leaderboards to make practice addictive.",
    color: "from-yellow-500/20 to-yellow-600/5",
    iconColor: "text-yellow-400",
    badge: "Free",
  },
  {
    icon: Zap,
    title: "Falling Notes Mode",
    description: "Watch notes fall and play along — the most intuitive way to learn songs by sight and feel.",
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-400",
    badge: "Free",
  },
];

const BADGE_COLORS: Record<string, string> = {
  Free: "bg-green-500/10 text-green-400 border border-green-500/20",
  Starter: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  Pro: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  Core: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  AI: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
};

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = feature.icon;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative rounded-2xl border border-[var(--border)] bg-[var(--background-card)] p-6 transition-all duration-300 hover:border-[var(--border-muted)] hover:shadow-lg hover:-translate-y-1"
      style={{
        opacity: 0,
        transform: "translateY(20px)",
        transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
      }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--background-muted)] group-hover:scale-110 transition-transform duration-300">
            <Icon className={`h-5 w-5 ${feature.iconColor}`} />
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE_COLORS[feature.badge] ?? ""}`}>
            {feature.badge}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--foreground)] mb-2">{feature.title}</h3>
          <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[var(--background-secondary)]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-block rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-4 py-1.5 text-xs font-semibold text-[var(--primary)] mb-4">
            Everything You Need
          </span>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            A complete piano learning ecosystem
          </h2>
          <p className="text-[var(--foreground-muted)] text-lg">
            From your first note to composing original pieces — PianoVerse AI has every tool you need on your musical journey.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
