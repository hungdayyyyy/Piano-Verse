import type { Metadata } from "next";
import { TrackUploadForm } from "@/components/streaming/TrackUploadForm";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Upload Track" };

export default function UploadPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Track</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">Add audio or video tracks to the library</p>
        </div>
        <Badge variant="accent" className="gap-1.5">
          <ShieldCheck className="h-3 w-3" />Teacher / Admin
        </Badge>
      </div>
      <TrackUploadForm />
    </div>
  );
}
