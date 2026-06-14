"use client";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";

function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) return null;

  const navItems = [
    { label: "Trade", path: "/trade" },
    { label: "Wallets", path: "/wallets" },
    { label: "Orders", path: "/orders" },
    { label: "API Keys", path: "/api-keys" },
    ...(user?.role === "admin" ? [{ label: "Admin", path: "/admin" }] : []),
  ];

  return (
    <header className="h-header bg-broker-card border-b border-broker-border flex items-center px-3 gap-1 select-none shrink-0">
      <button
        onClick={() => router.push("/trade")}
        className="text-base font-bold text-broker-yellow cursor-pointer px-3 pl-1 tracking-wide bg-transparent hover:bg-transparent"
        aria-label="Home"
      >
        BRKR
      </button>
      <div className="w-px h-5 bg-broker-border mx-1" />
      <nav className="flex gap-0" role="menubar">
        {navItems.map(({ label, path }) => {
          const isActive = pathname === path;
          return (
            <div key={path} role="none">
              <button
                onClick={() => router.push(path)}
                className={`px-2.5 py-1 text-xs font-medium h-header rounded-none bg-transparent border-b-2 transition-colors ${
                  isActive
                    ? "text-broker-text-primary border-broker-yellow"
                    : "text-broker-text-secondary border-transparent hover:text-broker-text-primary"
                }`}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </button>
            </div>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="text-broker-text-secondary text-xs">{user?.email || "Demo"}</span>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="bg-transparent text-broker-text-secondary text-xs px-2 py-0.5 hover:bg-transparent hover:text-broker-text-primary"
        >
          Exit
        </button>
      </div>
    </header>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="h-full flex flex-col">
        <Header />
        <main className="flex-1 min-h-0 flex flex-col">{children}</main>
      </div>
    </AuthProvider>
  );
}
