import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  title: string;
  message: string;
  requireReason?: boolean;
  onConfirm: (reason?: string) => Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, requireReason, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError("Reason is required.");
      return;
    }
    setLoading(true);
    try {
      await onConfirm(reason || undefined);
      onCancel();
    } catch (e: any) {
      setError(e.response?.data?.detail || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>

        {requireReason && (
          <div className="mt-4">
            <Input
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
            />
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
