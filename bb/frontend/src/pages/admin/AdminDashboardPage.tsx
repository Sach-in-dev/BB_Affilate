import { Link } from "react-router-dom";
import {
  Users,
  Coins,
  Megaphone,
  Package,
  UsersRound,
  Image,
  LinkIcon,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const modules = [
  { label: "Users & Roles", icon: Users, href: "/admin/users", perm: "manage_users", desc: "Manage admin users, roles and permissions." },
  { label: "Commissions", icon: Coins, href: "/admin/commissions", perm: "manage_commissions", desc: "Brand, product, campaign & creator rates." },
  { label: "Campaigns", icon: Megaphone, href: "/admin/campaigns", perm: "manage_campaigns", desc: "Create and track influencer campaigns." },
  { label: "Products", icon: Package, href: "/admin/products", perm: "manage_products", desc: "Organise the promotable catalog." },
  { label: "Creators", icon: UsersRound, href: "/admin/creators", perm: "manage_creators", desc: "Search, filter and onboard creators." },
  { label: "Banners", icon: Image, href: "/admin/banners", perm: "manage_banners", desc: "Manage promotional banner slots." },
  { label: "Links", icon: LinkIcon, href: "/admin/links", perm: "manage_links", desc: "Tracking links and landing pages." },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics", perm: "view_analytics", desc: "Clicks, conversions and earnings." },
];

export default function AdminDashboardPage() {
  const { user, hasPermission } = useAuth();
  const visible = modules.filter((m) => hasPermission(m.perm));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Welcome back, {user?.first_name}
        </h2>
        <p className="mt-1 text-muted-foreground">
          Manage the BeautyBarn affiliate programme from here. Your role is{" "}
          <span className="font-medium capitalize text-foreground">
            {user?.role_name?.replace("_", " ")}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((m) => (
          <Link
            key={m.href}
            to={m.href}
            className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <m.icon size={18} />
              </div>
              <ArrowRight
                size={16}
                className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </div>
            <h3 className="mt-4 font-semibold">{m.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
