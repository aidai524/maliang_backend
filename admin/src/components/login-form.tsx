"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormProps {
  onLogin: (key: string) => Promise<void>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setError("请输入管理员密钥");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onLogin(adminKey.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Dream 管理后台</CardTitle>
          <CardDescription>请输入管理员密钥登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">管理员密钥</Label>
              <Input
                id="adminKey"
                type="password"
                placeholder="请输入密钥..."
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "验证中..." : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
