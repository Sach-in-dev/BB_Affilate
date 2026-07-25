import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  adminApi,
  type Permission,
  type Role,
  type CreateRolePayload,
  type UpdateRolePayload,
} from "@/lib/admin-api";
import { RoleFormDialog } from "./RoleFormDialog";

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const load = async () => {
    const [r, p] = await Promise.all([
      adminApi.getRoles(),
      adminApi.getPermissions(),
    ]);
    setRoles(r);
    setPermissions(p);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (r: Role) => {
    setEditing(r);
    setDialogOpen(true);
  };

  const handleCreate = async (payload: CreateRolePayload) => {
    await adminApi.createRole(payload);
    await load();
  };

  const handleUpdate = async (name: string, payload: UpdateRolePayload) => {
    await adminApi.updateRole(name, payload);
    await load();
  };

  const handleDelete = async (r: Role) => {
    if (r.is_system) {
      alert("Cannot delete system roles.");
      return;
    }
    if (!confirm(`Delete role ${r.label}? Users with this role might lose access.`)) return;
    try {
      await adminApi.deleteRole(r.name);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Could not delete role.");
    }
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
          <h2 className="text-2xl font-semibold text-foreground">Roles Master</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage custom roles to control admin access.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-cyan-400 text-neutral-950 hover:bg-cyan-300">
          <Plus size={16} /> Add Custom Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <div key={r.name} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {r.is_system ? (
                    <div title="System Role"><ShieldAlert size={18} className="text-destructive" /></div>
                  ) : (
                    <div title="Custom Role"><ShieldCheck size={18} className="text-cyan-400" /></div>
                  )}
                  <span className="font-semibold text-lg">{r.label}</span>
                </div>
                {!r.is_system && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(r)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
                {r.is_system && (
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)} title="View Permissions">
                     <Pencil size={14} />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                {r.description || "No description provided."}
              </p>
            </div>
            
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Permissions ({r.permissions.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.slice(0, 5).map(p => (
                  <span key={p} className="inline-flex rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-medium text-neutral-300">
                    {permissions.find(perm => perm.key === p)?.label || p}
                  </span>
                ))}
                {r.permissions.length > 5 && (
                  <span className="inline-flex rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-medium text-neutral-400">
                    +{r.permissions.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        permissions={permissions}
        editing={editing}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
