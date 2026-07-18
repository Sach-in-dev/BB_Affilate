import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, LinkIcon, BarChart3, UserRound } from "lucide-react";
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

const LOGO =
  "https://blog.beautybarn.in/wp-content/uploads/2025/11/Beauty-Barn_Logo_RGB_Primary_Cherry_Wine-scaled.png";

const menuItems = [
  { label: "Home", icon: Home, href: "/dashboard" },
  { label: "Products", icon: ShoppingBag, href: "/dashboard/products" },
  { label: "My Affiliate Links", icon: LinkIcon, href: "/dashboard/links" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Profile", icon: UserRound, href: "/dashboard/profile" },
];

export function CreatorSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <div className="flex flex-col gap-1 px-3 group-data-[collapsible=icon]:hidden">
          <span className="text-lg font-bold tracking-tight">Creator Studio</span>
          <img src={LOGO} alt="Beauty Barn" className="mt-1 h-8 w-auto object-contain" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs tracking-widest">MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? location.pathname === "/dashboard"
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
