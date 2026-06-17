"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { PlayerBar } from "@/components/streaming/PlayerBar";
import { useAppSelector } from "@/store/hooks";
import { selectPlayerVisible } from "@/features/streaming/playerSlice";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const playerVisible = useAppSelector(selectPlayerVisible);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 md:relative md:z-auto md:flex transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <AppSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AppHeader onMobileMenuToggle={() => setMobileOpen((v) => !v)} />
        <main className={cn("flex-1 overflow-y-auto p-6", playerVisible && "pb-28")}>
          {children}
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
