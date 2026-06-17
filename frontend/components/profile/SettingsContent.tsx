"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { usersService, authService } from "@/services";
import { setHttpToken } from "@/services/http";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/features/auth/authSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogCloseButton } from "@/components/ui/dialog";
import type { HttpError } from "@/services";

export function SettingsContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "xóa tài khoản của tôi") return;
    setIsDeleting(true);
    try {
      await usersService.deleteAccount();
      await authService.logout();
      setHttpToken(null);
      dispatch(clearAuth());
      toast.success("Tài khoản đã được xóa.");
      router.push("/");
    } catch (err) {
      const e = err as HttpError;
      if (e.status !== 500) toast.error("Xóa tài khoản thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mật khẩu</CardTitle>
          <CardDescription>Đặt lại mật khẩu tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--foreground-muted)] mb-3">Sử dụng luồng quên mật khẩu để đặt mật khẩu mới:</p>
          <Button variant="outline" onClick={() => router.push("/forgot-password")}>Yêu cầu đặt lại mật khẩu</Button>
        </CardContent>
      </Card>

      <Card className="border-[var(--destructive)]/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-[var(--destructive)]">
            <AlertTriangle className="h-4 w-4" />Vùng nguy hiểm
          </CardTitle>
          <CardDescription>Thao tác không thể hoàn tác</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/5 p-4">
            <div>
              <p className="text-sm font-medium">Xóa tài khoản</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu luyện tập.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />Xóa
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader>
          <DialogTitle className="text-[var(--destructive)]">Xóa tài khoản vĩnh viễn</DialogTitle>
          <DialogCloseButton onClose={() => setShowDeleteDialog(false)} />
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            Thao tác này sẽ xóa vĩnh viễn tài khoản, toàn bộ session luyện tập và dữ liệu của bạn. <strong>Không thể hoàn tác.</strong>
          </p>
          <FormField label='Nhập "xóa tài khoản của tôi" để xác nhận' htmlFor="confirm">
            <Input id="confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="xóa tài khoản của tôi"
              error={confirmText.length > 0 && confirmText !== "xóa tài khoản của tôi"} />
          </FormField>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete}
            disabled={confirmText !== "xóa tài khoản của tôi" || isDeleting}>
            {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa…</> : "Xóa tài khoản"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
