import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldAlert,
  Ban,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  adminApi,
  type ManagedUser,
  type UserListParams,
  type UserStats,
} from "@/lib/admin-api";
import { UserDetailDialog } from "./UserDetailDialog";
import { UserEditDialog } from "./UserEditDialog";
import { ConfirmDialog } from "./ConfirmDialog";

const ACCOUNT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const APPROVAL_STATUS_OPTIONS = [
  { value: "", label: "All Approvals" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];


function statusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "inactive":
      return <Badge variant="muted">Inactive</Badge>;
    case "suspended":
      return <Badge variant="destructive">Suspended</Badge>;
    default:
      return <Badge variant="muted">{status}</Badge>;
  }
}

function approvalBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge variant="success">Approved</Badge>;
    case "pending":
      return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">Pending</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="muted">{status}</Badge>;
  }
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Dialogs
  const [detailUser, setDetailUser] = useState<ManagedUser | null>(null);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    requireReason?: boolean;
  } | null>(null);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params: UserListParams = {
      page,
      page_size: 20,
      include_deleted: includeDeleted,
    };
    if (search) params.search = search;
    if (approvalStatus) params.approval_status = approvalStatus;
    if (accountStatus) params.account_status = accountStatus;

    const data = await adminApi.getManagedUsers(params);
    setUsers(data.users);
    setTotal(data.total);
    setTotalPages(data.total_pages);
    setLoading(false);
  }, [page, search, approvalStatus, accountStatus, includeDeleted]);

  const loadStats = async () => {
    const data = await adminApi.getUserStats();
    setStats(data);
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, approvalStatus, accountStatus, includeDeleted]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  };

  const handleStatusChange = (user: ManagedUser, status: string) => {
    const labels: Record<string, string> = {
      active: "Activate",
      inactive: "Deactivate",
      suspended: "Suspend",
    };
    setConfirmAction({
      title: `${labels[status]} User`,
      message: `Are you sure you want to ${labels[status].toLowerCase()} ${user.first_name} ${user.last_name}?`,
      onConfirm: async () => {
        await adminApi.changeUserStatus(user.id, status);
        await loadUsers();
        await loadStats();
      },
    });
  };

  const handleApproval = (user: ManagedUser, action: "approve" | "reject") => {
    setConfirmAction({
      title: action === "approve" ? "Approve User" : "Reject User",
      message: `Are you sure you want to ${action} ${user.first_name} ${user.last_name}?`,
      requireReason: action === "reject",
      onConfirm: async (reason?: string) => {
        await adminApi.handleApproval(user.id, action, reason);
        await loadUsers();
        await loadStats();
      },
    });
  };

  const handleDelete = (user: ManagedUser) => {
    setConfirmAction({
      title: "Delete User",
      message: `Are you sure you want to delete ${user.first_name} ${user.last_name}? The user can be restored later.`,
      onConfirm: async () => {
        await adminApi.softDeleteUser(user.id);
        await loadUsers();
        await loadStats();
      },
    });
  };

  const handleRestore = (user: ManagedUser) => {
    setConfirmAction({
      title: "Restore User",
      message: `Restore ${user.first_name} ${user.last_name}? They will be set to active.`,
      onConfirm: async () => {
        await adminApi.restoreUser(user.id);
        await loadUsers();
        await loadStats();
      },
    });
  };

  const handleBulkAction = (action: string) => {
    setBulkMenuOpen(false);
    const labels: Record<string, string> = {
      approve: "approve",
      reject: "reject",
      activate: "activate",
      deactivate: "deactivate",
      suspend: "suspend",
      delete: "delete",
    };
    setConfirmAction({
      title: `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${labels[action]} ${selected.size} user(s)?`,
      requireReason: action === "reject",
      onConfirm: async (reason?: string) => {
        await adminApi.bulkAction(Array.from(selected), action, reason);
        setSelected(new Set());
        await loadUsers();
        await loadStats();
      },
    });
  };

  const handleExport = async () => {
    const params: UserListParams = {};
    if (search) params.search = search;
    if (approvalStatus) params.approval_status = approvalStatus;
    if (accountStatus) params.account_status = accountStatus;

    const blob = await adminApi.exportUsers(params);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creators_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={Users} label="Total Creators" value={stats.total_users} />
          <StatCard icon={Clock} label="Pending" value={stats.pending_approvals} className="text-amber-500" />
          <StatCard icon={UserCheck} label="Approved" value={stats.approved_creators} className="text-green-500" />
          <StatCard icon={CheckCircle2} label="Active" value={stats.active_users} className="text-primary" />
          <StatCard icon={Ban} label="Suspended" value={stats.suspended_users} className="text-red-500" />
          <StatCard icon={UserX} label="Rejected" value={stats.rejected_users} className="text-rose-500" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Creator Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage creators, approvals, and account statuses.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={15} /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={15} /> Add Creator
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "border-primary text-primary" : ""}
          >
            <Filter size={15} /> Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-3">
            <select
              value={approvalStatus}
              onChange={(e) => setApprovalStatus(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {APPROVAL_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {ACCOUNT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={includeDeleted}
                onCheckedChange={(v) => setIncludeDeleted(!!v)}
              />
              Show deleted
            </label>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="relative">
            <Button size="sm" variant="outline" onClick={() => setBulkMenuOpen(!bulkMenuOpen)}>
              Bulk Actions <MoreHorizontal size={14} />
            </Button>
            {bulkMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-md border border-border bg-popover p-1 shadow-lg">
                <button onClick={() => handleBulkAction("approve")} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted">
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button onClick={() => handleBulkAction("reject")} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted">
                  <XCircle size={14} /> Reject
                </button>
                <button onClick={() => handleBulkAction("activate")} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted">
                  <UserCheck size={14} /> Activate
                </button>
                <button onClick={() => handleBulkAction("deactivate")} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted">
                  <UserX size={14} /> Deactivate
                </button>
                <button onClick={() => handleBulkAction("suspend")} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted">
                  <Ban size={14} /> Suspend
                </button>
                <button onClick={() => handleBulkAction("delete")} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-muted">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-3 py-3">
                  <Checkbox
                    checked={users.length > 0 && selected.size === users.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-3 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Handle</th>
                <th className="px-3 py-3 font-medium">Account</th>
                <th className="px-3 py-3 font-medium">Approval</th>
                <th className="px-3 py-3 font-medium">Registered</th>
                <th className="px-3 py-3 font-medium">Last Login</th>
                <th className="px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    No creators found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b border-border last:border-0 ${u.is_deleted ? "opacity-50" : ""}`}
                  >
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selected.has(u.id)}
                        onCheckedChange={() => toggleSelect(u.id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {u.first_name[0]}{u.last_name[0]}
                          </div>
                        )}
                        <span className="font-medium text-foreground">
                          {u.first_name} {u.last_name}
                          {u.is_deleted && <span className="ml-1 text-xs text-destructive">(deleted)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {u.handle ? `@${u.handle}` : "—"}
                    </td>
                    <td className="px-3 py-3">{statusBadge(u.account_status)}</td>
                    <td className="px-3 py-3">{approvalBadge(u.approval_status)}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setDetailUser(u)} title="View">
                          <Eye size={15} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditUser(u)} title="Edit">
                          <Pencil size={15} />
                        </Button>
                        {u.approval_status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleApproval(u, "approve")} title="Approve" className="text-green-500">
                              <CheckCircle2 size={15} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleApproval(u, "reject")} title="Reject" className="text-destructive">
                              <XCircle size={15} />
                            </Button>
                          </>
                        )}
                        {!u.is_deleted && u.account_status === "active" && (
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(u, "suspended")} title="Suspend" className="text-amber-500">
                            <ShieldAlert size={15} />
                          </Button>
                        )}
                        {!u.is_deleted && u.account_status !== "active" && (
                          <Button variant="ghost" size="sm" onClick={() => handleStatusChange(u, "active")} title="Activate" className="text-green-500">
                            <UserCheck size={15} />
                          </Button>
                        )}
                        {u.is_deleted ? (
                          <Button variant="ghost" size="sm" onClick={() => handleRestore(u)} title="Restore" className="text-primary">
                            <RotateCcw size={15} />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(u)} title="Delete" className="text-destructive">
                            <Trash2 size={15} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {detailUser && (
        <UserDetailDialog user={detailUser} onClose={() => setDetailUser(null)} />
      )}
      {editUser && (
        <UserEditDialog
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={async () => {
            setEditUser(null);
            await loadUsers();
          }}
        />
      )}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          requireReason={confirmAction.requireReason}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {createOpen && (
        <CreateCreatorDialog
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await loadUsers();
            await loadStats();
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon size={16} className={className || "text-muted-foreground"} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function CreateCreatorDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    handle: "",
    instagram: "",
    youtube: "",
    niche: "",
    city: "",
    state: "",
    approval_status: "approved",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminApi.createCreator(form);
      onCreated();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to create creator.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-foreground">Add Creator</h3>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First Name *</Label>
            <Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
          </div>
          <div>
            <Label>Last Name *</Label>
            <Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <Label>Password *</Label>
            <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <Label>Handle</Label>
            <Input value={form.handle} onChange={(e) => update("handle", e.target.value)} placeholder="e.g. kinnarijain" />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
          </div>
          <div>
            <Label>YouTube</Label>
            <Input value={form.youtube} onChange={(e) => update("youtube", e.target.value)} />
          </div>
          <div>
            <Label>Niche</Label>
            <Input value={form.niche} onChange={(e) => update("niche", e.target.value)} />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div>
            <Label>State</Label>
            <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Approval Status</Label>
            <select
              value={form.approval_status}
              onChange={(e) => update("approval_status", e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="approved">Approved (immediately active)</option>
              <option value="pending">Pending (requires approval)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Create Creator
          </Button>
        </div>
      </div>
    </div>
  );
}
