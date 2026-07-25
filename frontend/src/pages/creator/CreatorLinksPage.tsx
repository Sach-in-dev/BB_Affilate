import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Package,
  Layers,
  Loader2,
  Link2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { creatorApi, type AffiliateLink } from "@/lib/creator-api";

function LinkRow({ link, onDelete }: { link: AffiliateLink; onDelete: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const isBundle = link.link_type === "bundle";

  const copy = async () => {
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isBundle ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          {isBundle ? <Layers size={18} /> : <Package size={18} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">
              {link.title || (isBundle ? `Bundle of ${link.items.length} products` : link.items[0]?.product.name)}
            </p>
            <Badge variant={isBundle ? "default" : "secondary"}>
              {isBundle ? "Bundle" : "Single"}
            </Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="truncate rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {link.url}
            </code>
            <button onClick={copy} className="shrink-0 text-muted-foreground hover:text-foreground" title="Copy">
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Per-product attribution */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {link.items.map((i) => (
              <span
                key={i.product.id}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background py-0.5 pl-0.5 pr-2 text-xs"
                title={i.product.name}
              >
                <span className="h-5 w-5 overflow-hidden rounded-full bg-muted">
                  {i.product.image && <img src={i.product.image} alt="" className="h-full w-full object-cover" />}
                </span>
                <span className="max-w-[9rem] truncate">{i.product.name}</span>
                <span className="font-medium text-muted-foreground">{i.clicks}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div>
            <p className="text-lg font-semibold">{link.total_clicks}</p>
            <p className="text-xs text-muted-foreground">clicks</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{link.total_orders}</p>
            <p className="text-xs text-muted-foreground">orders</p>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Open link"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={() => onDelete(link.id)}
              className="rounded-md p-2 text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorLinksPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => creatorApi.myLinks().then(setLinks).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this affiliate link? Existing shares will stop working.")) return;
    await creatorApi.deleteLink(id);
    load();
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">My Affiliate Links</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share these on Instagram, YouTube or anywhere — every click is tracked.
          </p>
        </div>
        <Button asChild className="bg-cyan-400 text-neutral-950 hover:bg-cyan-300">
          <Link to="/dashboard/products">
            <Plus size={16} /> New Link
          </Link>
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Link2 size={22} />
          </div>
          <p className="mt-4 font-medium text-foreground">No links yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Pick products from the catalog and generate your first tracking link.
          </p>
          <Button asChild className="mt-5 bg-cyan-400 text-neutral-950 hover:bg-cyan-300">
            <Link to="/dashboard/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((l) => (
            <LinkRow key={l.id} link={l} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
