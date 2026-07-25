import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import Header from "./Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="relative flex min-h-screen flex-1 flex-col min-w-0 overflow-x-hidden">
        <header className="flex h-16 items-center border-b px-4 gap-4">
          <SidebarTrigger />
          <Header />
        </header>
        <div className="flex-1 p-4 md:p-6 min-w-0 w-full overflow-x-hidden">
          <Outlet />
        </div>
        <footer className="border-t border-border bg-background px-6 py-4">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="mx-1.5">-</span>
            <span className="font-semibold text-foreground">26 Ritual Affiliate</span>
            <span className="mx-2 text-yellow-500">⚡</span>
            <span>by</span>
            <a
              href="https://superlabs.co"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              SuperLabs
            </a>
          </div>
        </footer>
      </main>
    </SidebarProvider>
  );
}
