import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({ label, error, hint, required, children, className, htmlFor }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-[var(--destructive)]">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
      {!error && hint && <p className="text-xs text-[var(--foreground-muted)]">{hint}</p>}
    </div>
  );
}
