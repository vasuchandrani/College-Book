import { BookOpen, BadgeCheck, LogOut } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { Outlet, Navigate, useLocation, Link, useNavigate } from "react-router-dom";

const AppLayout = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_refresh_token");
    localStorage.removeItem("cb_user");
    localStorage.removeItem("cb_profile");
    navigate("/");
  };

  // If student is not authenticated or token expired/removed, redirect to landing page
  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const isMyCon = location.pathname === "/mycon";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-3">
            <a href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-hero flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-base font-bold">CollegeBook</span>
            </a>

            <div className="flex items-center gap-2">
              <Link
                to="/mycon"
                className={`flex items-center justify-center gap-1.5 px-3 h-8 rounded-full transition-all text-xs font-semibold ${
                  isMyCon
                    ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                    : "bg-muted hover:bg-muted/80 text-foreground border border-border/40"
                }`}
                aria-label="myCon"
              >
                <BadgeCheck className={`h-4 w-4 ${isMyCon ? "text-primary-foreground" : "text-primary"}`} />
                <span>myCon</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all border border-border/40"
                aria-label="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
          <main className="flex-1 min-w-0 pb-16 md:pb-0">
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
