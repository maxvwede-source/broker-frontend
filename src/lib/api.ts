const API = process.env.NEXT_PUBLIC_API_URL || "https://broker-backend-veede.zocomputer.io";

function tokens() {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: localStorage.getItem("accessToken"),
    refresh: localStorage.getItem("refreshToken"),
  };
}

async function request(path: string, opts: RequestInit = {}) {
  const { access } = tokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> || {}),
  };
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (res.status === 401) {
    const refreshed = await maybeRefresh();
    if (refreshed) {
      const { access: newAccess } = tokens();
      headers["Authorization"] = `Bearer ${newAccess}`;
      const retry = await fetch(`${API}${path}`, { ...opts, headers });
      const data = await retry.json();
      if (!retry.ok) throw { status: retry.status, ...data };
      return data;
    }
  }
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

async function maybeRefresh() {
  const { refresh } = tokens();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) { clearTokens(); return false; }
    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return true;
  } catch { clearTokens(); return false; }
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export const api = {
  // Auth
  register: (email: string, password: string) =>
    request("/api/v1/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string, totpToken?: string) =>
    request("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password, totpToken }) }),
  setup2FA: () => request("/api/v1/auth/2fa/setup", { method: "POST" }),
  verify2FA: (token: string) => request("/api/v1/auth/2fa/verify", { method: "POST", body: JSON.stringify({ token }) }),
  me: () => request("/api/v1/auth/me"),
  logout: () => request("/api/v1/auth/logout", { method: "POST" }),

  // Market
  currencies: () => request("/api/v1/market/currencies"),
  pairs: () => request("/api/v1/market/pairs"),
  ticker: (pair: string) => request(`/api/v1/market/ticker/${pair}`),
  tickers: () => request("/api/v1/market/tickers"),
  depth: (pair: string, limit = 20) => request(`/api/v1/orders/depth/${pair}?limit=${limit}`),
  candles: (pair: string, interval = "1m", limit = 100) =>
    request(`/api/v1/orders/candles/${pair}?interval=${interval}&limit=${limit}`),

  // Orders
  createOrder: (data: Record<string, unknown>) =>
    request("/api/v1/orders", { method: "POST", body: JSON.stringify(data) }),
  getOrders: (params = "") => request(`/api/v1/orders${params}`),
  getOpenOrders: (pair?: string) => request(`/api/v1/orders/open${pair ? `?pair=${pair}` : ""}`),
  getOrderHistory: (pair?: string) => request(`/api/v1/orders/history${pair ? `?pair=${pair}` : ""}`),
  cancelOrder: (id: string) => request(`/api/v1/orders/${id}`, { method: "DELETE" }),

  // Wallets
  wallets: () => request("/api/v1/wallets"),
  depositAddress: (label?: string, currency = "BTC") =>
    request("/api/v1/wallets/deposit-address", { method: "POST", body: JSON.stringify({ label, currency }) }),
  transactions: () => request("/api/v1/wallets/transactions"),
  withdraw: (address: string, amount: number, currency = "BTC", totpToken?: string) =>
    request("/api/v1/wallets/withdraw", { method: "POST", body: JSON.stringify({ address, amount, currency, totpToken }) }),

  // API Keys
  getApiKeys: () => request("/api/v1/api-keys"),
  createApiKey: (name: string, permissions = "read") =>
    request("/api/v1/api-keys", { method: "POST", body: JSON.stringify({ name, permissions }) }),
  deleteApiKey: (id: string) => request(`/api/v1/api-keys/${id}`, { method: "DELETE" }),

  // Prices
  btcUsd: () => request("/api/v1/prices/btc-usd"),
  priceHistory: (limit = 100) => request(`/api/v1/prices/history?limit=${limit}`),

  // Transactions
  getTransactions: () => request("/api/v1/transactions"),

  // Admin
  adminUsers: () => request("/api/v1/admin/users"),
  adminSetRole: (id: string, role: string) =>
    request(`/api/v1/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  adminOrders: () => request("/api/v1/admin/orders"),
  adminTrades: () => request("/api/v1/admin/trades"),
  adminAuditLog: (limit = 50) => request(`/api/v1/admin/audit-log?limit=${limit}`),
  adminWithdrawals: (status?: string) => request(`/api/v1/admin/withdrawals${status ? `?status=${status}` : ""}`),
  approveWithdrawal: (id: string) =>
    request(`/api/v1/admin/withdrawals/${id}/approve`, { method: "PUT" }),
  adminStats: () => request("/api/v1/admin/stats"),
};
