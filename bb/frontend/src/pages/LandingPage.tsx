import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  Link2,
  Wallet,
  TrendingUp,
  Target,
  Package,
  Sparkles,
  LayoutGrid,
  MessageCircle,
} from "lucide-react";

import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { HeroBadge } from "@/components/landing/SectionBadge";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { StepTimeline, type Step } from "@/components/landing/StepTimeline";
import { FaqAccordion, type FaqItem } from "@/components/landing/FaqAccordion";
import { HeroDashboardMock, ToolkitDashboardMock } from "@/components/landing/DashboardMock";
import { AutomationDemo } from "@/components/landing/AutomationDemo";

const steps: Step[] = [
  {
    icon: ClipboardList,
    step: "STEP 1",
    title: "Sign Up & Get Approved",
    desc: "Fill out our simple application form. Our team reviews and approves your profile within 48 hours.",
  },
  {
    icon: Link2,
    step: "STEP 2",
    title: "Share Your Links",
    desc: "Grab your unique tracking link and share it with your audience on any platform.",
  },
  {
    icon: Wallet,
    step: "STEP 3",
    title: "Earn Commissions",
    desc: "Earn commissions on every sale made through your links. Track your performance in real-time.",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Industry-Leading Payouts",
    description: "Keep up to 90% of everything you earn, with boosted rates during special campaigns and for top performers.",
  },
  {
    icon: Target,
    title: "Exclusive Campaigns",
    description: "Get invited to campaigns with higher commission rates, early access, and dedicated support.",
  },
  {
    icon: Package,
    title: "Multi-Product Bundles",
    description: "Promote multiple products with a single link. Perfect for roundups and haul-style content.",
  },
  {
    icon: Sparkles,
    title: "Ready-Made Creatives",
    description: "Grab branded banners and creatives for trending offers so you always have fresh content to share.",
  },
];

const toolkitFeatures = [
  {
    icon: LayoutGrid,
    title: "See Your Earnings in Real Time",
    description: "Log in anytime to see your clicks, orders, and commissions — no waiting on anyone to send you a report.",
  },
  {
    icon: Link2,
    title: "One Link, Multiple Products",
    description: "Tag several products in a single link, perfect for roundups or haul-style content.",
    linkChip: "26ritual.com/s/my-picks",
  },
  {
    icon: Sparkles,
    title: "Your Own Branded Page",
    description: "Followers who click your link land on a beautiful branded page showcasing everything you recommended.",
  },
  {
    icon: MessageCircle,
    title: "Turn Comments Into Sales",
    description: "Set a keyword on your post and we'll automatically DM your link to anyone who comments it.",
  },
];

const faqs: FaqItem[] = [
  {
    q: "Who can join the 26ritual Affiliate Program?",
    a: "Anyone with an active social media presence who creates content in any niche can apply. We welcome creators of all sizes — from micro-influencers to established content creators.",
  },
  {
    q: "How much can I earn?",
    a: "You keep up to 90% of everything you earn, with rates going even higher during special campaigns. Top-performing and VIP creators can negotiate custom rates for even higher earnings.",
  },
  {
    q: "How do I track my performance?",
    a: "Once approved, you'll get access to a dedicated dashboard where you can track clicks, orders, commissions, and campaign performance in real-time.",
  },
  {
    q: "What is the multi-product bundle link?",
    a: 'You can select multiple products and generate a single link that leads to a branded landing page showing all your recommendations. Perfect for roundup or "haul" content.',
  },
  {
    q: "What is the Comment-to-DM feature?",
    a: "It's an automation tool that automatically sends your affiliate link via DM when a follower comments a specific keyword on your post. It makes converting engagement into sales effortless.",
  },
  {
    q: "When is the upgraded platform launching?",
    a: "We're actively building the upgraded platform. Join the waitlist to be notified as soon as we launch and get priority access to the new features.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 font-sans">
      <LandingNavbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 pt-28 pb-36 md:px-6 md:pt-36 md:pb-44">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <HeroBadge>26ritual Affiliate Program</HeroBadge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
            >
              Where Creators
              <br />
              Come to <span className="text-cyan-400">Earn.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mt-7 max-w-lg text-lg leading-relaxed text-neutral-400"
            >
              You've already built an audience. Now turn it into income — join 26ritual's
              affiliate program and earn real commissions sharing what you love.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
              >
                Start Earning Today <ArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/5"
              >
                Learn More
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-7 text-base text-neutral-400"
            >
              <span className="flex items-center gap-2">
                <LayoutGrid size={16} className="text-cyan-400" /> Real-Time Dashboard
              </span>
              <span className="flex items-center gap-2">
                <Link2 size={16} className="text-cyan-400" /> Multi-Product Links
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle size={16} className="text-cyan-400" /> Automated DMs
              </span>
            </motion.div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroDashboardMock
              title="Your Affiliate Dashboard"
              linkText="26ritual.com/r/you"
              rows={[
                { icon: LayoutGrid, label: "Real-time click & order tracking" },
                { icon: Link2, label: "Single & multi-product links" },
                { icon: Target, label: "Campaign-based commission rates" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="border-t border-white/10 px-4 py-24 md:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="How It Works"
            title="Start Earning in 3 Simple Steps"
            subtitle="Our streamlined process gets you from sign-up to earning commissions quickly and easily."
          />
          <StepTimeline steps={steps} />
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="border-t border-white/10 px-4 py-24 md:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Why Join"
            title={
              <>
                Everything You Need to <span className="text-cyan-400">Succeed</span>
              </>
            }
            subtitle="We provide the tools and support to help you monetise your content."
          />
          <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <FeatureCard key={b.title} {...b} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Creator Toolkit ── */}
      <section className="border-t border-white/10 px-4 py-24 md:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Your Creator Toolkit"
            title={
              <>
                Everything You Need, Right in <span className="text-cyan-400">Your Dashboard</span>
              </>
            }
            subtitle="Simple tools that help you share smarter and earn more — no extra apps, no hassle."
          />

          <div className="mt-12">
            <ToolkitDashboardMock
              title="Your Affiliate Dashboard"
              caption="Live tracking updates automatically as your links are clicked and orders come in."
              stats={[
                { label: "Clicks", value: "" },
                { label: "Orders", value: "" },
                { label: "Commission Earned", value: "", accent: true },
              ]}
            />
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
            {toolkitFeatures.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DM Automation ── */}
      <section id="automation" className="border-t border-white/10 px-4 py-24 md:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="DM Automation"
            title={
              <>
                Turn Comments Into <span className="text-cyan-400">Conversions</span>
              </>
            }
            subtitle="Set a keyword on your post — we handle the rest, automatically."
          />
          <AutomationDemo
            handle="yourhandle"
            commentKeyword="SHOP"
            fanAccount="fan_account"
            dmMessage="Hey! Thanks for the comment 💌 here's the link:"
            linkText="26ritual.com/r/you"
          />
        </div>
      </section>

      {/* ── CTA (replaces the reference's waitlist form) ── */}
      <section className="border-t border-white/10 px-4 py-24 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-8 py-16 text-center"
        >
          <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
            Get Started
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Turn Your Influence Into Income?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-neutral-400">
            Join the 26ritual creator programme today, or log in if you're already part of the
            family.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
            >
              Join as Creator <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-white/10 px-4 py-24 md:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            subtitle="Got questions? We've got answers."
          />
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
