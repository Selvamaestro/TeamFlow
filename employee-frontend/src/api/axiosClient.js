import axios from "axios";

// The backend mounts everything under /api (see backend/src/app.js).
// USE_COOKIE_AUTH=true means the JWT also lives in an httpOnly cookie,
// so requests must be sent with credentials. We additionally attach the
// token as a Bearer header (stored in memory by AuthContext) so the same
// client works if cookie auth is ever turned off.
//
// Next.js only exposes env vars prefixed NEXT_PUBLIC_ to the browser.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let inMemoryToken = null;
export function setAuthToken(token) {
  inMemoryToken = token;
}

axiosClient.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

// Normalizes every backend error into a single shape so components never
// have to guess whether they got { message } or { message, errors: [...] }
// (express-validator's 422 shape from middlewares/validate.js).
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    const message = data?.message || error.message || "Something went wrong. Please try again.";
    const fieldErrors = Array.isArray(data?.errors)
      ? data.errors.reduce((acc, e) => {
          if (e.path) acc[e.path] = e.msg;
          return acc;
        }, {})
      : null;

    return Promise.reject({ status, message, fieldErrors, raw: error });
  }
);

export default axiosClient;
