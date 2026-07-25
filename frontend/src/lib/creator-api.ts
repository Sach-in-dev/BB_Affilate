import { api } from "@/lib/axios";

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  discount_price: number | null;
  image: string | null;
  product_url: string;
  sku: string | null;
  status: string;
  availability: boolean;
  tags: string[];
  rating: number | null;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface LinkItem {
  product: Product;
  clicks: number;
}

export interface AffiliateLink {
  id: string;
  code: string;
  link_type: "single" | "bundle";
  title: string | null;
  url: string;
  total_clicks: number;
  total_orders: number;
  total_commission: number;
  items: LinkItem[];
  created_at: string | null;
}

export interface DashboardStats {
  total_clicks: number;
  total_orders: number;
  total_commission: number;
  conversion_rate: number;
  total_links: number;
  top_products: { product: Product; clicks: number }[];
  recent_activity: { code: string; product_name: string | null; source: string | null; clicked_at: string | null }[];
  clicks_series: { date: string; clicks: number }[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  destination_url: string | null;
  slot: string;
  sort_order: number;
  is_active: boolean;
}

export interface CreatorProfile {
  id: string;
  first_name: string;
  last_name: string;
  handle: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  youtube: string | null;
  niche: string | null;
  city: string | null;
  state: string | null;
}

export const creatorApi = {
  listProducts: (params: { search?: string; brand?: string; category?: string; page?: number; page_size?: number }) =>
    api.get("/products", { params }).then((r) => r.data.data as ProductPage),
  filters: () => api.get("/products/filters").then((r) => r.data.data as { brands: string[]; categories: string[] }),
  trending: (limit = 6) => api.get("/products/trending", { params: { limit } }).then((r) => r.data.data as Product[]),

  generateLink: (product_ids: string[], title?: string) =>
    api.post("/creator/links", { product_ids, title }).then((r) => r.data.data as AffiliateLink),
  myLinks: () => api.get("/creator/links").then((r) => r.data.data as AffiliateLink[]),
  deleteLink: (id: string) => api.delete(`/creator/links/${id}`).then((r) => r.data.data),

  stats: () => api.get("/creator/stats").then((r) => r.data.data as DashboardStats),
  banners: () => api.get("/creator/banners").then((r) => r.data.data as Banner[]),
  getProfile: () => api.get("/creator/profile").then((r) => r.data.data as CreatorProfile),
  updateProfile: (payload: Partial<CreatorProfile>) =>
    api.put("/creator/profile", payload).then((r) => r.data.data as CreatorProfile),
};

export function formatPrice(paise: number | null | undefined): string {
  if (paise == null) return "—";
  return "₹" + paise.toLocaleString("en-IN");
}
