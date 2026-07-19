import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
  { label: "Automation", href: "#automation" },
  { label: "FAQ", href: "#faq" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-white/10 bg-neutral-950/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="text-2xl font-bold tracking-tight text-white">
          26ritual
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
          <Link to="/login" className="text-sm text-neutral-400 transition-colors hover:text-white">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
          >
            Join as Creator
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-white/10 bg-neutral-950 px-4 pb-4 md:hidden">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm text-neutral-300"
            >
              {l.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-neutral-300">
            Log in
          </Link>
          <Link
            to="/signup"
            onClick={() => setMobileOpen(false)}
            className="mt-2 rounded-full bg-white px-5 py-2.5 text-center text-sm font-semibold text-neutral-950"
          >
            Join as Creator
          </Link>
        </div>
      )}
    </nav>
  );
}
