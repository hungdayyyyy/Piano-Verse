import type { Metadata } from "next";
import { SessionDetail } from "@/components/practice/SessionDetail";

export const metadata: Metadata = { title: "Session Detail" };

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { sessionId } = await params;
  return <SessionDetail sessionId={sessionId} />;
}
