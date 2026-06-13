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
    setLoading(true); setError("");
    try {
      const res = await api.login(email, password, totp || undefined);
      login(res.user, res.accessToken, res.refreshToken);
      router.push("/");
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
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      height: "100vh", background: "var(--bg-primary)",
    }}>
      <div style={{
        width: 400, padding: 32, background: "var(--bg-secondary)",
        borderRadius: 8, border: "1px solid var(--border)",
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>
          BROKER
        </h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
              Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required style={{ width: "100%" }} />
          </div>
          {needsTotp && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
                2FA Code
              </label>
              <input type="text" value={totp} onChange={e => setTotp(e.target.value)}
                placeholder="000000" maxLength={6} style={{ width: "100%" }} />
            </div>
          )}
          {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: "100%", padding: 12, fontSize: 15 }}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          Don't have an account? <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
}
