"use client";

import { useEffect, useState } from "react";
import { setAdminKey, verifyAdminKey } from "@/lib/api";
import { LoginForm } from "@/components/login-form";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // 检查是否已登录
    const checkAuth = async () => {
      const valid = await verifyAdminKey();
      setIsAuthenticated(valid);
    };
    checkAuth();
  }, []);

  const handleLogin = async (key: string) => {
    setAdminKey(key);
    const valid = await verifyAdminKey();
    if (valid) {
      setIsAuthenticated(true);
    } else {
      setAdminKey("");
      throw new Error("Invalid Admin Key");
    }
  };

  const handleLogout = () => {
    setAdminKey("");
    setIsAuthenticated(false);
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Dashboard
  return <Dashboard onLogout={handleLogout} />;
}
