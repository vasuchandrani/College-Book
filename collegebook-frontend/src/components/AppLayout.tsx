import { BookOpen } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar — exposes the sidebar trigger on small screens */}
          <header className="md:hidden sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 backdrop-blur px-3">
            <SidebarTrigger className="h-9 w-9" />
            <a href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-hero flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-base font-bold">CollegeBook</span>
            </a>
          </header>
          <main className="flex-1 overflow-auto min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
