import { Bell, ChevronDown, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <>
      <h1 className="text-sm font-semibold text-foreground">
        Dashboard
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />

        <button className="relative rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors hidden md:block">
          <Bell size={18} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-500" />
        </button>

        <div className="h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg px-2 py-1 bg-accent hover:bg-accent/80 outline-none transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold border border-border">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-medium text-foreground">
                  {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  {user?.role_name ? user.role_name.replace("_", " ") : user?.user_type || "user"}
                </p>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <User size={16} />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              onClick={logout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
