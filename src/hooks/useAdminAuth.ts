"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hepaima_admin_password";

export function useAdminAuth() {
  const [passwordInput, setPasswordInput] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 从 sessionStorage 恢复登录态
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;
      setAuthError("");
      const pwd = passwordInput.trim();
      if (!pwd) {
        setAuthError("请输入密码");
        return;
      }
      try {
        setSubmitting(true);
        const res = await fetch("/api/v1/admin/verify-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pwd }),
        });
        if (!res.ok) {
          setAuthError("密码错误");
          return;
        }
        setPassword(pwd);
        setAuthenticated(true);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(STORAGE_KEY, pwd);
        }
      } catch {
        setAuthError("验证失败，请重试");
      } finally {
        setSubmitting(false);
      }
    },
    [passwordInput, submitting],
  );

  const logout = useCallback(() => {
    setPassword("");
    setAuthenticated(false);
    setPasswordInput("");
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    password,
    setPassword,
    passwordInput,
    setPasswordInput,
    authenticated,
    authError,
    setAuthError,
    submitting,
    handleLogin,
    logout,
  };
}

