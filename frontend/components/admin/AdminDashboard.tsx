"use client";

import Link from "next/link";
import { Users, UserCheck, UserX, Music2, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStatsQuery } from "@/features/admin/adminApi";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { data, isLoading, isError } = useGetStatsQuery();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <p className="text-[var(--foreground-muted)]">Failed to load stats.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          color="bg-[var(--primary)]/10 text-[var(--primary)]"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          color="bg-[var(--success)]/10 text-[var(--success)]"
        />
        <StatCard
          icon={UserX}
          label="Suspended Users"
          value={stats.suspendedUsers.toLocaleString()}
          color="bg-[var(--destructive)]/10 text-[var(--destructive)]"
        />
        <StatCard
          icon={Music2}
          label="Total Courses"
          value={stats.totalCourses.toLocaleString()}
          color="bg-[var(--accent)]/10 text-[var(--accent)]"
        />
        <StatCard
          icon={Activity}
          label="Practice Sessions"
          value={stats.totalSessions.toLocaleString()}
          color="bg-[var(--primary)]/10 text-[var(--primary)]"
        />
      </div>

      <div className="flex gap-3">
        <Link href="/admin/users">
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Manage Users
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
