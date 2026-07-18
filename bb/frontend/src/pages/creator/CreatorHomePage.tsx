import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MousePointerClick,
  ShoppingCart,
  Wallet,
  TrendingUp,
  ArrowRight,
  Activity,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSelection } from "@/contexts/SelectionContext";
import { ProductCard } from "@/components/ProductCard";
import {
  creatorApi,
  formatPrice,
  type DashboardStats,
  type Banner,
  type Product,
} from "@/lib/creator-api";

const statCards = [
  { key: "total_clicks", label: "Total Clicks", icon: MousePointerClick, fmt: (v: number) => v.toLocaleString("en-IN") },
  { key: "total_orders", label: "Orders", icon: ShoppingCart, fmt: (v: number) => v.toLocaleString("en-IN") },
  { key: "total_commission", label: "Commission", icon: Wallet, fmt: (v: number) => formatPrice(v) },
  { key: "conversion_rate", label: "Conversion Rate", icon: TrendingUp, fmt: (v: number) => `${v}%` },
] as const;

function BannerCard({ banner }: { banner: Banner }) {
  const inner = (
    <div className="relative overflow-hidden rounded-2xl bg-[#962E3C] px-6 py-6 text-white">
      {banner.image_url && (
        <img
          src={banner.image_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}
      <div className="relative">
        <p className="text-lg font-semibold">{banner.title}</p>
        {banner.subtitle && <p className="mt-1 text-sm text-white/80">{banner.subtitle}</p>}
      </div>
    </div>
  );
  return banner.destination_url ? (
    <a href={banner.destination_url} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}

export default function CreatorHomePage() {
  const { user } = useAuth();
  const { isSelected, toggle } = useSelection();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([creatorApi.stats(), creatorApi.banners(), creatorApi.trending(4)])
      .then(([s, b, t]) => {
        setStats(s);
        setBanners(b);
        setTrending(t);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Hi, {user?.first_name} 👋</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's how your affiliate links are performing.
        </p>
      </div>

      {/* Banner slot (SOW 3.4) */}
      {banners.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.slice(0, 2).map((b) => (
            <BannerCard key={b.id} banner={b} />
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {c.fmt(stats[c.key] as number)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top products */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Your Top Products</h3>
            <Link to="/dashboard/products" className="flex items-center gap-1 text-sm text-[#962E3C] hover:underline">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>
          {stats.top_products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No clicks yet. Generate a link and start sharing to see your top products here.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.top_products.map(({ product, clicks }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                    {product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{clicks}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Activity size={16} /> Recent Activity
          </h3>
          <div className="rounded-xl border border-border bg-card p-2">
            {stats.recent_activity.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recent_activity.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 p-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{a.product_name || "Bundle page opened"}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {a.source || "direct"} ·{" "}
                        {a.clicked_at ? new Date(a.clicked_at).toLocaleString() : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Trending products */}
      {trending.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Trending Products</h3>
            <Link to="/dashboard/products" className="flex items-center gap-1 text-sm text-[#962E3C] hover:underline">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} selected={isSelected(p.id)} onToggle={toggle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
