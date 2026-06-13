const API = process.env.NEXT_PUBLIC_API_URL || "https://broker-backend-veede.zocomputer.io";
const WS = API.replace(/^http/, "ws");

export function connectPrices(cb: (price: { price: number; source: string; timestamp: string }) => void) {
  const ws = new WebSocket(`${WS}/ws/prices`);
  ws.onmessage = (e) => {
    try { cb(JSON.parse(e.data)); } catch {}
  };
  return () => ws.close();
}

export function connectDepth(pair: string, cb: (data: any) => void) {
  const ws = new WebSocket(`${WS}/ws/depth`);
  ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe", pair }));
  ws.onmessage = (e) => {
    try { cb(JSON.parse(e.data)); } catch {}
  };
  return () => { ws.close(); };
}

export function connectUser(token: string, cb: (data: any) => void) {
  const ws = new WebSocket(`${WS}/ws/user?token=${token}`);
  ws.onmessage = (e) => {
    try { cb(JSON.parse(e.data)); } catch {}
  };
  return () => ws.close();
}
