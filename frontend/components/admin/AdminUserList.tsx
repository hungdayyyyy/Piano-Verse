"use client";

import { useState } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useGetUsersQuery,
  useSearchUsersQuery,
  useSuspendUserMutation,
  useActivateUserMutation,
  useDeleteUserMutation,
} from "@/features/admin/adminApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SearchBar } from "@/components/ui/search-bar";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogCloseButton,
} from "@/components/ui/dialog";
import { formatDate, capitalize } from "@/lib/utils";
import { toast } from "sonner";
import type { User, UserStatus, UserRole } from "@/lib/api/types";
import { ShieldAlert, UserCheck, Trash2, ExternalLink } from "lucide-react";

const statusVariant: Record<UserStatus, "success" | "destructive" | "secondary"> = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
};

const roleVariant: Record<UserRole, "default" | "accent" | "destructive"> = {
  user: "default",
  teacher: "accent",
  admin: "destructive",
};

interface ConfirmDialog {
  type: "suspend" | "activate" | "delete";
  user: User;
}

export function AdminUserList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [confirm, setConfirm] = useState<ConfirmDialog | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const isSearching = debouncedSearch.length >= 2;

  const { data: usersData, isLoading } = useGetUsersQuery(
    { page, limit: 20, status: statusFilter || undefined, role: roleFilter || undefined },
    { skip: isSearching }
  );

  const { data: searchData, isLoading: searchLoading } = useSearchUsersQuery(
    { q: debouncedSearch, limit: 50 },
    { skip: !isSearching }
  );

  const [suspendUser] = useSuspendUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = isSearching
    ? (searchData?.data ?? [])
    : (usersData?.data?.users ?? []);

  const pagination = usersData?.data?.pagination;
  const loading = isSearching ? searchLoading : isLoading;

  const handleAction = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === "suspend") {
        await suspendUser(confirm.user._id).unwrap();
        toast.success(`${confirm.user.firstName} suspended`);
      } else if (confirm.type === "activate") {
        await activateUser(confirm.user._id).unwrap();
        toast.success(`${confirm.user.firstName} activated`);
      } else {
        await deleteUser(confirm.user._id).unwrap();
        toast.success(`${confirm.user.firstName} deleted`);
      }
    } catch {
      toast.error(`Failed to ${confirm.type} user`);
    } finally {
      setConfirm(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name or email…"
          className="flex-1 min-w-[240px] max-w-sm"
        />
        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as UserStatus | ""); setPage(1); }}
          className="w-36"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as UserRole | ""); setPage(1); }}
          className="w-32"
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Skill</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-[var(--foreground-muted)]">
                  {isSearching ? `No results for "${debouncedSearch}"` : "No users found"}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.avatar}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[user.role]}>{capitalize(user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[user.status]}>{capitalize(user.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--foreground-muted)]">
                    {capitalize(user.skillLevel)}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--foreground-muted)]">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/users/${user._id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="View details">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      {user.status === "suspended" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[var(--success)]"
                          title="Activate"
                          onClick={() => setConfirm({ type: "activate", user })}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[var(--warning)]"
                          title="Suspend"
                          onClick={() => setConfirm({ type: "suspend", user })}
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[var(--destructive)]"
                        title="Delete"
                        onClick={() => setConfirm({ type: "delete", user })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {!isSearching && pagination && pagination.pages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}

      {/* Confirm dialog */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)}>
        <DialogHeader>
          <DialogTitle>
            {confirm?.type === "delete"
              ? "Delete user"
              : confirm?.type === "suspend"
              ? "Suspend user"
              : "Activate user"}
          </DialogTitle>
          <DialogCloseButton onClose={() => setConfirm(null)} />
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-[var(--foreground-muted)]">
            {confirm?.type === "delete"
              ? `Are you sure you want to delete ${confirm.user.firstName} ${confirm.user.lastName}? This action cannot be undone.`
              : confirm?.type === "suspend"
              ? `Suspend ${confirm?.user.firstName} ${confirm?.user.lastName}? They won't be able to log in.`
              : `Activate ${confirm?.user.firstName} ${confirm?.user.lastName}'s account?`}
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            variant={confirm?.type === "delete" ? "destructive" : "default"}
            onClick={handleAction}
          >
            {confirm?.type === "delete"
              ? "Delete"
              : confirm?.type === "suspend"
              ? "Suspend"
              : "Activate"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
