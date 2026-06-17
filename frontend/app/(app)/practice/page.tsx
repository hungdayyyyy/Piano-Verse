import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeHistory } from "@/components/practice/PracticeHistory";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Your session history and performance stats
          </p>
        </div>
        <Link href="/practice/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        }
      >
        <PracticeHistory />
      </Suspense>
    </div>
  );
}
