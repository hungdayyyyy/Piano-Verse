import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUserList } from "@/components/admin/AdminUserList";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Search, filter, and manage platform users
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-[600px] rounded-xl" />}>
        <AdminUserList />
      </Suspense>
    </div>
  );
}
