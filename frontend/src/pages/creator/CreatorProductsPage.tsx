import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useSelection } from "@/contexts/SelectionContext";
import { creatorApi, type Product } from "@/lib/creator-api";

export default function CreatorProductsPage() {
  const { isSelected, toggle } = useSelection();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    creatorApi.filters().then((f) => {
      setBrands(f.brands);
      setCategories(f.categories);
    });
  }, []);

  // Debounce search input.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await creatorApi.listProducts({
      search: debounced || undefined,
      brand: brand || undefined,
      category: category || undefined,
      page,
      page_size: 12,
    });
    setProducts(res.items);
    setPages(res.pages);
    setTotal(res.total);
    setLoading(false);
  }, [debounced, brand, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 when filters change.
  useEffect(() => {
    setPage(1);
  }, [debounced, brand, category]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Products</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse the 26 Ritual catalog. Select one product for a direct link, or several for a bundle.
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands, SKU…"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center text-center text-muted-foreground">
          <p>No products match your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{total} products</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                selected={isSelected(p.id)}
                onToggle={toggle}
              />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <span className="px-2 text-sm text-muted-foreground">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
