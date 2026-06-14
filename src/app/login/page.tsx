"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsTotp, setNeedsTotp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password, totp || undefined);
      login(res.user, res.accessToken, res.refreshToken);
      router.push("/trade");
    } catch (err: any) {
      if (err.status === 400 && err.message?.includes("2FA")) {
        setNeedsTotp(true);
        setError("Enter your 2FA code");
      } else {
        setError(err.message || "Login failed");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-broker-bg">
      <div className="w-[400px] p-8 bg-broker-card rounded-lg border border-broker-border">
        <h1 className="text-2xl font-bold mb-6 text-center text-broker-text-primary">
          BROKER
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-broker-text-secondary mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full" autoComplete="email" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-broker-text-secondary mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full" autoComplete="current-password" />
          </div>
          {needsTotp && (
            <div className="mb-4">
              <label className="block text-sm text-broker-text-secondary mb-1.5">2FA Code</label>
              <input type="text" value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="000000" maxLength={6} className="w-full" autoComplete="one-time-code" inputMode="numeric" />
            </div>
          )}
          {error && <div className="text-broker-red text-sm mb-3" role="alert">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-broker-text-secondary">
          Don&apos;t have an account? <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
}
