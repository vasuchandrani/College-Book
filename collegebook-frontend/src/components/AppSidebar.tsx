import { Newspaper, Compass, Users, UserCircle, BadgeCheck, BookOpen, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const mainNav = [
  { title: "Campus Feed", url: "/feed", icon: Newspaper },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Collab Hub", url: "/collab", icon: Users },
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "myCon Badges", url: "/mycon", icon: BadgeCheck },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
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
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
            <SidebarMenuButton className="text-muted-foreground hover:text-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Log out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
