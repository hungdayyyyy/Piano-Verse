import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/session";

// Root "/" — redirect based on auth state
export default async function RootPage() {
  const user = await getServerUser();
  if (user) {
    redirect("/dashboard");
  }
  redirect("/login");
}
