"use client";

import { useState } from "react";
import { Users, Shield, CreditCard, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllUsers, updateUserRole } from "@/actions/ai-credit";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  id: string;
  user_id: string;
  store_name: string | null;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  ai_wallet?: {
    balance: number;
  }[];
}

export function UsersClient({ users }: { users: UserProfile[] }) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        alert(result.error);
      } else {
        alert("Role updated successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-500";
      case "admin":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getWalletBalance = (user: UserProfile) => {
    return user.ai_wallet && user.ai_wallet.length > 0
      ? user.ai_wallet[0].balance
      : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-[#0fdc78]" />
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua User</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada user yang terdaftar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 font-semibold text-white">Nama Lengkap</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Nama Toko</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Email</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Role</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Credit</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Tanggal Daftar</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="py-4 px-4">
                        <p className="font-medium">{user.full_name || "-"}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{user.store_name || "Tidak Ada Nama"}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">{user.email || "-"}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#0fdc78]" />
                          <span className="font-bold">{getWalletBalance(user)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.user_id, value)}
                          disabled={updatingUserId === user.user_id}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
