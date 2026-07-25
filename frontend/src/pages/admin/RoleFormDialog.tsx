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
  Permission,
  Role,
  CreateRolePayload,
  UpdateRolePayload,
} from "@/lib/admin-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: Permission[];
  editing: Role | null;
  onCreate: (payload: CreateRolePayload) => Promise<void>;
  onUpdate: (name: string, payload: UpdateRolePayload) => Promise<void>;
}

const empty = {
  name: "",
  label: "",
  description: "",
};

export function RoleFormDialog({
  open,
  onOpenChange,
  permissions,
  editing,
  onCreate,
  onUpdate,
}: Props) {
  const [form, setForm] = useState(empty);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group permissions for display.
  const grouped = useMemo(() => {
    const g: Record<string, Permission[]> = {};
    for (const p of permissions) (g[p.group] ??= []).push(p);
    return g;
  }, [permissions]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setForm({
        name: editing.name,
        label: editing.label,
        description: editing.description ?? "",
      });
      setSelectedPerms(editing.permissions);
    } else {
      setForm(empty);
      setSelectedPerms([]);
    }
  }, [open, editing]);

  const togglePerm = (key: string) => {
    setSelectedPerms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const canSubmit = form.name && form.label;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setLoading(true);
      setError(null);
      
      const payloadId = form.name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
      
      if (editing) {
        const payload: UpdateRolePayload = {
          label: form.label,
          description: form.description || undefined,
          permissions: selectedPerms,
        };
        await onUpdate(editing.name, payload);
      } else {
        await onCreate({
          name: payloadId,
          label: form.label,
          description: form.description || undefined,
          permissions: selectedPerms,
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
          <DialogTitle>{editing ? "Edit role" : "Create custom role"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Modify this role's details and permissions. Changes will automatically apply to all users with this role."
              : "Create a new role and define its access level."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Role Label *</Label>
              <Input
                value={form.label}
                onChange={(e) => {
                  const label = e.target.value;
                  if (!editing) {
                    setForm({ ...form, label, name: label.toLowerCase().replace(/[^a-z0-9_]/g, "_") });
                  } else {
                    setForm({ ...form, label });
                  }
                }}
                className="mt-1"
                placeholder="e.g. Content Manager"
              />
            </div>
            <div>
              <Label>Internal Name</Label>
              <Input
                value={form.name}
                disabled
                className="mt-1 disabled:opacity-60 bg-neutral-900"
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1"
              placeholder="What does this role do?"
            />
          </div>

          <div>
            <Label className="mb-2 block">Permissions *</Label>
            <div className="space-y-4 rounded-lg border border-border p-4">
              {Object.entries(grouped).map(([group, perms]) => (
                <div key={group}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {perms.map((p) => (
                      <label
                        key={p.key}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedPerms.includes(p.key)}
                          disabled={editing?.is_system}
                          onCheckedChange={() => togglePerm(p.key)}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
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
              {loading ? <Loader2 className="animate-spin" /> : editing ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
