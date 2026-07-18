import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2, LinkIcon } from "lucide-react";
import { publicApi, type ResolvedLink } from "@/lib/public-api";
import BundleLandingPage from "./BundleLandingPage";

const LOGO =
  "https://blog.beautybarn.in/wp-content/uploads/2025/11/Beauty-Barn_Logo_RGB_Primary_Cherry_Wine-scaled.png";

/**
 * Entry point for every shared affiliate link (/r/:code).
 *
 * Resolving records the click server-side, then:
 *  - single product → redirect straight to the BeautyBarn product page
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <img src={LOGO} alt="Beauty Barn" className="h-8 w-auto object-contain" />
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <LinkIcon size={22} />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-foreground">Link not available</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
        <a
          href="https://beautybarn.in"
          className="mt-6 rounded-full bg-[#962E3C] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#7f2632]"
        >
          Shop BeautyBarn
        </a>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <img src={LOGO} alt="Beauty Barn" className="h-8 w-auto object-contain" />
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Taking you to the products…</p>
      </div>
    );
  }

  return <BundleLandingPage data={data} source={source} />;
}
