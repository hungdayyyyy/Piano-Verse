import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-16 text-center", className)}>
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background-muted)]">
          <Icon className="h-8 w-8 text-[var(--foreground-muted)]" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-[var(--foreground-muted)] max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
