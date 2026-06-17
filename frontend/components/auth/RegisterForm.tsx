"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/features/auth/authSlice";
import { setHttpToken } from "@/services/http";
import { authService } from "@/services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { HttpError } from "@/services";

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      setHttpToken(result.accessToken);
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      toast.success(`Chào mừng đến PianoVerse, ${result.user.firstName}!`);
      router.push("/dashboard");
    } catch (err) {
      const e = err as HttpError;
      if (e.status === 409) {
        setError("email", { message: "Email này đã được đăng ký" });
      }
      // Lỗi khác đã được http.ts xử lý
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo tài khoản</CardTitle>
        <CardDescription>Bắt đầu hành trình học piano cùng AI</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Họ" htmlFor="firstName" error={errors.firstName?.message} required>
              <Input id="firstName" placeholder="Nguyễn" autoComplete="given-name" autoFocus error={!!errors.firstName} {...register("firstName")} />
            </FormField>
            <FormField label="Tên" htmlFor="lastName" error={errors.lastName?.message} required>
              <Input id="lastName" placeholder="Văn A" autoComplete="family-name" error={!!errors.lastName} {...register("lastName")} />
            </FormField>
          </div>
          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" placeholder="ban@email.com" autoComplete="email" error={!!errors.email} {...register("email")} />
          </FormField>
          <FormField label="Mật khẩu" htmlFor="password" error={errors.password?.message} hint="Tối thiểu 6 ký tự" required>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" error={!!errors.password} className="pr-10" {...register("password")} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo tài khoản…</> : "Tạo tài khoản"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-[var(--border)] pt-4">
        <p className="text-sm text-[var(--foreground-muted)]">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">Đăng nhập</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
