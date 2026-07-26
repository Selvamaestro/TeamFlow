import { io } from "socket.io-client";

// Same host as the REST API, minus the /api suffix (Socket.IO mounts at the server root).
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(
  /\/api\/?$/,
  ""
);

let socket = null;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || localStorage.getItem("teamflow_token");
}

// Lazily creates a single shared socket connection, authenticated with the JWT
// from localStorage. Safe to call repeatedly — reuses the connection if open.
export function getSocket() {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: (cb) => cb({ token: getToken() }),
  });

  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
