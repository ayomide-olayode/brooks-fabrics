import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";
import type { ReactNode } from "react";

export const metadata = { title: { template: "%s | Admin – Brooks Fabrics" } };

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  // /admin/login is handled separately — only wrap dashboard pages
  if (!session) redirect("/admin/login");

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
