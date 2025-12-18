import { isAuthenticated } from "@/lib/auth-server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayoutView } from "./_components/auth-layout-view";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return <AuthLayoutView defaultOpen={defaultOpen}>{children}</AuthLayoutView>;
}
