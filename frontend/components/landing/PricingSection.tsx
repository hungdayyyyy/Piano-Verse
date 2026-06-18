"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Perfect to get started",
    badge: null,
    features: [
      "Virtual Piano (full 88 keys)",
      "5 AI generations/month",
      "Basic practice tracking",
      "Public music catalog",
      "Community leaderboard",
      "3 course previews",
    ],
    cta: "Get Started Free",
    variant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Starter",
    price: { monthly: 9.99, annual: 7.99 },
    description: "For serious beginners",
    badge: null,
    features: [
      "Everything in Free",
      "Full course library",
      "30 AI generations/month",
      "Practice history (90 days)",
      "Song recommendations",
      "Email support",
    ],
    cta: "Start Starter",
    variant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    price: { monthly: 19.99, annual: 15.99 },
    description: "Most popular",
    badge: "Most Popular",
    features: [
      "Everything in Starter",
      "AI Teacher real-time feedback",
      "Composition Studio",
      "Hum-to-MIDI",
      "320kbps streaming + offline",
      "100 AI generations/month",
      "Streak freeze",
      "Priority support",
    ],
    cta: "Start Pro",
    variant: "default" as const,
    highlighted: true,
  },
  {
    name: "Master",
    price: { monthly: 39.99, annual: 31.99 },
    description: "For dedicated musicians",
    badge: null,
    features: [
      "Everything in Pro",
      "Unlimited AI generations",
      "Voice-to-Piano AI",
      "AI Sheet Generator (clean PDF)",
      "Advanced analytics",
      "Early access to new features",
    ],
    cta: "Start Master",
    variant: "outline" as const,
    highlighted: false,
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-[var(--background-secondary)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <span className="inline-block rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-4 py-1.5 text-xs font-semibold text-[var(--primary)] mb-4">
            Pricing
          </span>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Start free, scale when ready
          </h2>
          <p className="text-[var(--foreground-muted)] text-lg mb-8">
            All plans include the virtual piano and basic features. Upgrade for AI coaching and advanced tools.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--background-card)] p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-all", !annual ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--foreground-muted)]")}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5", annual ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--foreground-muted)]")}
            >
              Annual
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", annual ? "bg-white/20 text-white" : "bg-green-500/20 text-green-400")}>
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl border p-6 flex flex-col transition-all",
                  plan.highlighted
                    ? "border-[var(--primary)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent shadow-lg shadow-[var(--primary)]/10 scale-[1.02]"
                    : "border-[var(--border)] bg-[var(--background-card)] hover:border-[var(--border-muted)]"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-[var(--primary-foreground)]">
                      <Sparkles className="h-3 w-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-[var(--foreground-muted)]">/mo</span>
                    )}
                  </div>
                  {annual && price > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      Billed ${(price * 12).toFixed(0)}/year · Save ${((plan.price.monthly - price) * 12).toFixed(0)}
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0 text-[var(--success)] mt-0.5" />
                      <span className="text-[var(--foreground-muted)]">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register">
                  <Button variant={plan.variant} className="w-full" size="sm">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-[var(--foreground-subtle)] mt-8">
          All prices in USD. Cancel anytime. Annual plans billed upfront.
        </p>
      </div>
    </section>
  );
}
