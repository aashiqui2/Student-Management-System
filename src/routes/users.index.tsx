import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/users/")({
  component: UsersManagement,
});

type UserDto = {
  id: number;
  username: string;
  role: string;
  enabled: boolean;
  fullName?: string;
  regNo?: string;
  department?: string;
  email?: string;
  profilePicUrl?: string;
  dateRegistered?: string;
};

function UsersManagement() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Unauthorized access");
      navigate({ to: "/dashboard" });
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        toast.error("Failed to load users");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success("Role updated successfully");
        fetchUsers();
      } else {
        toast.error("Failed to update role");
      }
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        toast.success("Status updated");
        fetchUsers();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        toast.success("User deleted");
        fetchUsers();
      } else {
        const err = await res.text();
        toast.error(err || "Failed to delete user");
      }
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">{users.length} users total</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-semibold w-[60px]">Photo</th>
                    <th className="px-4 py-3 font-semibold">Full Name</th>
                    <th className="px-4 py-3 font-semibold">Username</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">ID / Reg No</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created Date</th>
                    <th className="px-4 py-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="group transition-colors hover:bg-muted/50">
                      {/* Photo */}
                      <td className="px-4 py-3">
                        <Avatar className="h-9 w-9">
                          {u.profilePicUrl ? (
                            <AvatarImage src={`${API_BASE}${u.profilePicUrl}`} alt={u.fullName || u.username} />
                          ) : null}
                          <AvatarFallback className="bg-accent text-primary text-xs font-bold">
                            {(u.fullName || u.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </td>

                      {/* Full Name */}
                      <td className="px-4 py-3 font-medium">
                        {u.fullName || <span className="text-xs italic text-muted-foreground">No Profile</span>}
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3 font-mono text-xs">{u.username}</td>

                      {/* Role Selector */}
                      <td className="px-4 py-3">
                        <Select
                          value={u.role}
                          onValueChange={(val) => handleRoleChange(u.id, val)}
                          disabled={u.role === "ADMIN"}
                        >
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="STUDENT">Student</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* ID / Reg No */}
                      <td className="px-4 py-3 font-mono text-xs">
                        {u.regNo || <span className="text-xs text-muted-foreground">—</span>}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3">
                        {u.department ? (
                          <Badge variant="outline">{u.department}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-xs truncate max-w-[150px]" title={u.email}>
                        {u.email || <span className="text-xs text-muted-foreground">—</span>}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <Badge
                          variant={u.enabled ? "default" : "secondary"}
                          className="min-w-[60px] justify-center text-xs"
                        >
                          {u.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </td>

                      {/* Created Date */}
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {u.dateRegistered ? new Date(u.dateRegistered).toLocaleDateString() : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(u.id)}
                            disabled={u.role === "ADMIN"}
                            className="h-7 px-2 text-xs transition-all hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-40"
                          >
                            {u.enabled ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(u.id)}
                            disabled={u.role === "ADMIN"}
                            className="h-7 px-2 text-xs transition-all hover:bg-red-700 disabled:opacity-40"
                          >
                            Delete
                          </Button>
                        </div>
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

