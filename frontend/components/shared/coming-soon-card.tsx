import { Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonCardProps {
  title: string;
  description?: string;
  reason?: string;
}

export function ComingSoonCard({ title, description, reason }: ComingSoonCardProps) {
  return (
    <Card className="border-dashed border-amber-500/30 bg-amber-500/5">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <Construction className="h-8 w-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base font-semibold">{title}</h3>
            <Badge variant="mocked">Backend in progress</Badge>
          </div>
          {description && <p className="text-sm text-[var(--foreground-muted)] max-w-md">{description}</p>}
          {reason && (
            <p className="text-xs text-[var(--foreground-subtle)] max-w-md font-mono bg-[var(--background-muted)] px-3 py-1.5 rounded-md">
              {reason}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
