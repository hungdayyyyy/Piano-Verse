"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/features/auth/authSlice";
import { setHttpToken } from "@/services/http";
import { authService } from "@/services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { HttpError } from "@/services";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const redirect = searchParams.get("redirect") || "/dashboard";

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      // authService.login → /api/auth/login (Route Handler) → set cookie → return user + token
      const result = await authService.login(data);

      // Lưu access token vào Redux + http client
      setHttpToken(result.accessToken);
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));

      toast.success(`Chào mừng trở lại, ${result.user.firstName}!`);
      router.push(redirect);
    } catch (err) {
      const e = err as HttpError;
      if (e.status === 401 || e.status === 400) {
        setError("password", { message: "Email hoặc mật khẩu không đúng" });
      } else if (e.status === 403) {
        toast.error("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
      }
      // Các lỗi khác (500, network) đã được http.ts toast rồi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Nhập email và mật khẩu để tiếp tục</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" placeholder="ban@email.com" autoComplete="email" autoFocus error={!!errors.email} {...register("email")} />
          </FormField>
          <FormField label="Mật khẩu" htmlFor="password" error={errors.password?.message} required>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" error={!!errors.password} className="pr-10" {...register("password")} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-[var(--primary)] hover:underline">Quên mật khẩu?</Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang đăng nhập…</> : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-[var(--border)] pt-4">
        <p className="text-sm text-[var(--foreground-muted)]">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-[var(--primary)] font-medium hover:underline">Tạo tài khoản</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
