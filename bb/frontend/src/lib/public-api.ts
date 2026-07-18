import axios from "axios";
import type { Product } from "@/lib/creator-api";

/** Unauthenticated client — customer traffic carries no token. */
const publicClient = axios.create({ baseURL: "/api" });

export interface ResolvedLink {
  code: string;
  link_type: "single" | "bundle";
  title: string | null;
  products: Product[];
  creator: {
    name: string;
    handle: string | null;
    bio: string | null;
    avatar_url: string | null;
    instagram: string | null;
    youtube: string | null;
  };
  redirect_url: string | null;
}

export const publicApi = {
  resolve: (code: string, source?: string) =>
    publicClient
      .get(`/public/links/${code}`, { params: source ? { source } : {} })
      .then((r) => r.data.data as ResolvedLink),

  /** Server records the click, then 302s to the BeautyBarn product page. */
  productRedirectUrl: (code: string, productId: string, source?: string) =>
    `/api/public/links/${code}/go/${productId}${source ? `?source=${encodeURIComponent(source)}` : ""}`,
};
