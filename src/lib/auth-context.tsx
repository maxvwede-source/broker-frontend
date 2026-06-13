"use client";
import { useState, useEffect, createContext, useContext } from "react";
import type { User } from "./types";

interface AuthCtx {
  user: User | null; accessToken: string | null;
  login: (u: User, a: string, r: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    const a = localStorage.getItem("accessToken");
    if (u && a) {
      setUser(JSON.parse(u));
      setAccessToken(a);
    }
  }, []);

  const login = (u: User, a: string, r: string) => {
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("accessToken", a);
    localStorage.setItem("refreshToken", r);
    setUser(u); setAccessToken(a);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null); setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
