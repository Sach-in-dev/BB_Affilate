import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Coins,
  Megaphone,
  Package,
  UsersRound,
  ShieldCheck,
  Image,
  LinkIcon,
  BarChart3,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// perm: null means always visible to any admin.
const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin", perm: null },
  { label: "Admin Users", icon: Users, href: "/admin/users", perm: "manage_users" },
  { label: "Roles", icon: ShieldCheck, href: "/admin/roles", perm: "manage_users" },
  { label: "Commissions", icon: Coins, href: "/admin/commissions", perm: "manage_commissions" },
  { label: "Campaigns", icon: Megaphone, href: "/admin/campaigns", perm: "manage_campaigns" },
  { label: "Products", icon: Package, href: "/admin/products", perm: "manage_products" },
  { label: "Creators", icon: UsersRound, href: "/admin/creators", perm: "manage_creators" },
  { label: "Banners", icon: Image, href: "/admin/banners", perm: "manage_banners" },
  { label: "Links", icon: LinkIcon, href: "/admin/links", perm: "manage_links" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics", perm: "view_analytics" },
];

export function AdminSidebar() {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const visible = menuItems.filter((i) => !i.perm || hasPermission(i.perm));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <div className="flex flex-col gap-1 px-3 group-data-[collapsible=icon]:hidden">
          <span className="text-lg font-bold tracking-tight">Admin Portal</span>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">26</span>
            <span className="text-white">ritual</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs tracking-widest">
            MANAGEMENT
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visible.map((item) => {
                const active =
                  item.href === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={`relative ${active ? "bg-muted font-medium" : ""}`}
                    >
                      <Link to={item.href}>
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary" />
                        )}
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
