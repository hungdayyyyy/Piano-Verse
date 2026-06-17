"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Piano,
  Activity,
  Music2,
  BookOpen,
  Wand2,
  Cpu,
  Users,
  User,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser, selectRole } from "@/features/auth/authSlice";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { isAdmin, isTeacherOrAdmin } from "@/lib/auth/jwt";
import type { UserRole } from "@/lib/api/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
  teacherAndAdmin?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/piano", label: "Virtual Piano", icon: Piano },
  { href: "/practice", label: "Practice", icon: Activity },
  { href: "/music", label: "Music", icon: Music2 },
  { href: "/courses", label: "Courses", icon: BookOpen, badge: "Soon" },
  { href: "/studio", label: "Composer Studio", icon: Wand2, badge: "Soon" },
  { href: "/ai", label: "AI Studio", icon: Cpu, badge: "Beta" },
  { href: "/community", label: "Community", icon: Users, badge: "Soon" },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/profile/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

interface NavLinkProps {
  item: NavItem;
  active: boolean;
}

function NavLink({ item, active }: NavLinkProps) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
        "transition-all duration-150",
        active
          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--background-muted)] hover:text-[var(--foreground)]"
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", active && "text-[var(--primary-foreground)]")} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <Badge
          variant={item.badge === "Soon" ? "mocked" : "accent"}
          className="text-[10px] px-1.5 py-0"
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAppSelector(selectCurrentUser);
  const role = useAppSelector(selectRole) as UserRole | null;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const visibleBottom = BOTTOM_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin(role);
    if (item.teacherAndAdmin) return isTeacherOrAdmin(role);
    return true;
  });

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background-secondary)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--border)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
          <Sparkles className="h-4 w-4 text-[var(--primary-foreground)]" />
        </div>
        <div>
          <span className="font-bold text-sm text-[var(--foreground)]">PianoVerse</span>
          <span className="ml-1 text-xs text-[var(--primary)] font-semibold">AI</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-[var(--border)] px-3 py-3 space-y-1">
        {visibleBottom.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>

      {/* User card */}
      {user && (
        <div className="border-t border-[var(--border)] px-4 py-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-[var(--background-muted)] transition-colors"
          >
            <Avatar
              src={user.avatar}
              firstName={user.firstName}
              lastName={user.lastName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-[var(--foreground-muted)] truncate capitalize">
                {user.role}
              </p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
