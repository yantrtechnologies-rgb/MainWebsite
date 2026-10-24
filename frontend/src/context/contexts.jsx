import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

/* ----------------------------- Auth ----------------------------- */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("yantr_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => { localStorage.removeItem("yantr_token"); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("yantr_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("yantr_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);

/* ----------------------------- Theme ----------------------------- */
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("yantr_theme") || "light");
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("yantr_theme", theme);
  }, [theme]);
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);

/* --------------------------- Enquiry Modal --------------------------- */
const EnquiryContext = createContext(null);

export function EnquiryProvider({ children }) {
  const [state, setState] = useState({ open: false, vertical: "marketing", interest: "" });
  const openEnquiry = (vertical = "marketing", interest = "") =>
    setState({ open: true, vertical, interest });
  const close = () => setState((s) => ({ ...s, open: false }));
  return (
    <EnquiryContext.Provider value={{ ...state, openEnquiry, close }}>
      {children}
    </EnquiryContext.Provider>
  );
}
export const useEnquiry = () => useContext(EnquiryContext);
