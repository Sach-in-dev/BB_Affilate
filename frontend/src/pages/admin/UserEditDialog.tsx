import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi, type ManagedUser, type UpdateManagedUserPayload } from "@/lib/admin-api";

interface Props {
  user: ManagedUser;
  onClose: () => void;
  onSaved: () => void;
}

export function UserEditDialog({ user, onClose, onSaved }: Props) {
  const [form, setForm] = useState<UpdateManagedUserPayload>({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone || "",
    handle: user.handle || "",
    bio: user.bio || "",
    instagram: user.instagram || "",
    youtube: user.youtube || "",
    niche: user.niche || "",
    city: user.city || "",
    state: user.state || "",
    follower_count: user.follower_count || "",
    payout_upi: user.payout_upi || "",
    payout_bank_name: user.payout_bank_name || "",
    payout_account_number: user.payout_account_number || "",
    payout_ifsc: user.payout_ifsc || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminApi.updateManagedUser(user.id, form);
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Failed to save.");
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
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        <h3 className="mb-4 text-lg font-semibold text-foreground">Edit User</h3>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First Name</Label>
            <Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <Label>Handle</Label>
            <Input value={form.handle} onChange={(e) => update("handle", e.target.value)} />
          </div>

          {user.user_type === "creator" && (
            <>
              <div className="col-span-2">
                <Label>Bio</Label>
                <Input value={form.bio} onChange={(e) => update("bio", e.target.value)} />
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
                <Label>Follower Count</Label>
                <Input value={form.follower_count} onChange={(e) => update("follower_count", e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
              </div>
              <div className="col-span-2 mt-2 border-t border-border pt-3">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Payout Details</h4>
              </div>
              <div>
                <Label>UPI ID</Label>
                <Input value={form.payout_upi} onChange={(e) => update("payout_upi", e.target.value)} />
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input value={form.payout_bank_name} onChange={(e) => update("payout_bank_name", e.target.value)} />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input value={form.payout_account_number} onChange={(e) => update("payout_account_number", e.target.value)} />
              </div>
              <div>
                <Label>IFSC Code</Label>
                <Input value={form.payout_ifsc} onChange={(e) => update("payout_ifsc", e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
