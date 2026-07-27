import { useMemo, useState } from "react";
import { Search, Instagram, Youtube, Star, ShoppingBag } from "lucide-react";
import { formatPrice, type Product } from "@/lib/creator-api";
import { publicApi, type ResolvedLink } from "@/lib/public-api";
import { cn } from "@/lib/utils";

/** Customer-facing product tile. Clicking routes through the tracking endpoint. */
function LandingProductCard({ product, code, source }: { product: Product; code: string; source?: string }) {
  const hasDiscount = product.discount_price != null && product.discount_price > 0;
  const off =
    hasDiscount && product.price
      ? Math.round(((product.price - (product.discount_price as number)) / product.price) * 100)
      : 0;

  return (
    <a
      href={publicApi.productRedirectUrl(code, product.id, source)}
      className="group flex flex-col overflow-hidden border-b border-r border-border bg-card"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/40">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-active:scale-95"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-neutral-950">
            {off}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        {product.brand && (
          <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">{product.brand}</p>
        )}
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{product.name}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-2">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(hasDiscount ? product.discount_price : product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-muted-foreground line-through">{formatPrice(product.price)}</span>
          )}
          {product.rating != null && product.rating > 0 && (
            <span className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default function BundleLandingPage({
  data,
  source,
}: {
  data: ResolvedLink;
  source?: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(data.products.map((p) => p.category).filter(Boolean) as string[]);
    return ["All", ...Array.from(set)];
  }, [data.products]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.products.filter((p) => {
      const matchesCat = category === "All" || p.category === category;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [data.products, search, category]);

  const { creator } = data;
  const initials = creator.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg bg-background pb-10">
        {/* Brand bar */}
        <div className="flex items-center justify-center border-b border-border py-3">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">26</span>
            <span className="text-white">ritual</span>
          </span>
        </div>

        {/* Creator profile */}
        <div className="px-4 pt-5">
          <div className="flex items-start gap-4">
            <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full border-2 border-primary p-0.5">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt={creator.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xl font-bold text-neutral-950">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h1 className="text-xl font-bold text-foreground">{creator.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {creator.instagram && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Instagram size={13} className="text-[#E1306C]" />
                    {creator.instagram}
                  </span>
                )}
                {creator.youtube && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Youtube size={13} className="text-[#FF0000]" />
                    {creator.youtube}
                  </span>
                )}
              </div>
            </div>
          </div>

          {creator.bio && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{creator.bio}</p>
          )}

          {/* Stats strip */}
          <div className="mt-4 grid grid-cols-2 divide-x divide-border rounded-xl border border-border bg-card">
            <div className="py-3 text-center">
              <p className="text-base font-bold text-foreground">{data.products.length}</p>
              <p className="text-[11px] text-muted-foreground">Products</p>
            </div>
            <div className="py-3 text-center">
              <p className="text-base font-bold text-foreground">
                {data.products.filter((p) => p.discount_price).length}
              </p>
              <p className="text-[11px] text-muted-foreground">On Offer</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="sticky top-0 z-10 mt-4 bg-background px-4 py-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${creator.handle ? "@" + creator.handle : creator.name}'s store`}
              className="h-11 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          </div>
        </div>

        {/* Category tabs */}
        {categories.length > 2 && (
          <div className="border-b border-border">
            <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 text-sm font-semibold text-foreground">Category</span>
              <span className="mx-1 h-4 w-px shrink-0 bg-border" />
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
                    category === c
                      ? "border-primary bg-primary font-medium text-neutral-950"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product grid */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag size={28} className="text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No products match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 border-l border-t border-border">
            {visible.map((p) => (
              <LandingProductCard key={p.id} product={p} code={data.code} source={source} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Curated by {creator.name} · Powered by{" "}
            <span className="font-semibold text-primary">26 Ritual</span>
          </p>
        </div>
      </div>
    </div>
  );
}
