import { useEffect, useState } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminApi, type ManagedUser, type ActivityLog } from "@/lib/admin-api";

interface Props {
  user: ManagedUser;
  onClose: () => void;
}

export function UserDetailDialog({ user, onClose }: Props) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    adminApi.getUserActivity(user.id).then((data) => {
      setLogs(data.logs);
      setLogsLoading(false);
    });
  }, [user.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {user.first_name[0]}{user.last_name[0]}
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-foreground">{user.first_name} {user.last_name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex gap-2">
              <Badge variant="secondary" className="capitalize">{user.role_name || user.user_type}</Badge>
              {user.account_status === "active" && <Badge variant="success">Active</Badge>}
              {user.account_status === "suspended" && <Badge variant="destructive">Suspended</Badge>}
              {user.account_status === "inactive" && <Badge variant="muted">Inactive</Badge>}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {/* Account Info */}
          <Section title="Account Information">
            <Field label="User Type" value={user.user_type} />
            <Field label="Approval Status" value={user.approval_status} />
            {user.rejection_reason && <Field label="Rejection Reason" value={user.rejection_reason} />}
            <Field label="Registered" value={user.created_at ? new Date(user.created_at).toLocaleString() : "—"} />
            <Field label="Last Login" value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"} />
            {user.approved_at && <Field label="Approved At" value={new Date(user.approved_at).toLocaleString()} />}
          </Section>

          {/* Profile (for creators) */}
          {user.user_type === "creator" && (
            <Section title="Creator Profile">
              <Field label="Handle" value={user.handle || "—"} />
              <Field label="Bio" value={user.bio || "—"} />
              <Field label="Niche" value={user.niche || "—"} />
              <Field label="City" value={user.city || "—"} />
              <Field label="State" value={user.state || "—"} />
              <Field label="Follower Count" value={user.follower_count || "—"} />
            </Section>
          )}

          {/* Social Media */}
          {user.user_type === "creator" && (user.instagram || user.youtube) && (
            <Section title="Social Media">
              {user.instagram && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24">Instagram</span>
                  <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-cyan-400 hover:underline">
                    @{user.instagram} <ExternalLink size={12} />
                  </a>
                </div>
              )}
              {user.youtube && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-24">YouTube</span>
                  <span className="text-sm">{user.youtube}</span>
                </div>
              )}
            </Section>
          )}

          {/* Payout Details */}
          {user.user_type === "creator" && (user.payout_upi || user.payout_bank_name) && (
            <Section title="Payout Details">
              {user.payout_upi && <Field label="UPI ID" value={user.payout_upi} />}
              {user.payout_bank_name && <Field label="Bank Name" value={user.payout_bank_name} />}
              {user.payout_account_number && <Field label="Account No." value={user.payout_account_number} />}
              {user.payout_ifsc && <Field label="IFSC" value={user.payout_ifsc} />}
            </Section>
          )}

          {/* Activity Logs */}
          <Section title="Activity Logs">
            {logsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded.</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded border border-border px-3 py-2 text-xs">
                    <span className="font-medium capitalize">{log.action.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <div className="space-y-1.5 rounded-lg border border-border p-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-32 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
