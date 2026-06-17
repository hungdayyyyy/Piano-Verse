"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Camera, User, Settings2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "@/features/users/usersApi";
import { useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/features/auth/authSlice";
import { updateProfileSchema, type UpdateProfileInput } from "@/features/users/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/shared/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

export function ProfileContent() {
  const dispatch = useAppDispatch();
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();

  const user = profileData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: user
      ? {
          fullName: `${user.firstName} ${user.lastName}`,
          bio: user.bio as string | undefined,
          skillLevel: user.skillLevel,
          preferences: user.preferences,
        }
      : undefined,
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      const res = await updateProfile(data).unwrap();
      if (res.data) {
        dispatch(updateUser(res.data));
        toast.success("Profile updated successfully");
      }
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await uploadAvatar(formData).unwrap();
      if (res.data?.avatar) {
        dispatch(updateUser({ avatar: res.data.avatar }));
        toast.success("Avatar updated");
      }
    } catch {
      toast.error("Failed to upload avatar");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-[var(--foreground-muted)]">Failed to load profile.</p>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar + name card */}
      <Card>
        <CardContent className="flex items-center gap-6 p-6">
          <div className="relative">
            <Avatar
              src={user.avatar}
              firstName={user.firstName}
              lastName={user.lastName}
              size="xl"
            />
            <label
              htmlFor="avatar-upload"
              className={`absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--background-card)] bg-[var(--primary)] text-[var(--primary-foreground)] transition-opacity hover:opacity-90 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              aria-label="Upload avatar"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-[var(--foreground-muted)]">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{user.role}</Badge>
              <Badge variant="outline">{user.skillLevel}</Badge>
              {user.isEmailVerified && <Badge variant="success">Verified</Badge>}
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-[var(--foreground-muted)]">Member since</p>
            <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-1.5 h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  label="Display name"
                  htmlFor="fullName"
                  error={errors.fullName?.message}
                  hint="2–50 characters"
                >
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    error={!!errors.fullName}
                    {...register("fullName")}
                  />
                </FormField>

                <FormField
                  label="Bio"
                  htmlFor="bio"
                  error={errors.bio?.message}
                  hint="Up to 500 characters"
                >
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your piano journey…"
                    rows={3}
                    error={!!errors.bio}
                    {...register("bio")}
                  />
                </FormField>

                <FormField label="Skill level" htmlFor="skillLevel" error={errors.skillLevel?.message}>
                  <Select id="skillLevel" {...register("skillLevel")}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </Select>
                </FormField>

                <Button type="submit" disabled={updating || !isDirty}>
                  {updating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField label="Language" htmlFor="language">
                  <Select id="language" {...register("preferences.language")}>
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </Select>
                </FormField>

                <FormField label="Theme" htmlFor="theme">
                  <Select id="theme" {...register("preferences.theme")}>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </Select>
                </FormField>

                <div className="space-y-3">
                  {[
                    { name: "preferences.notifications" as const, label: "Push notifications" },
                    { name: "preferences.emailUpdates" as const, label: "Email updates" },
                  ].map(({ name, label }) => (
                    <label key={name} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
                        {...register(name)}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>

                <Button type="submit" disabled={updating || !isDirty}>
                  {updating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
