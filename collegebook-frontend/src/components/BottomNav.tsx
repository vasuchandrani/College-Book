import { useState, useEffect } from "react";
import { Newspaper, Compass, Users, UserCircle, FolderGit2 } from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getCollabBadgeCount } from "@/lib/api";

const navItems = [
  { title: "Feed", url: "/feed", icon: Newspaper },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Collab", url: "/collab", icon: Users },
  { title: "My Collab", url: "/my-collaboration", icon: FolderGit2 },
  { title: "Profile", url: "/profile", icon: UserCircle },
];

export function BottomNav() {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const fetchCount = async (forceRefresh = false) => {
    const token = localStorage.getItem("cb_token");
    if (!token) return;
    try {
      const count = await getCollabBadgeCount(forceRefresh);
      setPendingCount(count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCount(false);

    const handleUpdate = () => fetchCount(true);
    window.addEventListener("cb_collab_updated", handleUpdate);
    window.addEventListener("cb_room_read", handleUpdate);
    const interval = setInterval(() => fetchCount(true), 60000);

    return () => {
      window.removeEventListener("cb_collab_updated", handleUpdate);
      window.removeEventListener("cb_room_read", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.url ||
            (item.url === "/collab" && (location.pathname === "/collab" || location.pathname.startsWith("/collab/"))) ||
            (item.url === "/my-collaboration" && (
              location.pathname === "/my-collaboration" ||
              location.pathname.startsWith("/my-collaboration/") ||
              location.pathname === "/my-collab" ||
              location.pathname.startsWith("/my-collab/")
            )) ||
            (item.url !== "/collab" && item.url !== "/my-collaboration" && item.url !== "/" && location.pathname.startsWith(item.url));
          const isCollab = item.url === "/my-collaboration";
          const showDot = isCollab && pendingCount > 0;

          return (
            <RouterNavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {showDot && (
                  <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-primary ring-1.5 ring-background" />
                )}
              </div>
              <span>{item.title}</span>
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
}
