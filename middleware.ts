import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  // Protect Admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const isLoginPage = req.nextUrl.pathname === "/admin/login";

    let token = null;
    try {
      token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
    } catch {
      token = null;
    }

    if (isLoginPage) {
      if (token) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      const signInUrl = new URL("/admin/login", req.url);
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (req.nextUrl.pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};