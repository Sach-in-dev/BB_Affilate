import { useState } from "react";
import { Copy, Check, ExternalLink, Package, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AffiliateLink } from "@/lib/creator-api";

export function LinkResultDialog({
  link,
  open,
  onOpenChange,
}: {
  link: AffiliateLink | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!link) return null;
  const isBundle = link.link_type === "bundle";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isBundle ? <Layers size={22} /> : <Package size={22} />}
          </div>
          <DialogTitle className="text-center">
            {isBundle ? "Bundle link ready" : "Affiliate link ready"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isBundle
              ? `Share this single link — customers land on your branded page with all ${link.items.length} products.`
              : "Share this link — customers go straight to the product page."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
          <input
            readOnly
            value={link.url}
            className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
          />
          <Button size="sm" onClick={copy} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={isBundle ? "default" : "secondary"}>
            {isBundle ? "Bundle" : "Single product"}
          </Badge>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Preview <ExternalLink size={13} />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
