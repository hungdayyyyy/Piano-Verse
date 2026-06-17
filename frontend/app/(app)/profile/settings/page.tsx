import type { Metadata } from "next";
import { SettingsContent } from "@/components/profile/SettingsContent";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Manage your account settings
        </p>
      </div>
      <SettingsContent />
    </div>
  );
}
