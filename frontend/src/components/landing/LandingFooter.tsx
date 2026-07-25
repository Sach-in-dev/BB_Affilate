import { Link } from "react-router-dom";

const quickLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
  { label: "Automation", href: "#automation" },
  { label: "Join as Creator", href: "#waitlist" },
];

const supportLinks = [
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-white">26ritual</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
              A platform for creators to grow their audience and turn it into real, recurring income.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("#") ? (
                    <a href={l.href} className="text-sm text-neutral-400 hover:text-white">
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.href} className="text-sm text-neutral-400 hover:text-white">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Support
            </h4>
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-neutral-400 hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} 26ritual. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
