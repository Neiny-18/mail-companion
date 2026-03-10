import { useState } from "react";
import { Inbox, Briefcase, GraduationCap, Package, Megaphone, Settings, LayoutDashboard, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type SubItem = { sub: string; labelKey: TranslationKey };
type CategoryItem = {
  category: string;
  titleKey: TranslationKey;
  icon: typeof Briefcase;
  subs: SubItem[];
};

const emailCategoryTree: CategoryItem[] = [
  {
    category: "jobs",
    titleKey: "sidebar.jobs",
    icon: Briefcase,
    subs: [
      { sub: "Interview", labelKey: "sidebar.sub.Interview" },
      { sub: "Application", labelKey: "sidebar.sub.Application" },
      { sub: "OA", labelKey: "sidebar.sub.OA" },
      { sub: "Offer", labelKey: "sidebar.sub.Offer" },
      { sub: "Rejection", labelKey: "sidebar.sub.Rejection" },
      { sub: "Recruiter", labelKey: "sidebar.sub.Recruiter" },
    ],
  },
  {
    category: "school",
    titleKey: "sidebar.school",
    icon: GraduationCap,
    subs: [
      { sub: "Course", labelKey: "sidebar.sub.Course" },
      { sub: "Deadline", labelKey: "sidebar.sub.Deadline" },
      { sub: "Exam", labelKey: "sidebar.sub.Exam" },
      { sub: "Events", labelKey: "sidebar.sub.Events" },
    ],
  },
  {
    category: "orders",
    titleKey: "sidebar.orders",
    icon: Package,
    subs: [
      { sub: "Ecommerce", labelKey: "sidebar.sub.Ecommerce" },
      { sub: "Travel", labelKey: "sidebar.sub.Travel" },
      { sub: "Bills", labelKey: "sidebar.sub.Bills" },
      { sub: "Refund", labelKey: "sidebar.sub.Refund" },
    ],
  },
  {
    category: "ads",
    titleKey: "sidebar.ads",
    icon: Megaphone,
    subs: [
      { sub: "Newsletter", labelKey: "sidebar.sub.Newsletter" },
      { sub: "Promotion", labelKey: "sidebar.sub.Promotion" },
    ],
  },
];

const otherSubItems: SubItem[] = [
  { sub: "Banking", labelKey: "sidebar.sub.Banking" },
  { sub: "Social", labelKey: "sidebar.sub.Social" },
  { sub: "Uncategorized", labelKey: "sidebar.sub.Uncategorized" },
];

const topLinks: { titleKey: TranslationKey; url: string; icon: typeof Inbox }[] = [
  { titleKey: "sidebar.dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "sidebar.allEmails", url: "/emails", icon: Inbox },
];

const utilItems: { titleKey: TranslationKey; url: string; icon: typeof Settings }[] = [
  { titleKey: "sidebar.settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t } = useLanguage();
  const location = useLocation();
  const pathCategory = location.pathname.split("/")[2];
  const searchSub = new URLSearchParams(location.search).get("sub");

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    if (pathCategory) o[pathCategory] = true;
    return o;
  });

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

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
              {topLinks.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url !== "/emails"}
                      className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors"
                      activeClassName="bg-accent text-foreground font-bold"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {emailCategoryTree.map((item) =>
                collapsed ? (
                  <SidebarMenuItem key={item.category}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/emails/${item.category}`}
                        className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors"
                        activeClassName="bg-accent text-foreground font-bold"
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        {!collapsed && <span>{t(item.titleKey)}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  <Collapsible
                    key={item.category}
                    open={openCategories[item.category] ?? pathCategory === item.category}
                    onOpenChange={() => toggleCategory(item.category)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={`/emails/${item.category}`}
                            end={!searchSub}
                            className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors w-full"
                            activeClassName="bg-accent text-foreground font-bold"
                          >
                            <item.icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="flex-1 text-left">{t(item.titleKey)}</span>
                            <ChevronRight className="h-3 w-3 shrink-0 transition-transform [[data-state=open]_&]:rotate-90" />
                          </NavLink>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pl-6 pr-2 py-1 space-y-0.5">
                          {item.subs.map(({ sub, labelKey }) => (
                            <NavLink
                              key={sub}
                              to={`/emails/${item.category}?sub=${encodeURIComponent(sub)}`}
                              className={({ isActive }) =>
                                `block px-2 py-1.5 font-mono text-[11px] rounded transition-colors ${
                                  isActive && searchSub === sub
                                    ? "bg-accent text-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                }`
                              }
                            >
                              {t(labelKey)}
                            </NavLink>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              )}

              {collapsed ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/emails/other"
                      className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors"
                      activeClassName="bg-accent text-foreground font-bold"
                    >
                      <Inbox className="h-3.5 w-3.5 shrink-0" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <Collapsible
                  open={openCategories["other"] ?? pathCategory === "other"}
                  onOpenChange={() => toggleCategory("other")}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to="/emails/other"
                          end={!searchSub}
                          className="flex items-center gap-2 px-3 py-2 font-mono text-xs hover:bg-accent transition-colors w-full"
                          activeClassName="bg-accent text-foreground font-bold"
                        >
                          <Inbox className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1 text-left">{t("category.Other")}</span>
                          <ChevronRight className="h-3 w-3 shrink-0 transition-transform [[data-state=open]_&]:rotate-90" />
                        </NavLink>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-6 pr-2 py-1 space-y-0.5">
                        {otherSubItems.map(({ sub, labelKey }) => (
                          <NavLink
                            key={sub}
                            to={`/emails/other?sub=${encodeURIComponent(sub)}`}
                            className={({ isActive }) =>
                              `block px-2 py-1.5 font-mono text-[11px] rounded transition-colors ${
                                isActive && searchSub === sub
                                  ? "bg-accent text-foreground font-semibold"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                              }`
                            }
                          >
                            {t(labelKey)}
                          </NavLink>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
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
