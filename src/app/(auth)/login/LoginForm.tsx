"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Building2, Eye, EyeOff, Shield } from "lucide-react";
import { getDefaultRoute } from "@/lib/role-access";

interface LoginFormProps {
  keycloakEnabled: boolean;
}

export default function LoginForm({ keycloakEnabled }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    const messages: Record<string, string> = {
      OIDC_EXCHANGE_FAILED: "Keycloak sign-in failed. Check client secret and redirect URI.",
      keycloak_unavailable: "Keycloak is not available on this environment. Use email and password.",
      access_denied: "Keycloak sign-in was cancelled.",
    };

    toast.error(messages[error] || `Sign-in error: ${error}`);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.expired) {
          toast.error("Subscription expired! Contact your chairman.");
          router.push("/expired");
        } else {
          const userRole = data.user?.role || "member";
          const landingRoute = getDefaultRoute(userRole);
          toast.success("Welcome back!");
          router.push(landingRoute);
        }
        router.refresh();
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">SmartSocietyHub</h1>
          <p className="text-sm text-text-secondary mt-1">
            Smart society living, billing, security & community
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-2">
              {loading ? (
                <div className="spinner !w-5 !h-5 !border-white/30 !border-t-white" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {keycloakEnabled ? (
            <>
              <div className="my-6 flex items-center justify-center space-x-4">
                <div className="h-px bg-border/50 w-full" />
                <span className="text-xs text-text-tertiary uppercase font-bold tracking-wider">OR</span>
                <div className="h-px bg-border/50 w-full" />
              </div>

              <a
                href="/api/auth/login"
                className="btn btn-secondary w-full btn-lg flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5 text-primary" />
                Sign in with Keycloak
              </a>
            </>
          ) : null}

          <div className="mt-4 text-center">
            <p className="text-sm text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link href="/join" className="text-primary font-medium hover:underline">
                Join Society
              </Link>
            </p>

            <p className="text-sm text-text-secondary mt-2">
              Chairman?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Create Society
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary">
            Powered by{" "}
            <a href="https://www.buzyhub.in" target="_blank" className="text-primary hover:underline">
              Buzyhub.in
            </a>{" "}
            | Pramod Ranpise
          </p>
        </div>
      </div>
    </div>
  );
}
