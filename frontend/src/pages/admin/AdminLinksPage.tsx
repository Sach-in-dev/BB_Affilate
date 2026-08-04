import { useEffect, useState, useCallback } from "react";
import {
  Search, Download, ChevronLeft, ChevronRight, LinkIcon,
  MousePointerClick, Filter, Eye, ToggleLeft, ToggleRight,
  Copy, Users, BarChart3, Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  adminApi,
  type AdminLink,
  type AdminLinkListResponse,
  type LinkStats,
  type ClickEntry,
  type ClickListResponse,
} from "@/lib/admin-api";

type Tab = "links" | "clicks" | "analytics";

export default function AdminLinksPage() {
  const [tab, setTab] = useState<Tab>("links");
  const [stats, setStats] = useState<LinkStats | null>(null);

  useEffect(() => {
    adminApi.getLinkStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Links & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track affiliate links, clicks, and performance.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<LinkIcon size={20} />} label="Total Links" value={stats.total_links} />
          <StatCard icon={<ToggleRight size={20} />} label="Active Links" value={stats.active_links} />
          <StatCard icon={<MousePointerClick size={20} />} label="Total Clicks" value={stats.total_clicks} />
          <StatCard icon={<Users size={20} />} label="Unique Clicks" value={stats.unique_clicks} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {(["links", "clicks", "analytics"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "links" ? "All Links" : t === "clicks" ? "Click Log" : "Analytics"}
          </button>
        ))}
      </div>

      {tab === "links" && <LinksTab onRefreshStats={() => adminApi.getLinkStats().then(setStats)} />}
      {tab === "clicks" && <ClicksTab />}
      {tab === "analytics" && stats && <AnalyticsTab stats={stats} />}
    </div>
  );
}

/* ─── Links Tab ─── */

function LinksTab({ onRefreshStats }: { onRefreshStats: () => void }) {
  const [data, setData] = useState<AdminLinkListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [linkType, setLinkType] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: 20 };
      if (search) params.search = search;
      if (linkType) params.link_type = linkType;
      if (activeFilter === "true") params.is_active = true;
      if (activeFilter === "false") params.is_active = false;
      const res = await adminApi.getAdminLinks(params);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, search, linkType, activeFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, linkType, activeFilter]);

  const handleExport = async () => {
    const blob = await adminApi.exportLinks({ search: search || undefined, link_type: linkType || undefined });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "links_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleStatus = async (link: AdminLink) => {
    await adminApi.toggleLinkStatus(link.id, !link.is_active);
    load();
    onRefreshStats();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by code or title..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors">
            <Filter size={16} /> Filters
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4">
          <select value={linkType} onChange={(e) => setLinkType(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm">
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="bundle">Bundle</option>
          </select>
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button onClick={() => { setLinkType(""); setActiveFilter(""); }} className="text-sm text-primary hover:underline">Clear</button>
        </div>
      )}

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Creator</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Products</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Clicks</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : !data?.links.length ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No links found.</td></tr>
              ) : (
                data.links.map((link) => (
                  <LinkRow key={link.id} link={link} onToggle={handleToggleStatus} onCopy={copyUrl} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {data.page} of {data.total_pages} ({data.total} total)</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"><ChevronLeft size={14} /> Prev</button>
            <button onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))} disabled={page >= data.total_pages} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function LinkRow({ link, onToggle, onCopy }: { link: AdminLink; onToggle: (l: AdminLink) => void; onCopy: (url: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const date = link.created_at ? new Date(link.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <>
      <tr className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-foreground">{link.creator?.name || "Unknown"}</p>
            {link.creator?.handle && <p className="text-xs text-muted-foreground">@{link.creator.handle}</p>}
          </div>
        </td>
        <td className="px-4 py-3">
          <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{link.code}</code>
        </td>
        <td className="px-4 py-3">
          <Badge variant={link.link_type === "bundle" ? "default" : "secondary"}>{link.link_type}</Badge>
        </td>
        <td className="px-4 py-3 text-muted-foreground">{link.products.length} product{link.products.length !== 1 ? "s" : ""}</td>
        <td className="px-4 py-3">
          <span className="font-medium text-foreground">{link.total_clicks}</span>
        </td>
        <td className="px-4 py-3">
          <Badge variant={link.is_active ? "success" : "destructive"}>{link.is_active ? "Active" : "Inactive"}</Badge>
        </td>
        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{date}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onCopy(link.url)} className="rounded-md p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Copy URL">
              <Copy size={15} />
            </button>
            <button onClick={() => onToggle(link)} className={`rounded-md p-1.5 transition-colors ${link.is_active ? "text-muted-foreground hover:text-red-500 hover:bg-red-500/10" : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10"}`} title={link.is_active ? "Deactivate" : "Activate"}>
              {link.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b last:border-0 bg-muted/20">
          <td colSpan={8} className="px-4 py-3">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tracking URL</p>
                  <p className="text-foreground text-xs break-all font-mono">{link.url}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Title</p>
                  <p className="text-foreground">{link.title || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Creator Email</p>
                  <p className="text-foreground">{link.creator?.email || "—"}</p>
                </div>
              </div>
              {link.products.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Products</p>
                  <div className="flex flex-wrap gap-2">
                    {link.products.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs">
                        {p.image && <img src={p.image} alt="" className="h-6 w-6 rounded object-cover" />}
                        <span className="text-foreground">{p.name}</span>
                        <span className="text-muted-foreground">({p.clicks} clicks)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Clicks Tab ─── */

function ClicksTab() {
  const [data, setData] = useState<ClickListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: 20 };
      if (source) params.source = source;
      const res = await adminApi.getClicks(params);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, source]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [source]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={source} onChange={(e) => setSource(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="">All Sources</option>
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
          <option value="facebook">Facebook</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="twitter">Twitter</option>
          <option value="direct">Direct</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Link Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Source</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP Address</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Referrer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Clicked At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : !data?.clicks.length ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No clicks recorded yet.</td></tr>
              ) : (
                data.clicks.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{c.code}</code></td>
                    <td className="px-4 py-3"><Badge variant="default">{c.source || "unknown"}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.ip_address || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{c.referrer || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {c.clicked_at ? new Date(c.clicked_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {data.page} of {data.total_pages} ({data.total} total)</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"><ChevronLeft size={14} /> Prev</button>
            <button onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))} disabled={page >= data.total_pages} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Analytics Tab ─── */

function AnalyticsTab({ stats }: { stats: LinkStats }) {
  const maxClicks = Math.max(...stats.clicks_by_day.map((d) => d.clicks), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Single Links" value={stats.single_links} />
        <MiniStat label="Bundle Links" value={stats.bundle_links} />
        <MiniStat label="Inactive Links" value={stats.inactive_links} />
        <MiniStat label="Unique Visitors" value={stats.unique_clicks} />
      </div>

      {/* Clicks Chart */}
      {stats.clicks_by_day.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary" />
            <h3 className="font-medium text-foreground">Clicks (Last 30 Days)</h3>
          </div>
          <div className="flex items-end gap-1 h-40">
            {stats.clicks_by_day.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors min-h-[2px]"
                  style={{ height: `${(d.clicks / maxClicks) * 100}%` }}
                  title={`${d.date}: ${d.clicks} clicks`}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block rounded bg-foreground text-background px-2 py-1 text-xs whitespace-nowrap z-10">
                  {d.date}: {d.clicks}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">{stats.clicks_by_day[0]?.date}</span>
            <span className="text-xs text-muted-foreground">{stats.clicks_by_day[stats.clicks_by_day.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Top Sources */}
      {stats.top_sources.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-primary" />
            <h3 className="font-medium text-foreground">Top Traffic Sources</h3>
          </div>
          <div className="space-y-3">
            {stats.top_sources.map((s) => {
              const pct = stats.total_clicks > 0 ? (s.count / stats.total_clicks) * 100 : 0;
              return (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-24 capitalize">{s.source}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">{s.count}</span>
                  <span className="text-xs text-muted-foreground w-12 text-right">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Shared ─── */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
