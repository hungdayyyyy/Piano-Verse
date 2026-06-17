"use client";

import Link from "next/link";
import { ArrowLeft, Shield, UserCheck, Trash2 } from "lucide-react";
import {
  useGetUserQuery,
  useUpdateUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
} from "@/features/admin/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate, capitalize } from "@/lib/utils";
import type { UserRole } from "@/lib/api/types";

export function AdminUserDetail({ userId }: { userId: string }) {
  const { data, isLoading } = useGetUserQuery(userId);
  const [updateUser] = useUpdateUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [activateUser] = useActivateUserMutation();

  const user = data?.data;

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!user) return <p className="text-[var(--foreground-muted)]">User not found.</p>;

  const handleRoleChange = async (role: UserRole) => {
    try {
      await updateUser({ id: userId, data: { role } }).unwrap();
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleStatusToggle = async () => {
    try {
      if (user.status === "suspended") {
        await activateUser(userId).unwrap();
        toast.success("User activated");
      } else {
        await suspendUser(userId).unwrap();
        toast.success("User suspended");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {user.firstName} {user.lastName}
        </h1>
      </div>

      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <Avatar src={user.avatar} firstName={user.firstName} lastName={user.lastName} size="xl" />
          <div className="flex-1">
            <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-[var(--foreground-muted)]">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.status === "active" ? "success" : "destructive"}>
                {capitalize(user.status)}
              </Badge>
              <Badge variant="secondary">{capitalize(user.role)}</Badge>
              <Badge variant="outline">{capitalize(user.skillLevel)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Account Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "User ID", value: user._id },
              { label: "Joined", value: formatDate(user.createdAt) },
              { label: "Email Verified", value: user.isEmailVerified ? "Yes" : "No" },
              { label: "Total XP", value: user.totalXP.toLocaleString() },
              { label: "Streak", value: `${user.currentStreak} days` },
              { label: "Practice", value: `${user.totalPracticeMinutes}m` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">{label}</span>
                <span className="font-medium font-mono text-xs">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-[var(--foreground-muted)] mb-1.5">Change role</p>
              <Select
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              >
                <option value="user">User</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </Select>
            </div>

            <Button
              variant={user.status === "suspended" ? "default" : "outline"}
              className="w-full"
              onClick={handleStatusToggle}
            >
              {user.status === "suspended" ? (
                <><UserCheck className="mr-2 h-4 w-4" />Activate Account</>
              ) : (
                <><Shield className="mr-2 h-4 w-4" />Suspend Account</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
