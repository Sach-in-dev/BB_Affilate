import { Outlet } from "react-router-dom";
import { CreatorSidebar } from "./CreatorSidebar";
import Header from "./Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SelectionProvider } from "@/contexts/SelectionContext";
import { SelectionBar } from "@/components/SelectionBar";

export default function CreatorLayout() {
  return (
    <SelectionProvider>
      <SidebarProvider>
        <CreatorSidebar />
        <main className="relative flex min-h-screen flex-1 flex-col min-w-0 overflow-x-hidden">
          <header className="flex h-16 items-center border-b px-4 gap-4">
            <SidebarTrigger />
            <Header />
          </header>
          <div className="flex-1 p-4 md:p-6 min-w-0 w-full overflow-x-hidden pb-28">
            <Outlet />
          </div>
          <SelectionBar />
        </main>
      </SidebarProvider>
    </SelectionProvider>
  );
}
