import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Overview" };

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">Platform statistics and management</p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
