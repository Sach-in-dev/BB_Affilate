import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2, LinkIcon } from "lucide-react";
import { publicApi, type ResolvedLink } from "@/lib/public-api";
import BundleLandingPage from "./BundleLandingPage";

/**
 * Entry point for every shared affiliate link (/r/:code).
 *
 * Resolving records the click server-side, then:
 *  - single product → redirect straight to the product page
 *  - bundle         → render the branded multi-product landing page
 */
export default function ResolveLinkPage() {
  const { code } = useParams<{ code: string }>();
  const [params] = useSearchParams();
  const source = params.get("source") ?? undefined;

  const [data, setData] = useState<ResolvedLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  // StrictMode double-invokes effects in dev; guard so we only count one click.
  const resolved = useRef(false);

  useEffect(() => {
    if (!code || resolved.current) return;
    resolved.current = true;

    publicApi
      .resolve(code, source)
      .then((res) => {
        if (res.link_type === "single" && res.redirect_url) {
          window.location.replace(res.redirect_url);
          return;
        }
        setData(res);
      })
      .catch((err) =>
        setError(err?.response?.data?.detail || "This link is invalid or has expired")
      );
  }, [code, source]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-cyan-400">26</span>
          <span className="text-white">ritual</span>
        </span>
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-400">
          <LinkIcon size={22} />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-white">Link not available</h1>
        <p className="mt-1 max-w-sm text-sm text-neutral-400">{error}</p>
        <a
          href="https://beautybarn.in"
          className="mt-6 rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-medium text-neutral-950 hover:bg-cyan-300"
        >
          Shop 26 Ritual
        </a>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-cyan-400">26</span>
          <span className="text-white">ritual</span>
        </span>
        <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        <p className="text-sm text-neutral-400">Taking you to the products…</p>
      </div>
    );
  }

  return <BundleLandingPage data={data} source={source} />;
}
