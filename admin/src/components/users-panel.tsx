"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getUsers,
  setUserVip,
  cancelUserVip,
  deleteUser,
  User,
} from "@/lib/api";

interface UsersPanelProps {
  onStatsChange: () => void;
}

export function UsersPanel({ onStatsChange }: UsersPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // VIP Dialog
  const [vipDialogOpen, setVipDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [vipLevel, setVipLevel] = useState<string>("VIP");
  const [vipDays, setVipDays] = useState<string>("30");

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, 20, search);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      toast.error("加载用户列表失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleSetVip = async () => {
    if (!selectedUser) return;

    try {
      await setUserVip(selectedUser.id, {
        vipLevel,
        days: parseInt(vipDays),
      });
      toast.success(`已为用户 ${selectedUser.id} 设置 VIP`);
      setVipDialogOpen(false);
      loadUsers();
      onStatsChange();
    } catch (error) {
      toast.error("设置 VIP 失败");
      console.error(error);
    }
  };

  const handleCancelVip = async (user: User) => {
    try {
      await cancelUserVip(user.id);
      toast.success(`已取消用户 ${user.id} 的 VIP`);
      loadUsers();
      onStatsChange();
    } catch (error) {
      toast.error("取消 VIP 失败");
      console.error(error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      toast.success(`已删除用户 ${userToDelete.id}`);
      setDeleteDialogOpen(false);
      loadUsers();
      onStatsChange();
    } catch (error) {
      toast.error("删除用户失败");
      console.error(error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("zh-CN");
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户管理</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="搜索昵称或 OpenID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>

        {/* Users Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>OpenID</TableHead>
                <TableHead>会员等级</TableHead>
                <TableHead>到期时间</TableHead>
                <TableHead>积分</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    暂无用户
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.nickName || ""}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                            无
                          </div>
                        )}
                        <span>{user.nickName || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {user.phone || <span className="text-gray-400">未绑定</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.openid.slice(0, 12)}...
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.vipLevel === "SVIP"
                            ? "default"
                            : user.vipLevel === "VIP"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {user.vipLevel === "NORMAL" ? "普通" : user.vipLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.vipExpireAt)}</TableCell>
                    <TableCell>{user.pointsBalance}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setVipLevel(user.vipLevel === "NORMAL" ? "VIP" : user.vipLevel);
                          setVipDialogOpen(true);
                        }}
                      >
                        设置VIP
                      </Button>
                      {user.vipLevel !== "NORMAL" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelVip(user)}
                        >
                          取消VIP
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            共 {total} 个用户 | 第 {page} / {totalPages || 1} 页
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Set VIP Dialog */}
      <Dialog open={vipDialogOpen} onOpenChange={setVipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>为用户 {selectedUser?.id} 设置 VIP</DialogTitle>
            <DialogDescription>
              配置用户的 VIP 等级和时长
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>VIP 等级</Label>
              <Select value={vipLevel} onValueChange={setVipLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="SVIP">SVIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>时长（天）</Label>
              <Input
                type="number"
                value={vipDays}
                onChange={(e) => setVipDays(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVipDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSetVip}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除用户</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 {userToDelete?.id} 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
