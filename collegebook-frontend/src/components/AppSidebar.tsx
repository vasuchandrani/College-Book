import { useState, useEffect } from "react";
import { Newspaper, Compass, Users, UserCircle, BadgeCheck, BookOpen, LogOut, PanelLeftClose, PanelLeft, FolderGit2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { getIncomingJoinRequests, getMyCreatedTeams, getTeamChatMessages } from "@/lib/api";
import { checkIsMessageUnread } from "@/lib/chatUnread";

const mainNav = [
  { title: "Campus Feed", url: "/feed", icon: Newspaper },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Collab Hub", url: "/collab", icon: Users },
  { title: "My Collaboration", url: "/my-collaboration", icon: FolderGit2 },
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "myCon Badges", url: "/mycon", icon: BadgeCheck },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCollabCount, setPendingCollabCount] = useState(0);

  const fetchPendingCount = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("cb_token") : null;
    if (!token) return;
    try {
      const [requests, teams] = await Promise.all([
        getIncomingJoinRequests().catch(() => []),
        getMyCreatedTeams().catch(() => []),
      ]);
      const reqCount = (requests || []).filter(
        (r: any) => String(r.status).toUpperCase() === "PENDING"
      ).length;

      let unreadChatCount = 0;
      let storedUser: any = {};
      try {
        storedUser = JSON.parse(localStorage.getItem("cb_user") || "{}");
      } catch {}

      await Promise.all(
        (teams || []).map(async (t: any) => {
          if (!t.id) return;
          try {
            const msgs = await getTeamChatMessages(t.id, 1);
            if (msgs && msgs.length > 0) {
              const latest = msgs[msgs.length - 1];
              if (
                checkIsMessageUnread(
                  t.id,
                  latest.createdAt,
                  latest.senderId,
                  storedUser?.id || storedUser?.userId,
                  latest.senderName,
                  storedUser?.name || storedUser?.fullName,
                  latest.senderHandle,
                  storedUser?.handle
                )
              ) {
                unreadChatCount++;
              }
            }
          } catch {}
        })
      );

      setPendingCollabCount(reqCount + unreadChatCount);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPendingCount();

    const handleUpdate = () => fetchPendingCount();
    window.addEventListener("cb_collab_updated", handleUpdate);
    window.addEventListener("cb_room_read", handleUpdate);
    const interval = setInterval(fetchPendingCount, 45000);

    return () => {
      window.removeEventListener("cb_collab_updated", handleUpdate);
      window.removeEventListener("cb_room_read", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_refresh_token");
    localStorage.removeItem("cb_user");
    localStorage.removeItem("cb_profile");
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <a href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-hero flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              {!collapsed && <span className="font-heading text-base font-bold text-foreground">CollegeBook</span>}
            </a>
          </SidebarGroupLabel>

          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {mainNav.map((item) => {
                const isCollab = item.url === "/my-collaboration";
                const showBadge = isCollab && pendingCollabCount > 0;
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

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      <NavLink
                        to={item.url}
                        className={`hover:bg-muted/50 relative flex items-center justify-between ${
                          isActive ? "bg-primary/10 text-primary font-medium" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative">
                            <item.icon className="h-4 w-4 shrink-0" />
                            {collapsed && showBadge && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                            )}
                          </div>
                          {!collapsed && (
                            <span className="truncate">{item.title}</span>
                          )}
                        </div>

                        {!collapsed && showBadge && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                            {pendingCollabCount}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground"
            >
              {collapsed ? <PanelLeft className="mr-2 h-4 w-4" /> : <PanelLeftClose className="mr-2 h-4 w-4" />}
              {!collapsed && <span>{collapsed ? "Expand" : "Collapse"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Log out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
