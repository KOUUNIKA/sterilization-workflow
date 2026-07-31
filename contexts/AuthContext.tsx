"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export type AuthUser = {
  badgeCode: string;
  name: string;
  role: string;
  initials: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("auth_user");
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) sessionStorage.setItem("auth_user", JSON.stringify(user));
    else sessionStorage.removeItem("auth_user");
  }, [user]);

  const login = async (username: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: username }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as AuthUser;
      setUser(data);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate("/login");
  };
}
