"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminAuthContextType {
  isAdminAuthed: boolean;
  isLoading: boolean;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const flag = typeof window !== "undefined" ? localStorage.getItem("adminAuthed") : null;
      setIsAdminAuthed(flag === "true");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (code: string): Promise<boolean> => {
    // Compare against a public config value; for production use a secure server-side check
    const expected = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || "";
    const ok = expected.length > 0 && code === expected;
    if (ok && typeof window !== "undefined") {
      localStorage.setItem("adminAuthed", "true");
      setIsAdminAuthed(true);
    }
    return ok;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAuthed");
    }
    setIsAdminAuthed(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthed, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}


