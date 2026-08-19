import { BookOpen } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { Outlet, Navigate, useLocation } from "react-router-dom";

const AppLayout = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;
  const location = useLocation();

  // If student is not authenticated or token expired/removed, redirect to landing page
  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="md:hidden sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 backdrop-blur px-3">
            <a href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-hero flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-base font-bold">CollegeBook</span>
            </a>
          </header>
          <main className="flex-1 overflow-auto min-w-0 pb-16 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
      {/* Bottom navigation for mobile */}
      <BottomNav />
    </SidebarProvider>
  );
};

export default AppLayout;
