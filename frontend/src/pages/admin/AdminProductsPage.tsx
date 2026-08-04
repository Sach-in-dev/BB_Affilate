import { useEffect, useState, useCallback } from "react";
import {
  Search, Download, ChevronLeft, ChevronRight, Package,
  CheckCircle2, XCircle, ExternalLink, Filter, ShoppingCart, Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  adminApi,
  type AdminProduct,
  type AdminProductListResponse,
  type ProductStats,
} from "@/lib/admin-api";

export default function AdminProductsPage() {
  const [data, setData] = useState<AdminProductListResponse | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [availability, setAvailability] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: 20 };
      if (search) params.search = search;
      if (brand) params.brand = brand;
      if (category) params.category = category;
      if (status) params.status = status;
      if (availability === "true") params.availability = true;
      if (availability === "false") params.availability = false;
      const res = await adminApi.getAdminProducts(params);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, search, brand, category, status, availability]);

  useEffect(() => {
    adminApi.getProductStats().then(setStats);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, brand, category, status, availability]);

  const handleExport = async () => {
    const blob = await adminApi.exportProducts({ search: search || undefined, brand: brand || undefined, category: category || undefined });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Products</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage product catalog synced from BeautyBarn.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Package size={20} />} label="Total Products" value={stats.total} />
          <StatCard icon={<CheckCircle2 size={20} />} label="Active" value={stats.active} />
          <StatCard icon={<ShoppingCart size={20} />} label="In Stock" value={stats.in_stock} />
          <StatCard icon={<Tag size={20} />} label="Affiliate Enabled" value={stats.affiliate_enabled} />
        </div>
      )}

      {/* Search + Filters + Export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, brand, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            <Filter size={16} /> Filters
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && stats && (
        <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4">
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm">
            <option value="">All Brands</option>
            {stats.brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm">
            <option value="">All Categories</option>
            {stats.categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="rounded-md border bg-background px-3 py-1.5 text-sm">
            <option value="">All Stock</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
          <button onClick={() => { setBrand(""); setCategory(""); setStatus(""); setAvailability(""); }} className="text-sm text-primary hover:underline">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Brand</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Affiliate</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : !data?.products.length ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No products found.</td></tr>
              ) : (
                data.products.map((p) => <ProductRow key={p.id} product={p} onUpdate={load} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {data.page} of {data.total_pages} ({data.total} total)</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40">
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))} disabled={page >= data.total_pages} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product: p, onUpdate }: { product: AdminProduct; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const toggleAffiliate = async () => {
    await adminApi.updateProduct(p.id, { is_affiliate_enabled: !p.is_affiliate_enabled });
    onUpdate();
  };

  return (
    <>
      <tr className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {p.image && (
              <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover bg-muted" />
            )}
            <div>
              <p className="font-medium text-foreground line-clamp-1">{p.name}</p>
              {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-muted-foreground">{p.brand || "—"}</td>
        <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
        <td className="px-4 py-3">
          <div>
            {p.discount_price ? (
              <>
                <span className="font-medium text-foreground">₹{p.discount_price}</span>
                <span className="ml-1 text-xs text-muted-foreground line-through">₹{p.price}</span>
              </>
            ) : (
              <span className="font-medium text-foreground">₹{p.price || "—"}</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant={p.status === "ACTIVE" ? "success" : "muted"}>{p.status}</Badge>
        </td>
        <td className="px-4 py-3">
          {p.availability
            ? <Badge variant="success">In Stock</Badge>
            : <Badge variant="destructive">Out of Stock</Badge>
          }
        </td>
        <td className="px-4 py-3">
          {p.is_affiliate_enabled
            ? <Badge variant="default">Enabled</Badge>
            : <Badge variant="muted">Disabled</Badge>
          }
        </td>
        <td className="px-4 py-3 text-right">
          <a href={p.product_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="View on store">
            <ExternalLink size={15} />
          </a>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b last:border-0 bg-muted/20">
          <td colSpan={8} className="px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Rating</p>
                <p className="text-foreground">{p.rating ? `${p.rating} / 5` : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
                <p className="text-foreground">{p.tags.length ? p.tags.join(", ") : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Last Synced</p>
                <p className="text-foreground">{p.synced_at ? new Date(p.synced_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Affiliate</p>
                <button onClick={(e) => { e.stopPropagation(); toggleAffiliate(); }} className="text-sm text-primary hover:underline">
                  {p.is_affiliate_enabled ? "Disable Affiliate" : "Enable Affiliate"}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
