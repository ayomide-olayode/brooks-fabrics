import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import Link from "next/link";
import { User, Package, MapPin, Settings, LogOut } from "lucide-react";
import LogoutButton from "./LogoutButton"; // We'll create this to use useCustomerAuth().logout()

export const metadata = {
  title: "My Account | Brooks Fabrics",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(customerAuthOptions);

  if (!session?.user?.id || session.user.role !== "customer") {
    redirect("/auth");
  }

  const navItems = [
    { name: "Overview", href: "/account", icon: User },
    { name: "Order History", href: "/account/orders", icon: Package },
    { name: "Addresses", href: "/account/addresses", icon: MapPin },
  ];

  return (
    <div className="bg-surface min-h-screen py-10 sm:py-16">
      <div className="page-container">
        <h1 className="font-heading text-display-md font-bold text-ink mb-8">
          My Account
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-muted text-ink font-medium transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-ink-muted group-hover:text-primary-600 transition-colors" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="divider-warm my-2" />
              <LogoutButton />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
