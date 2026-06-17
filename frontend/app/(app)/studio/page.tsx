import type { Metadata } from "next";
import { ComingSoonCard } from "@/components/shared/coming-soon-card";

export const metadata: Metadata = { title: "Composer Studio" };

export default function StudioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Composer Studio</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">Create and edit original compositions</p>
      </div>
      <ComingSoonCard
        title="Composer Studio Coming Soon"
        description="The piano-roll composition editor with AI harmony assistance is in development."
        reason="composition.routes.js: POST /create and GET /:id are inline TODO stubs returning plain messages. CompositionService and Repository exist but are not connected to any routes."
      />
    </div>
  );
}
