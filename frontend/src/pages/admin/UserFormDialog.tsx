import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  AdminUser,
  Role,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/lib/admin-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  editing: AdminUser | null;
  onCreate: (payload: CreateUserPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateUserPayload) => Promise<void>;
}

const empty = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
};

export function UserFormDialog({
  open,
  onOpenChange,
  roles,
  editing,
  onCreate,
  onUpdate,
}: Props) {
  const [form, setForm] = useState(empty);
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the form whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setForm({
        first_name: editing.first_name,
        last_name: editing.last_name,
        email: editing.email,
        password: "",
        phone: editing.phone ?? "",
      });
      setRoleName(editing.role_name ?? "");
    } else {
      setForm(empty);
      const first = roles[0]?.name ?? "";
      setRoleName(first);
    }
  }, [open, editing, roles]);

  const handleRoleChange = (name: string) => {
    setRoleName(name);
  };

  const canSubmit =
    form.first_name &&
    form.last_name &&
    form.email &&
    roleName &&
    (editing || form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setLoading(true);
      setError(null);
      if (editing) {
        const payload: UpdateUserPayload = {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone || null,
          role_name: roleName,
        };
        if (form.password) payload.password = form.password;
        await onUpdate(editing.id, payload);
      } else {
        await onCreate({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          role_name: roleName,
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit admin user" : "Add admin user"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update details and role for this admin user."
              : "Create a new admin user and assign their role."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First Name *</Label>
              <Input
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 disabled:opacity-60"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{editing ? "New Password" : "Password *"}</Label>
              <Input
                type="password"
                placeholder={editing ? "Leave blank to keep" : ""}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Role *</Label>
              <select
                value={roleName}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {roles.map((r) => (
                  <option key={r.name} value={r.name} className="bg-background text-foreground">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>



          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || loading}
              className="bg-cyan-400 text-neutral-950 hover:bg-cyan-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : editing ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
