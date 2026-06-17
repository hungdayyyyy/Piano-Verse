import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border px-3 py-2 pr-10",
            "bg-[var(--background-card)] text-sm text-[var(--foreground)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-[var(--destructive)]"
              : "border-[var(--border)] hover:border-[var(--border-muted)]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
