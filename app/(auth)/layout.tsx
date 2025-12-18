import { cookies } from "next/headers";
import { AuthLayoutView } from "./_components/auth-layout-view";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return <AuthLayoutView defaultOpen={defaultOpen}>{children}</AuthLayoutView>;
}
