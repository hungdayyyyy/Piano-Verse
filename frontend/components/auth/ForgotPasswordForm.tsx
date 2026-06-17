"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas";
import { authService } from "@/services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(data);
      setSent(true);
    } catch {
      // http.ts đã toast lỗi — nhưng vì đây là security flow, luôn show success
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success)]/10">
            <Mail className="h-7 w-7 text-[var(--success)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Kiểm tra email của bạn</h2>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Nếu tài khoản tồn tại với <strong>{getValues("email")}</strong>, chúng tôi đã gửi link đặt lại mật khẩu.
            </p>
          </div>
          <Link href="/login"><Button variant="outline">Quay lại đăng nhập</Button></Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quên mật khẩu</CardTitle>
        <CardDescription>Nhập email để nhận link đặt lại mật khẩu</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" placeholder="ban@email.com" autoFocus error={!!errors.email} {...register("email")} />
          </FormField>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang gửi…</> : "Gửi link đặt lại"}
          </Button>
          <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />Quay lại đăng nhập
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
