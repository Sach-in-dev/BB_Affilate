import "./LandingPage.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Target,
  Package,
  Image,
  ClipboardList,
  Link2,
  Wallet,
  Plus,
  X,
  ChevronDown,
  MousePointerClick,
  BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const LOGO =
  "https://blog.beautybarn.in/wp-content/uploads/2025/11/Beauty-Barn_Logo_RGB_Primary_Cherry_Wine-scaled.png";

/* ── Brand images for the carousel ── */
const brands = [
  { name: "COSRX", img: "/images/brands/cosrx.png" },
  { name: "Beauty of Joseon", img: "/images/brands/boj.png" },
  { name: "Axis-Y", img: "/images/brands/axisy.png" },
  { name: "Isntree", img: "/images/brands/isntree.png" },
  { name: "Klairs", img: "/images/brands/klairs.png" },
  { name: "Some By Mi", img: "/images/brands/somebymi.png" },
  { name: "Laneige", img: "/images/brands/laneige.png" },
  { name: "Innisfree", img: "/images/brands/innisfree.png" },
];

/* ── Stats data ── */
const stats = [
  { value: "500+", label: "Products to Promote" },
  { value: "50+", label: "K-Beauty Brands" },
  { value: "Up to 10%", label: "Commission Rates" },
];

/* ── How it works steps ── */
const steps = [
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
    desc: "Browse products, generate unique tracking links, and share them with your audience on any platform.",
  },
  {
    icon: Wallet,
    step: "STEP 3",
    title: "Earn Commissions",
    desc: "Earn commissions on every sale made through your links. Track your performance in real-time.",
  },
];

/* ── Benefits data ── */
const benefits = [
  {
    icon: TrendingUp,
    title: "Competitive Commissions",
    desc: "Earn attractive commissions on every sale, with higher rates during special campaigns and for top performers.",
  },
  {
    icon: Target,
    title: "Exclusive Campaigns",
    desc: "Get invited to brand campaigns with boosted commission rates, early product access, and dedicated support.",
  },
  {
    icon: Package,
    title: "Multi-Product Bundles",
    desc: 'Promote multiple products with a single link. Perfect for "my routine" posts and haul videos.',
  },
  {
    icon: Image,
    title: "Ready-Made Creatives",
    desc: "Grab branded banners and creatives for trending products so you always have fresh content to share.",
  },
];

/* ── FAQ data ── */
const faqs = [
  {
    q: "Who can join the BeautyBarn Affiliate Program?",
    a: "Anyone with a social media presence focused on beauty, skincare, or K-beauty can apply. We welcome influencers, bloggers, YouTubers, and content creators of all sizes.",
  },
  {
    q: "How much can I earn?",
    a: "Commission rates vary by product and campaign, but you can earn up to 10% on every sale. Top performers may receive bonus rates during special promotions.",
  },
  {
    q: "How do I track my performance?",
    a: "Your creator dashboard gives you real-time analytics including clicks, conversions, earnings, and more. You can monitor every link you share.",
  },
  {
    q: "What is the multi-product bundle link?",
    a: "You can create a single link that showcases multiple products — perfect for routines, haul videos, or curated collections your audience will love.",
  },
  {
    q: "What is the Comment-to-DM feature?",
    a: "When a follower comments on your Instagram post, our system can automatically DM them your affiliate link. It's a seamless way to convert engagement into sales.",
  },
  {
    q: "When is the upgraded platform launching?",
    a: "We're actively building the upgraded platform. Join the waitlist to be notified as soon as we launch and get priority access to the new features.",
  },
];

/* ═══════════════════════════════════════════════════
   Component: LandingPage
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Scroll-based nav background */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Intersection observer for scroll animations */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("bb-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".bb-animate").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      {/* ── Sticky Navbar ── */}
      <nav className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-nav__inner">
          <a href="https://beautybarn.in" target="_blank" rel="noopener noreferrer" className="landing-nav__logo">
            <img src={LOGO} alt="Beauty Barn" />
          </a>

          {/* Desktop Nav Links */}
          <div className="landing-nav__links">
            <a href="#how-it-works" className="landing-nav__link">How It Works</a>
            <a href="#benefits" className="landing-nav__link">Benefits</a>
            <a href="#faq" className="landing-nav__link">FAQ</a>
            <ThemeToggle />
            <Link to="/login" className="landing-nav__link">Log in</Link>
            <Link to="/signup" className="landing-nav__cta">
              Join as Creator
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="landing-nav__hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="landing-nav__mobile-menu">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Link to="/signup" className="landing-nav__cta" onClick={() => setMobileMenuOpen(false)}>
              Join as Creator
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="landing-hero">
        {/* Decorative blobs */}
        <div className="landing-hero__blob landing-hero__blob--1" />
        <div className="landing-hero__blob landing-hero__blob--2" />
        <div className="landing-hero__blob landing-hero__blob--3" />

        <div className="landing-hero__inner">
          <div className="landing-hero__content bb-animate">
            <span className="landing-hero__badge">
              <span className="landing-hero__badge-dot" />
              AFFILIATE PROGRAM — JOIN NOW
            </span>

            <h1 className="landing-hero__title">
              Turn Your Love for{" "}
              <span className="landing-hero__title-accent">K-Beauty</span>{" "}
              Into Earnings
            </h1>

            <p className="landing-hero__subtitle">
              Join BeautyBarn's affiliate program and earn commissions by sharing
              the K-beauty products you already love with your audience.
            </p>

            <div className="landing-hero__actions">
              <Link to="/signup" className="landing-btn landing-btn--primary">
                Join as Creator <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="landing-btn landing-btn--secondary">
                Learn More
              </a>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="landing-hero__visual bb-animate">
            <div className="landing-hero__phone-wrapper">
              {/* Concentric circles */}
              <div className="landing-hero__circle landing-hero__circle--outer" />
              <div className="landing-hero__circle landing-hero__circle--inner" />

              {/* Phone frame */}
              <div className="landing-hero__phone">
                <div className="landing-hero__phone-notch" />
                <div className="landing-hero__phone-content">
                  <div className="landing-hero__phone-header">
                    <div className="landing-hero__phone-avatar" />
                    <div>
                      <div className="landing-hero__phone-handle">yourhandle</div>
                      <div className="landing-hero__phone-label">Sponsored</div>
                    </div>
                  </div>
                  <div className="landing-hero__phone-image">
                    <img
                      src="/images/hero_product.png"
                      alt="K-beauty product"
                    />
                    <div className="landing-hero__phone-tap">🛍️ Tap to shop</div>
                  </div>
                  <div className="landing-hero__phone-actions">
                    <span>♡</span> <span>💬</span> <span>✈️</span>
                  </div>
                  <div className="landing-hero__phone-caption">
                    <strong>yourhandle</strong> obsessed with this serum ✨
                    <br />
                    <span>link in bio</span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="landing-hero__float-badge landing-hero__float-badge--commission">
                <TrendingUp size={14} /> +₹450 Commission Earned
              </div>
              <div className="landing-hero__float-badge landing-hero__float-badge--link">
                <Link2 size={14} /> beautybarn.in/aff/you
              </div>
              <div className="landing-hero__float-badge landing-hero__float-badge--clicks">
                <MousePointerClick size={14} /> Clicks <span className="landing-hero__badge-arrow">↑</span>
              </div>
              <div className="landing-hero__float-badge landing-hero__float-badge--conversion">
                <BarChart3 size={14} /> Conversion <span className="landing-hero__badge-arrow">↑</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="landing-stats bb-animate">
          {stats.map((s, i) => (
            <div key={i} className="landing-stats__item">
              <span className="landing-stats__value">{s.value}</span>
              <span className="landing-stats__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brands Carousel ── */}
      <section className="landing-brands bb-animate">
        <p className="landing-brands__heading">
          PROMOTE PRODUCTS FROM BRANDS YOUR AUDIENCE ALREADY LOVES
        </p>
        <BrandsCarousel />
      </section>

      {/* ── How It Works ── */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-section-header bb-animate">
          <span className="landing-section-label">HOW IT WORKS</span>
          <h2 className="landing-section-title">Start Earning in 3 Simple Steps</h2>
          <p className="landing-section-desc">
            Our streamlined process gets you from sign-up to earning commissions quickly and easily.
          </p>
        </div>

        <div className="landing-how__steps bb-animate">
          {/* Connecting line */}
          <div className="landing-how__line" />

          {steps.map((s, i) => (
            <div key={i} className="landing-how__step">
              <div className="landing-how__icon-wrap">
                <div className="landing-how__icon-bg">
                  <s.icon size={24} />
                </div>
              </div>
              {i < steps.length - 1 && <div className="landing-how__connector-dot" />}
              <span className="landing-how__step-label">{s.step}</span>
              <h3 className="landing-how__step-title">{s.title}</h3>
              <p className="landing-how__step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="landing-benefits" id="benefits">
        <div className="landing-section-header bb-animate">
          <span className="landing-section-label">WHY JOIN</span>
          <h2 className="landing-section-title">Everything You Need to Succeed</h2>
          <p className="landing-section-desc">
            We provide the tools, products, and support to help you monetise your K-beauty content.
          </p>
        </div>

        <div className="landing-benefits__grid bb-animate">
          {benefits.map((b, i) => (
            <div key={i} className="landing-benefits__card">
              <div className="landing-benefits__icon">
                <b.icon size={22} />
              </div>
              <h3 className="landing-benefits__card-title">{b.title}</h3>
              <p className="landing-benefits__card-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="landing-faq" id="faq">
        <div className="landing-section-header bb-animate">
          <span className="landing-section-label">FAQ</span>
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
          <p className="landing-section-desc">Got questions? We've got answers.</p>
        </div>

        <div className="landing-faq__list bb-animate">
          {faqs.map((f, i) => (
            <div
              key={i}
              className={`landing-faq__item ${openFaq === i ? "landing-faq__item--open" : ""}`}
            >
              <button
                className="landing-faq__question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{f.q}</span>
                {openFaq === i ? (
                  <X size={18} className="landing-faq__icon" />
                ) : (
                  <Plus size={18} className="landing-faq__icon" />
                )}
              </button>
              <div className="landing-faq__answer">
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-cta bb-animate">
        <div className="landing-cta__inner">
          <div className="landing-cta__blob" />
          <h2 className="landing-cta__title">Ready to Start Earning?</h2>
          <p className="landing-cta__desc">
            Join the BeautyBarn affiliate programme today and start turning your content into commissions.
          </p>
          <div className="landing-cta__actions">
            <Link to="/signup" className="landing-btn landing-btn--white">
              Join as Creator
            </Link>
            <Link to="/login" className="landing-btn landing-btn--outline-white">
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-footer__logo-box">
              <img src={LOGO} alt="Beauty Barn" />
            </div>
            <p className="landing-footer__tagline">
              Your #1 K-Beauty Destination. Discover authentic Korean beauty products and join our growing community of beauty creators.
            </p>
          </div>

          <div className="landing-footer__col">
            <h4>QUICK LINKS</h4>
            <a href="https://beautybarn.in" target="_blank" rel="noopener noreferrer">Shop BeautyBarn</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#benefits">Benefits</a>
            <Link to="/signup">Join as Creator</Link>
          </div>

          <div className="landing-footer__col">
            <h4>SUPPORT</h4>
            <a href="#faq">FAQ</a>
            <a href="mailto:support@beautybarn.in">Contact Us</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <span>&copy; {new Date().getFullYear()} BeautyBarn. All rights reserved.</span>
          <span className="landing-footer__powered">
            <span className="text-yellow-400">⚡</span> Powered by{" "}
            <a href="https://superlabs.co" target="_blank" rel="noopener noreferrer">
              SuperLabs
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Sub-Component: Brands Carousel (infinite scroll)
   ═══════════════════════════════════════════════════ */
function BrandsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animId: number;
    let pos = 0;
    const speed = 0.5;

    const animate = () => {
      pos -= speed;
      // Reset when we've scrolled past half (since content is duplicated)
      if (Math.abs(pos) >= track.scrollWidth / 2) {
        pos = 0;
      }
      track.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const allBrands = [...brands, ...brands]; // duplicate for seamless loop

  return (
    <div className="landing-brands__carousel">
      <div className="landing-brands__track" ref={trackRef}>
        {allBrands.map((b, i) => (
          <div key={i} className="landing-brands__card">
            <img src={b.img} alt={b.name} loading="lazy" />
            <span>{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
