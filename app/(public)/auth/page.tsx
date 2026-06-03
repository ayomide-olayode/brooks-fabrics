"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

type Tab = "signin" | "signup";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function AuthPage() {
  const router = useRouter();

  const { login, loginWithGoogle } = useCustomerAuth();

  const [tab, setTab] = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function clearForm(): void {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function switchTab(newTab: Tab): void {
    setTab(newTab);
    clearForm();
  }

  function validateSignIn(): boolean {
    const newErrors: FormErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateSignUp(): boolean {
    const newErrors: FormErrors = {};
    if (!name || name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignIn(): Promise<void> {
    if (!validateSignIn()) return;
    setLoading(true);
    setErrors({});

    const result = await login(email, password);

    if (result.ok) {
      toast.success("Welcome back!");
      const nextUrl = new URLSearchParams(window.location.search).get("next") || "/account";
      router.push(nextUrl);
    } else {
      setErrors({ general: result.error || "Invalid email or password" });
    }
    setLoading(false);
  }

  async function handleSignUp(): Promise<void> {
    if (!validateSignUp()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: "An account with this email already exists" });
        } else if (data.details) {
          // Zod validation errors
          const newErrors: FormErrors = {};
          if (data.details.name?._errors?.[0]) newErrors.name = data.details.name._errors[0];
          if (data.details.email?._errors?.[0]) newErrors.email = data.details.email._errors[0];
          if (data.details.password?._errors?.[0]) newErrors.password = data.details.password._errors[0];
          if (data.details.confirmPassword?._errors?.[0]) newErrors.confirmPassword = data.details.confirmPassword._errors[0];
          setErrors(newErrors);
        } else {
          setErrors({ general: data.error || "Registration failed" });
        }
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const loginResult = await login(email, password);
      if (loginResult.ok) {
        toast.success("Account created! Welcome to Brooks Fabrics.");
        const nextUrl = new URLSearchParams(window.location.search).get("next") || "/account";
        router.push(nextUrl);
      } else {
        // Registration succeeded but auto-login failed — redirect to sign in
        switchTab("signin");
        toast.success("Account created! Please sign in.");
      }
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    }
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (tab === "signin") {
      handleSignIn();
    } else {
      handleSignUp();
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Brooks Fabrics"
              width={140}
              height={140}
              className="mx-auto"
            />
          </Link>
          <p className="text-ink-secondary text-sm mt-3">
            {tab === "signin"
              ? "Welcome back to Brooks Fabrics"
              : "Create your Brooks Fabrics account"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-surface-muted rounded-xl p-1 mb-8">
          <button
            type="button"
            onClick={() => switchTab("signin")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              tab === "signin"
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchTab("signup")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              tab === "signup"
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name — Sign Up only */}
            {tab === "signup" && (
              <div>
                <label htmlFor="auth-name" className="label">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="e.g. Amaka Obi"
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="auth-email" className="label">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="auth-password" className="label">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder={tab === "signup" ? "Min. 8 characters" : "Enter your password"}
                  autoComplete={tab === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password — Sign Up only */}
            {tab === "signup" && (
              <div>
                <label htmlFor="auth-confirm-password" className="label">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {tab === "signin" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {tab === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-muted font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-7 py-3.5 border border-border rounded-xl font-semibold text-ink text-sm transition-all duration-200 hover:bg-surface-muted hover:border-border-dark active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-ink-muted mt-6">
          By continuing, you agree to our{" "}
          <Link href="/about" className="text-gold-600 hover:text-gold-700 underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
