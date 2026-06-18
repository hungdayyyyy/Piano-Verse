"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Animated piano keys (pure CSS/canvas fallback when Three.js not loaded) ──
function PianoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const WHITE_KEY_COUNT = 22;
    const WKW = W / WHITE_KEY_COUNT;
    const WKH = H * 0.7;
    const BKW = WKW * 0.6;
    const BKH = WKH * 0.62;

    const BLACK_PATTERN = [1, 1, 0, 1, 1, 1, 0]; // which white keys have black after them
    const activeKeys: Set<number> = new Set();
    let lastSpawn = 0;

    function drawFrame(t: number) {
      timeRef.current = t;
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#09090b");
      bg.addColorStop(1, "#0f0f12");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Spawn random active key every 400ms
      if (t - lastSpawn > 400) {
        lastSpawn = t;
        const k = Math.floor(Math.random() * WHITE_KEY_COUNT);
        activeKeys.add(k);
        setTimeout(() => activeKeys.delete(k), 350);
      }

      // Draw white keys
      for (let i = 0; i < WHITE_KEY_COUNT; i++) {
        const x = i * WKW;
        const isActive = activeKeys.has(i);
        const grad = ctx.createLinearGradient(x, H - WKH, x, H);
        if (isActive) {
          grad.addColorStop(0, "#fde68a");
          grad.addColorStop(1, "#fbbf24");
        } else {
          grad.addColorStop(0, "#e5e5e5");
          grad.addColorStop(1, "#d4d4d4");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x + 1, H - WKH, WKW - 2, WKH - 1, [0, 0, 6, 6]);
        ctx.fill();

        // Glow for active
        if (isActive) {
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 20;
          ctx.fillStyle = "rgba(245,158,11,0.3)";
          ctx.beginPath();
          ctx.roundRect(x + 1, H - WKH, WKW - 2, WKH - 1, [0, 0, 6, 6]);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw black keys
      let bIdx = 0;
      for (let i = 0; i < WHITE_KEY_COUNT - 1; i++) {
        if (BLACK_PATTERN[i % 7]) {
          const x = (i + 1) * WKW - BKW / 2;
          const grad = ctx.createLinearGradient(x, H - WKH, x, H - WKH + BKH);
          grad.addColorStop(0, "#3f3f46");
          grad.addColorStop(1, "#1c1917");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, H - WKH, BKW, BKH, [0, 0, 4, 4]);
          ctx.fill();
          bIdx++;
        }
      }

      // Floating particles
      const particleCount = 12;
      for (let p = 0; p < particleCount; p++) {
        const px = (Math.sin(t * 0.0008 + p * 0.8) * 0.4 + 0.5) * W;
        const py = (Math.cos(t * 0.0005 + p * 1.2) * 0.3 + 0.3) * (H - WKH);
        const alpha = 0.15 + 0.1 * Math.sin(t * 0.001 + p);
        const size = 2 + Math.sin(t * 0.001 + p * 2) * 1;
        ctx.fillStyle = `rgba(245,158,11,${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ambient glow from keys
      const glowGrad = ctx.createRadialGradient(W / 2, H - WKH / 2, 0, W / 2, H - WKH / 2, W * 0.6);
      glowGrad.addColorStop(0, "rgba(245,158,11,0.04)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(drawFrame);
    }

    animRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={320}
      className="w-full rounded-2xl"
      style={{ maxWidth: 700 }}
    />
  );
}

// ─── Animated stat counter ────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = target / 60;
        const interval = setInterval(() => {
          start = Math.min(start + step, target);
          setCount(Math.floor(start));
          if (start >= target) clearInterval(interval);
        }, 16);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[var(--background)]">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[var(--primary)]/8 blur-3xl" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-[var(--accent)]/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--primary)]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left — copy */}
        <div className="space-y-8 animate-fade-in">
          <Badge variant="accent" className="gap-2 text-sm px-4 py-1.5 w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Piano Learning
          </Badge>

          <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
            Master Piano{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] via-amber-300 to-[var(--accent)] bg-clip-text text-transparent">
              with AI
            </span>
          </h1>

          <p className="text-lg text-[var(--foreground-muted)] leading-relaxed max-w-md">
            Real-time AI feedback, 88-key virtual piano, composition studio, and
            thousands of tracks — everything you need to go from beginner to concert pianist.
          </p>

          {/* Stats */}
          <div className="flex gap-8">
            {[
              { value: 10000, suffix: "+", label: "Learners" },
              { value: 500, suffix: "+", label: "Songs" },
              { value: 98, suffix: "%", label: "Satisfaction" },
            ].map(({ value, suffix, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-[var(--primary)]">
                  <AnimatedCounter target={value} suffix={suffix} />
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8 shadow-lg shadow-[var(--primary)]/25">
                Start for Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                See Features
              </Button>
            </a>
          </div>

          <p className="text-xs text-[var(--foreground-subtle)]">
            No credit card required · Free plan available · Cancel anytime
          </p>
        </div>

        {/* Right — 3D piano canvas */}
        <div className="relative flex items-center justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative w-full">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 blur-xl scale-105" />
            <div className="relative rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl">
              <PianoCanvas />
              {/* Overlay label */}
              <div className="absolute top-4 left-4">
                <Badge variant="accent" className="text-xs gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                  Live Virtual Piano
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
