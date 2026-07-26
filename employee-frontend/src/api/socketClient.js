import { io } from "socket.io-client";
import { getAuthToken } from "./axiosClient";

// Same host as the REST API, minus the /api suffix (Socket.IO mounts at the server root).
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api").replace(
  /\/api\/?$/,
  ""
);

let socket = null;

// Lazily creates a single shared socket connection, authenticated with the
// in-memory JWT (see AuthContext / axiosClient). Safe to call repeatedly —
// reuses the existing connection if one is already open.
export function getSocket() {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: (cb) => cb({ token: getAuthToken() }),
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