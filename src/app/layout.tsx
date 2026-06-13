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
      height: 56, background: "#161a1e", borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", padding: "0 20px", gap: 24
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--yellow)", cursor: "pointer" }}
        onClick={() => router.push("/")}>
        BROKER
      </div>
      <nav style={{ display: "flex", gap: 8, flex: 1 }}>
        {[
          ["Trade", "/"],
          ["Wallets", "/wallets"],
          ["Orders", "/orders"],
          ["API Keys", "/api-keys"],
          ...(user?.role === "admin" ? [["Admin", "/admin"]] : []),
        ].map(([label, path]) => (
          <button key={path} onClick={() => router.push(path)}
            style={{
              background: pathname === path ? "var(--bg-card)" : "transparent",
              color: pathname === path ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "8px 16px", fontSize: 14, fontWeight: 500,
            }}
          >{label}</button>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          {user?.email}
        </span>
        <button onClick={() => { logout(); router.push("/login"); }}
          style={{ background: "var(--bg-card)", padding: "6px 12px", fontSize: 13 }}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
