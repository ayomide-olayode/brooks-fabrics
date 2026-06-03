import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Rate limiters ────────────────────────────────────────────────────────────

const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "brooks:auth:login",
});

const registerRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "brooks:auth:register",
});

// ── Auth rate limiting (runs before withAuth) ─────────────────────────────────

async function rateLimitMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isAdminLogin = pathname === "/api/auth/callback/credentials" && req.method === "POST";
  const isCustomerLogin = pathname === "/api/auth/customer/callback/customer-credentials" && req.method === "POST";
  const isCustomerRegister = pathname === "/api/customers/register" && req.method === "POST";

  if (!isAdminLogin && !isCustomerLogin && !isCustomerRegister) return null;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  const limiter = isCustomerRegister ? registerRateLimit : loginRateLimit;
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
    return new NextResponse(
      JSON.stringify({
        error: "Too many login attempts. Please try again later.",
        retryAfter: retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": retryAfterSeconds.toString(),
        },
      }
    );
  }

  return null; // under the limit, continue
}

// ── Combined middleware ───────────────────────────────────────────────────────

const authMiddleware = withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === "/admin/login") return true;
        return !!token;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export default async function middleware(req: NextRequest) {
  // Check rate limit first
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

  // Then run admin auth protection
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return (authMiddleware as any)(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/auth/callback/credentials",
    "/api/auth/customer/callback/customer-credentials",
    "/api/customers/register",
  ],
};