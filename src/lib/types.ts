export interface User {
  id: string; email: string; role: string; createdAt?: string;
}

export interface AuthResponse {
  user: User; accessToken: string; refreshToken: string;
}

export interface Currency {
  id: string; symbol: string; name: string; decimals: number;
}

export interface Pair {
  symbol: string; baseCurrency: string; quoteCurrency: string;
  minQty: string; maxQty: string; tickSize: string; status: string;
}

export interface Ticker {
  pair: string; lastPrice: string; change24h: string;
  high24h: string; low24h: string; volume24h: string;
  bidVolume: string; askVolume: string;
}

export interface Order {
  id: string; pair: string; side: "buy" | "sell";
  type: string; price: string | null; quantity: string;
  filled: string; remaining?: string; fee: string;
  feeCurrency: string; status: string; createdAt: string;
  trades?: Trade[];
}

export interface Trade {
  id: string; price: string; quantity: string; total: string;
  makerFee: string; takerFee: string; createdAt: string;
}

export interface DepthLevel {
  price: string; quantity: string;
}

export interface OrderBook {
  pair: string; bids: DepthLevel[]; asks: DepthLevel[];
}

export interface Candle {
  openTime: string; closeTime: string;
  open: string; high: string; low: string; close: string;
  volume: string; trades: number;
}

export interface Wallet {
  id: string; address: string; currencyId: string;
  label: string | null; derivation: number;
  balance: string; createdAt: string;
}

export interface Deposit {
  txid: string; amount: string; address: string;
  confirmations: number; status: string; createdAt: string;
}

export interface Withdrawal {
  id: string; address: string; amount: string;
  fee: string; txid: string | null; status: string; createdAt: string;
}

export interface ApiKey {
  id: string; name: string; permissions: string;
  lastUsed: string | null; createdAt: string;
}

export interface AdminUser {
  id: string; email: string; role: string; createdAt: string;
}

export interface AdminStats {
  users: number; orders: number; trades: number; pairs: number;
  totalDeposits: string; totalWithdrawals: string;
}

export interface AuditLog {
  id: string; userId: string | null; action: string;
  resource: string; details: string | null;
  ip: string | null; createdAt: string;
  user: { email: string } | null;
}
