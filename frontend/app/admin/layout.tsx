import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export const metadata: Metadata = { title: { template: "%s | Admin", default: "Admin" } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Role enforcement is done in middleware.ts — this layout just provides the shell
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AppHeader title="Admin" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
