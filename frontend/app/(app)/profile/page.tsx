import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">Manage your account and preferences</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
