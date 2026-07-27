import { Check, Plus, Star } from "lucide-react";
import { type Product, formatPrice } from "@/lib/creator-api";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  selected?: boolean;
  onToggle?: (p: Product) => void;
  compact?: boolean;
}

export function ProductCard({ product, selected, onToggle, compact }: Props) {
  const hasDiscount = product.discount_price != null && product.discount_price > 0;
  const off =
    hasDiscount && product.price
      ? Math.round(((product.price - (product.discount_price as number)) / product.price) * 100)
      : 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:shadow-md"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/40">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-neutral-950">
            {off}% OFF
          </span>
        )}
        {!product.availability && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
            Out of stock
          </span>
        )}
        {onToggle && (
          <button
            onClick={() => onToggle(product)}
            aria-label={selected ? "Deselect" : "Select"}
            className={cn(
              "absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-colors",
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-white/90 text-primary hover:bg-white"
            )}
          >
            {selected ? <Check size={16} /> : <Plus size={16} />}
          </button>
        )}
      </div>

      {/* Body */}
      <div className={cn("flex flex-1 flex-col p-3", compact && "p-2.5")}>
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
        )}
        <p className="mt-0.5 line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(hasDiscount ? product.discount_price : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
          {product.rating != null && product.rating > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {onToggle && (
        <button
          onClick={() => onToggle(product)}
          className={cn(
            "border-t py-2 text-sm font-medium transition-colors",
            selected
              ? "bg-primary/10 text-primary"
              : "text-primary hover:bg-muted"
          )}
        >
          {selected ? "Selected" : "Select"}
        </button>
      )}
    </div>
  );
}
