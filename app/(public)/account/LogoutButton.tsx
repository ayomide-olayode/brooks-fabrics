"use client";

import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { logout } = useCustomerAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition-colors w-full text-left"
    >
      <LogOut className="w-5 h-5" />
      Sign Out
    </button>
  );
}
