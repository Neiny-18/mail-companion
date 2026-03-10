import { Inbox, Briefcase, GraduationCap, Package, Megaphone, Settings, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const emailCategories = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "All Emails", url: "/emails", icon: Inbox },
  { title: "Jobs", url: "/emails/jobs", icon: Briefcase },
  { title: "School", url: "/emails/school", icon: GraduationCap },
  { title: "Orders", url: "/emails/orders", icon: Package },
  { title: "Ads", url: "/emails/ads", icon: Megaphone },
];

const utilItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="px-4 py-5 border-b border-border">
          {!collapsed ? (
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground">
              Triage
            </p>
          ) : (
            <p className="font-mono text-xs text-center text-foreground">T</p>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
            Inbox
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {emailCategories.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors"
                      activeClassName="bg-accent text-foreground font-bold"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors"
                      activeClassName="bg-accent text-foreground font-bold"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
