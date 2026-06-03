"use client";

import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface CustomerSession {
  id: string;
  name: string;
  email: string;
  role: "customer";
}

interface CustomerAuthContextValue {
  customer: CustomerSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

const CUSTOMER_AUTH_URL = "/api/auth/customer";

function CustomerAuthInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isCustomer = session?.user?.role === "customer";
  const isAuthenticated = status === "authenticated" && isCustomer;

  const customer: CustomerSession | null = isAuthenticated && session?.user?.id
    ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        role: "customer",
      }
    : null;

  async function login(
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> {
    const result = await signIn("customer-credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  }

  async function loginWithGoogle(): Promise<void> {
    await signIn("google", { callbackUrl: "/account" });
  }

  async function logout(): Promise<void> {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <CustomerAuthContext.Provider
      value={{ customer, isLoading, isAuthenticated, login, loginWithGoogle, logout }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function CustomerAuthProvider({ children, session }: { children: ReactNode; session?: any }) {
  return (
    <SessionProvider basePath={CUSTOMER_AUTH_URL} session={session}>
      <CustomerAuthInner>{children}</CustomerAuthInner>
    </SessionProvider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
  }
  return ctx;
}
