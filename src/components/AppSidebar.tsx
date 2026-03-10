import { Inbox, Briefcase, GraduationCap, Package, Megaphone, Settings, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
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

const emailCategories: { titleKey: TranslationKey; url: string; icon: typeof Inbox }[] = [
  { titleKey: "sidebar.dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "sidebar.allEmails", url: "/emails", icon: Inbox },
  { titleKey: "sidebar.jobs", url: "/emails/jobs", icon: Briefcase },
  { titleKey: "sidebar.school", url: "/emails/school", icon: GraduationCap },
  { titleKey: "sidebar.orders", url: "/emails/orders", icon: Package },
  { titleKey: "sidebar.ads", url: "/emails/ads", icon: Megaphone },
];

const utilItems: { titleKey: TranslationKey; url: string; icon: typeof Settings }[] = [
  { titleKey: "sidebar.settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t } = useLanguage();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5 border-b border-border">
          {!collapsed ? (
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground">
              {t("sidebar.brand")}
            </p>
          ) : (
            <p className="font-mono text-xs text-center text-foreground">T</p>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("sidebar.inbox")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {emailCategories.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors"
                      activeClassName="bg-accent text-foreground font-bold"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("sidebar.system")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors"
                      activeClassName="bg-accent text-foreground font-bold"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
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
