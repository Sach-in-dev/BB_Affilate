import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminApi,
  type AdminUser,
  type Permission,
  type Role,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/lib/admin-api";
import { UserFormDialog } from "./UserFormDialog";

export default function RolesPermissionsPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const load = async () => {
    const [u, r, p] = await Promise.all([
      adminApi.getUsers(),
      adminApi.getRoles(),
      adminApi.getPermissions(),
    ]);
    setUsers(u);
    setRoles(r);
    setPermissions(p);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const roleLabel = (name: string | null) =>
    roles.find((r) => r.name === name)?.label ?? name ?? "—";

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setDialogOpen(true);
  };

  const handleCreate = async (payload: CreateUserPayload) => {
    await adminApi.createUser(payload);
    await load();
  };

  const handleUpdate = async (id: string, payload: UpdateUserPayload) => {
    await adminApi.updateUser(id, payload);
    await load();
  };

  const toggleActive = async (u: AdminUser) => {
    await adminApi.updateUser(u.id, { is_active: !u.is_active });
    await load();
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete admin user ${u.first_name} ${u.last_name}? This cannot be undone.`)) return;
    await adminApi.deleteUser(u.id);
    await load();
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Users &amp; Roles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage admin users and control what each of them can access.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#962E3C] text-white hover:bg-[#7f2632]">
          <Plus size={16} /> Add Admin User
        </Button>
      </div>

      {/* Roles reference */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Roles
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <div key={r.name} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span className="font-semibold">{r.label}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{r.description}</p>
              <p className="mt-3 text-xs font-medium text-foreground">
                {r.permissions.length} permission{r.permissions.length !== 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Admin Users
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Permissions</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {u.first_name[0]}
                        {u.last_name[0]}
                      </div>
                      <span className="font-medium text-foreground">
                        {u.first_name} {u.last_name}
                        {u.id === me?.id && (
                          <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{roleLabel(u.role_name)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.permissions.length}</td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="muted">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(u)}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(u)}
                        disabled={u.id === me?.id}
                        title={u.is_active ? "Deactivate" : "Activate"}
                        className="text-xs"
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u)}
                        disabled={u.id === me?.id}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        roles={roles}
        permissions={permissions}
        editing={editing}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
