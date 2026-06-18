import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Overview" };

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">Platform statistics and management</p>
      </div>
      <Suspense fallback={<Skeleton className="h-48 rounded-xl" />}>
        <AdminDashboard />
      </Suspense>
      <Tabs defaultValue="analytics">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <Suspense fallback={<div className="grid gap-4 md:grid-cols-2">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-64 rounded-xl"/>)}</div>}>
            <AdminAnalytics />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
