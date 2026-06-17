"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useDeleteAccountMutation } from "@/features/users/usersApi";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/features/auth/authSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogCloseButton,
} from "@/components/ui/dialog";

export function SettingsContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "delete my account") return;
    try {
      await deleteAccount().unwrap();
      await fetch("/api/auth/logout", { method: "POST" });
      dispatch(clearAuth());
      toast.success("Account deleted. We're sorry to see you go.");
      router.push("/");
    } catch {
      toast.error("Failed to delete account. Please try again or contact support.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Password change note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--foreground-muted)] mb-3">
            Use the forgot password flow to set a new password:
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/forgot-password")}
          >
            Request password reset
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-[var(--destructive)]/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[var(--destructive)]">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                Permanently delete your account and all practice data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader>
          <DialogTitle className="text-[var(--destructive)]">Delete account permanently</DialogTitle>
          <DialogCloseButton onClose={() => setShowDeleteDialog(false)} />
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            This will permanently delete your account, all practice sessions, recordings, and data.
            This action <strong>cannot</strong> be undone.
          </p>
          <FormField
            label='Type "delete my account" to confirm'
            htmlFor="confirm-delete"
          >
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete my account"
              error={confirmText.length > 0 && confirmText !== "delete my account"}
            />
          </FormField>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== "delete my account" || isLoading}
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</>
            ) : (
              "Delete my account"
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
