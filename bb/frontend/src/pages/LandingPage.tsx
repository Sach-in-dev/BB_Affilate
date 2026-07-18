import { Link } from "react-router-dom";
import {
  Store,
  LinkIcon,
  Coins,
  BarChart3,
  ArrowRight,
  Sparkles,
  Users,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const LOGO =
  "https://blog.beautybarn.in/wp-content/uploads/2025/11/Beauty-Barn_Logo_RGB_Primary_Cherry_Wine-scaled.png";

const features = [
  {
    icon: Store,
    title: "Creator Storefronts",
    desc: "Every creator gets a personalized shop to curate and share their favourite BeautyBarn products.",
  },
  {
    icon: LinkIcon,
    title: "Smart Link Tracking",
    desc: "Single and multi-product tracking links with per-product attribution, built for Instagram comment-to-DM.",
  },
  {
    icon: Coins,
    title: "Commission Engine",
    desc: "Brand, product, campaign and creator-level commission control from one centralised, conflict-free engine.",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Track clicks, conversions, GMV and creator earnings in real time across every campaign.",
  },
  {
    icon: Megaphone,
    title: "Campaign Management",
    desc: "Run end-to-end influencer campaigns — briefs, creator assignment, budgets and performance drilldowns.",
  },
  {
    icon: Users,
    title: "Creator Management",
    desc: "Search, filter and onboard creators by niche and region, then assign them to the right campaigns.",
  },
];

const steps = [
  { n: "01", title: "Join as a creator", desc: "Sign up and get approved to start promoting BeautyBarn." },
  { n: "02", title: "Build your storefront", desc: "Curate products and generate your tracking links." },
  { n: "03", title: "Share & convert", desc: "Post links across social — every click and order is tracked." },
  { n: "04", title: "Earn commissions", desc: "Watch earnings grow with transparent, automated payouts." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="Beauty Barn" className="h-8 w-auto object-contain" />
            <span className="hidden text-sm font-semibold sm:inline">Affiliate Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-[#962E3C] text-white hover:bg-[#7f2632]"
            >
              <Link to="/signup">Join as Creator</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6 md:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles size={13} className="text-primary" />
            BeautyBarn Creator Commerce
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Turn your influence into{" "}
            <span className="text-[#962E3C]">income</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            The BeautyBarn Affiliate Platform helps creators share products they love and earn
            commissions — while brands run campaigns, track performance, and grow with data.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#962E3C] px-8 text-white hover:bg-[#7f2632]"
            >
              <Link to="/signup" className="flex items-center gap-2">
                Get started <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link to="/login">Admin & Creator Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Everything you need to run affiliates</h2>
          <p className="mt-3 text-muted-foreground">
            One platform for creators and the BeautyBarn team — from link tracking to commission control.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Four simple steps from sign-up to payout.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <span className="text-4xl font-bold text-primary/20">{s.n}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-[#962E3C] px-6 py-14 text-center text-white md:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <h2 className="text-2xl font-bold md:text-3xl">Ready to grow with BeautyBarn?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Join the creator programme today, or log in to the admin portal to manage the platform.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 text-[#962E3C] hover:bg-white/90"
            >
              <Link to="/signup">Join as Creator</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="Beauty Barn" className="h-6 w-auto object-contain" />
            <span>Affiliate Platform</span>
          </div>
          <div className="flex items-center">
            <span>&copy; {new Date().getFullYear()} BeautyBarn</span>
            <span className="mx-2 text-yellow-500">⚡</span>
            <span>by</span>
            <a
              href="https://superlabs.co"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              SuperLabs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
