"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.register(email, password);
      login(res.user, res.accessToken, res.refreshToken);
      router.push("/trade");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-broker-bg">
      <div className="w-[400px] p-8 bg-broker-card rounded-lg border border-broker-border">
        <h1 className="text-2xl font-bold mb-6 text-center text-broker-text-primary">Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-broker-text-secondary mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full" autoComplete="email" />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-broker-text-secondary mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full" autoComplete="new-password" />
            <div className="text-xs text-broker-text-muted mt-1">Min 8 characters</div>
          </div>
          {error && <div className="text-broker-red text-sm mb-3" role="alert">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-broker-text-secondary">
          Already have an account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
}
