import { Newspaper, Compass, Users, UserCircle, BadgeCheck } from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Feed", url: "/feed", icon: Newspaper },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Collab", url: "/collab", icon: Users },
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "myCon", url: "/mycon", icon: BadgeCheck },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.url ||
            (item.url !== "/" && location.pathname.startsWith(item.url));

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
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.title}</span>
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
}
