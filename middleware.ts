import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Rate limiters (lazily initialized & fail-safe) ───────────────────────────

let loginRateLimit: Ratelimit | null = null;
let registerRateLimit: Ratelimit | null = null;

function getRateLimiters(): {
  loginLimiter: Ratelimit | null;
  registerLimiter: Ratelimit | null;
} {
  if (
    !loginRateLimit &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    try {
      const redis = Redis.fromEnv();
      loginRateLimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "brooks:auth:login",
      });
      registerRateLimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "brooks:auth:register",
      });
    } catch {
      loginRateLimit = null;
      registerRateLimit = null;
    }
  }

  return { loginLimiter: loginRateLimit, registerLimiter: registerRateLimit };
}

// ── Auth rate limiting ────────────────────────────────────────────────────────

async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname;
  const isAdminLogin = pathname === "/api/auth/callback/credentials" && req.method === "POST";
  const isCustomerLogin = pathname === "/api/auth/customer/callback/customer-credentials" && req.method === "POST";
  const isCustomerRegister = pathname === "/api/customers/register" && req.method === "POST";

  if (!isAdminLogin && !isCustomerLogin && !isCustomerRegister) return null;

  try {
    const { loginLimiter, registerLimiter } = getRateLimiters();
    const limiter = isCustomerRegister ? registerLimiter : loginLimiter;
    if (!limiter) return null;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

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
  } catch (err: unknown) {
    // Fail-open if rate limiter has network/redis issues
    console.error("Rate limit check failed:", err);
  }

  return null;
}

// ── Combined middleware ───────────────────────────────────────────────────────

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  // Check rate limit first
  const rateLimitResponse = await rateLimitMiddleware(req);
  if (rateLimitResponse) return rateLimitResponse;

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
  matcher: [
    "/admin/:path*",
    "/api/auth/callback/credentials",
    "/api/auth/customer/callback/customer-credentials",
    "/api/customers/register",
  ],
};