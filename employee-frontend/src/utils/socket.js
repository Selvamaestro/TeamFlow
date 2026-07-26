import { io } from "socket.io-client";
import { getAuthToken } from "../api/axiosClient";

// The backend mounts REST under NEXT_PUBLIC_API_BASE_URL + "/api" but Socket.IO
// listens on the bare server origin (see backend/server.js -> initSocket(server, ...)),
// so we strip the trailing "/api" to get the socket host.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");

let socket = null;

// Socket auth (backend/src/config/socket.js) requires a bearer token in the
// handshake, not just the httpOnly cookie. That token only lives in memory
// (see axiosClient.setAuthToken), so this can return null right after a page
// refresh until the person navigates in a way that re-populates it. Callers
// should treat a null return as "real-time isn't available right now" and
// fall back to polling rather than erroring out.
export function getSocket() {
  const token = getAuthToken();
  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token },
      withCredentials: true,
    });
  } else {
    socket.auth = { token };
  }

  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
