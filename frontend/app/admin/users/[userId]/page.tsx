import type { Metadata } from "next";
import { AdminUserDetail } from "@/components/admin/AdminUserDetail";

export const metadata: Metadata = { title: "User Detail" };

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId } = await params;
  return <AdminUserDetail userId={userId} />;
}
