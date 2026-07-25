import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Link2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/contexts/SelectionContext";
import { creatorApi, formatPrice, type AffiliateLink } from "@/lib/creator-api";
import { LinkResultDialog } from "@/components/LinkResultDialog";

export function SelectionBar() {
  const { selected, remove, clear } = useSelection();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AffiliateLink | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const generate = async () => {
    try {
      setLoading(true);
      const link = await creatorApi.generateLink(selected.map((p) => p.id));
      setResult(link);
      setDialogOpen(true);
      clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* The bar hides once the selection is cleared, but this component must stay
          mounted so the generated-link dialog survives that clear. */}
      {selected.length > 0 && (
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-border bg-card/95 p-2.5 pl-4 shadow-xl backdrop-blur">
          {/* thumbnails */}
          <div className="flex -space-x-2">
            {selected.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-card bg-muted"
                title={p.name}
              >
                {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                <button
                  onClick={() => remove(p.id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {selected.length > 4 && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                +{selected.length - 4}
              </div>
            )}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {selected.length} product{selected.length > 1 ? "s" : ""} selected
            </p>
            <p className="text-xs text-muted-foreground">
              {selected.length === 1 ? "Single product link" : "Bundle landing page"}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
              Clear
            </Button>
            <Button
              onClick={generate}
              disabled={loading}
              className="rounded-full bg-cyan-400 text-neutral-950 hover:bg-cyan-300"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : selected.length > 1 ? (
                <Sparkles size={16} />
              ) : (
                <Link2 size={16} />
              )}
              Generate Link
            </Button>
          </div>
        </div>
      </div>
      )}

      <LinkResultDialog
        link={result}
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) navigate("/dashboard/links");
        }}
      />
    </>
  );
}
