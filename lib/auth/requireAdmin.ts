import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/nextauth";

interface AdminSession extends Session {
  user: Session["user"] & { role: "admin" };
}

type AdminSessionResult =
  | { authorized: true; session: AdminSession }
  | { authorized: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminSessionResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user?.role !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { authorized: true, session: session as AdminSession };
}
