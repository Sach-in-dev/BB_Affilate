import { useEffect, useState } from "react";
import { Loader2, MousePointerClick, ShoppingCart, Wallet, TrendingUp } from "lucide-react";
import { creatorApi, formatPrice, type DashboardStats } from "@/lib/creator-api";

const cards = [
  { key: "total_clicks", label: "Total Clicks", icon: MousePointerClick, fmt: (v: number) => v.toLocaleString("en-IN") },
  { key: "total_orders", label: "Orders", icon: ShoppingCart, fmt: (v: number) => v.toLocaleString("en-IN") },
  { key: "total_commission", label: "Commission Earned", icon: Wallet, fmt: (v: number) => formatPrice(v) },
  { key: "conversion_rate", label: "Conversion Rate", icon: TrendingUp, fmt: (v: number) => `${v}%` },
] as const;

/** Lightweight bar chart — avoids pulling in a chart library for one view. */
function ClicksChart({ series }: { series: { date: string; clicks: number }[] }) {
  if (series.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No clicks recorded in the last 7 days.
      </div>
    );
  }
  const max = Math.max(...series.map((s) => s.clicks), 1);

  return (
    <div className="flex h-48 items-end gap-2">
      {series.map((s) => (
        <div key={s.date} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-[#962E3C] transition-all"
              style={{ height: `${Math.max((s.clicks / max) * 100, 4)}%` }}
              title={`${s.clicks} clicks`}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CreatorAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    creatorApi.stats().then(setStats).finally(() => setLoading(false));
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
        <h2 className="text-2xl font-semibold text-foreground">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance across all {stats.total_links} of your affiliate links.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{c.fmt(stats[c.key] as number)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-foreground">Clicks — last 7 days</h3>
        <ClicksChart series={stats.clicks_series} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-foreground">Top Products</h3>
          {stats.top_products.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No product clicks yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.top_products.map(({ product, clicks }, i) => (
                <li key={product.id} className="flex items-center gap-3">
                  <span className="w-4 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                  <div className="h-9 w-9 overflow-hidden rounded-lg bg-muted">
                    {product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </div>
                  <span className="text-sm font-semibold">{clicks}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-foreground">Recent Clicks</h3>
          {stats.recent_activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recent_activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{a.product_name || "Bundle page opened"}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.clicked_at ? new Date(a.clicked_at).toLocaleString() : ""}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                    {a.source || "direct"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
