import Link from "next/link";
import { Sparkles } from "lucide-react";
import CopyrightFooter from "./copyright-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]">
          <Sparkles className="h-5 w-5 text-[var(--primary-foreground)]" />
        </div>
        <span className="text-xl font-bold text-[var(--foreground)]">
          PianoVerse<span className="text-[var(--primary)] ml-0.5">AI</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm">{children}</div>

      {/* Footer */}
      <CopyrightFooter />
    </div>
  );
}
