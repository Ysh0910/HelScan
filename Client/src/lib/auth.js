import { useEffect, useState } from "react";

const TOKEN_KEY = "helscan_token";
const USER_KEY = "helscan_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("helscan-auth"));
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("helscan-auth"));
}

export function useAuth() {
  const [state, setState] = useState(() => ({
    token: getToken(),
    user: getUser(),
  }));
  useEffect(() => {
    const sync = () => setState({ token: getToken(), user: getUser() });
    window.addEventListener("helscan-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("helscan-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}
