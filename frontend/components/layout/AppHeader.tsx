"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuth, selectCurrentUser } from "@/features/auth/authSlice";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { SearchBar } from "@/components/ui/search-bar";
import { toast } from "sonner";

interface AppHeaderProps {
  onMobileMenuToggle?: () => void;
  title?: string;
}

export function AppHeader({ onMobileMenuToggle, title }: AppHeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    // Route to music search if user types
    if (value.length > 2) {
      router.push(`/music?q=${encodeURIComponent(value)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      dispatch(clearAuth());
      router.push("/");
      toast.success("Logged out successfully");
    } catch {
      dispatch(clearAuth());
      router.push("/");
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--background-secondary)] px-4">
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title (mobile) */}
      {title && (
        <h1 className="text-sm font-semibold md:hidden">{title}</h1>
      )}

      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:block">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search music, artists…"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <button
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-lg",
            "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
            "hover:bg-[var(--background-muted)] transition-colors"
          )}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <Badge
            variant="destructive"
            className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            3
          </Badge>
        </button>

        {/* User menu */}
        {user && (
          <Dropdown
            align="right"
            trigger={
              <button
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--background-muted)] transition-colors"
                aria-label="User menu"
              >
                <Avatar
                  src={user.avatar}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="sm"
                />
              </button>
            }
          >
            <div className="px-3 py-2 border-b border-[var(--border)]">
              <p className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-[var(--foreground-muted)] truncate">{user.email}</p>
            </div>
            <DropdownItem icon={<User />} onClick={() => router.push("/profile")}>
              Profile
            </DropdownItem>
            <DropdownItem icon={<Settings />} onClick={() => router.push("/profile/settings")}>
              Settings
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={<LogOut />} destructive onClick={handleLogout}>
              Log out
            </DropdownItem>
          </Dropdown>
        )}
      </div>
    </header>
  );
}
