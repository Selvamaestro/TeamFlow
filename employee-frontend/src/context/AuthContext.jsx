import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/auth.api";
import { setAuthToken } from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while we check for an existing session
  const [authError, setAuthError] = useState(null);

  // On first load, the JWT may already be sitting in an httpOnly cookie
  // (USE_COOKIE_AUTH=true). We can't read that cookie from JS, so the only
  // way to know if the user is still logged in is to ask the backend.
  useEffect(() => {
    authApi
      .fetchMe()
      .then((me) => setUser(me))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const { token, user: loggedInUser } = await authApi.login(email, password);
      setAuthToken(token); // used as a Bearer fallback + for socket auth later
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setAuthError(err.message || "Login failed");
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  // Lets pages that fetch fresh user data (e.g. Profile after an edit) keep
  // the header/sidebar in sync without a full re-login.
  const refreshUser = useCallback(async () => {
    const me = await authApi.fetchMe();
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, authError, signIn, signOut, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
