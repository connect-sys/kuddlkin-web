"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Lock, ShieldCheck, User } from "lucide-react";
import { adminLogin, serviceWorkerLogin } from "@/lib/api";
import { useAuth, displayName } from "@/lib/auth";
import { cn } from "@kuddlkin/utils";

type Role = "admin" | "service_worker";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, ready } = useAuth();
  const [role, setRole] = useState<Role>("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) router.replace("/");
  }, [ready, isAuthenticated, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Enter your credentials");
      return;
    }
    setLoading(true);
    try {
      const res =
        role === "admin"
          ? await adminLogin(identifier.trim(), password)
          : await serviceWorkerLogin(identifier.trim(), password);

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        toast.success(`Welcome back, ${displayName(res.user)}`);
        router.replace("/");
      } else {
        toast.error(res.message || "Invalid credentials");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-sand-100 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-sand-200 bg-white p-8 kuddl-shadow">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-500 text-lg font-black text-white">
            k
          </span>
          <div>
            <p className="text-lg font-black leading-none text-kuddl-ink">
              Kuddl Admin
            </p>
            <p className="text-xs font-semibold text-sand-600">
              Internal console
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-sand-100 p-1">
          {(["admin", "service_worker"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-full py-2 text-sm font-bold transition-colors",
                role === r
                  ? "bg-white text-primary-700 shadow"
                  : "text-sand-600"
              )}
            >
              {r === "admin" ? "Admin" : "Service worker"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sand-600">
              <User className="h-3.5 w-3.5" />
              {role === "admin" ? "Email" : "Username / phone / email"}
            </span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              type={role === "admin" ? "email" : "text"}
              className="w-full rounded-xl border-2 border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400"
              autoComplete="username"
            />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sand-600">
              <Lock className="h-3.5 w-3.5" />
              Password
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border-2 border-sand-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary-400"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-extrabold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-sand-500">
          <ShieldCheck className="h-3.5 w-3.5 text-secondary-500" />
          Restricted access — Kuddl staff only
        </p>
      </div>
    </div>
  );
}
