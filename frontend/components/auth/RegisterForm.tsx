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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "@/lib/api/types";

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        success: boolean;
        message?: string;
        data?: { user: User; accessToken: string };
      };

      if (!res.ok || !json.success) {
        const msg = json.message || "Registration failed";
        if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("exist")) {
          setError("email", { message: "An account with this email already exists" });
        } else {
          toast.error(msg);
        }
        return;
      }

      dispatch(
        setCredentials({
          user: json.data!.user,
          accessToken: json.data!.accessToken,
        })
      );

      toast.success(`Welcome to PianoVerse, ${json.data!.user.firstName}!`);
      router.push("/dashboard");
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start your piano journey with AI today</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message} required>
              <Input
                id="firstName"
                placeholder="John"
                autoComplete="given-name"
                autoFocus
                error={!!errors.firstName}
                {...register("firstName")}
              />
            </FormField>
            <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message} required>
              <Input
                id="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                error={!!errors.lastName}
                {...register("lastName")}
              />
            </FormField>
          </div>

          <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={!!errors.email}
              {...register("email")}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
            hint="At least 6 characters"
            required
          >
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                error={!!errors.password}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-center text-xs text-[var(--foreground-subtle)]">
            By creating an account, you agree to our{" "}
            <Link href="#" className="text-[var(--primary)] hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="#" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>.
          </p>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-[var(--border)] pt-4">
        <p className="text-sm text-[var(--foreground-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
