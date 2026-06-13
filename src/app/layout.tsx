"use client";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import "./globals.css";

function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <header style={{
      height: 44, background: "#1e222d", borderBottom: "1px solid #2a2e39",
      display: "flex", alignItems: "center", padding: "0 12px", gap: 4,
      userSelect: "none", flexShrink: 0,
    }}>
      <div onClick={() => router.push("/")}
        style={{ fontSize: 16, fontWeight: 700, color: "#f0b90b", cursor: "pointer", padding: "0 12px 0 4px", letterSpacing: "0.5px" }}>
        BRKR
      </div>
      <div style={{ width: 1, height: 20, background: "#2a2e39", margin: "0 4px" }} />
      {[
        ["Trade", "/"],
        ["Wallets", "/wallets"],
        ["Orders", "/orders"],
        ["API Keys", "/api-keys"],
        ...(user?.role === "admin" ? [["Admin", "/admin"]] : []),
      ].map(([label, path]) => (
        <button key={path} onClick={() => router.push(path)}
          style={{
            background: "transparent",
            color: pathname === path ? "#d1d4dc" : "#787b86",
            padding: "4px 10px", fontSize: 12, fontWeight: 500,
            borderBottom: pathname === path ? "2px solid #f0b90b" : "2px solid transparent",
            borderRadius: 0, height: 44,
          }}>{label}</button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#787b86", fontSize: 11 }}>{user?.email || "Demo"}</span>
        <button onClick={() => { logout(); router.push("/login"); }}
          style={{ background: "transparent", color: "#787b86", fontSize: 11, padding: "2px 8px" }}>
          Exit
        </button>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body>
        <AuthProvider>
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Header />
            <main style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
