"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Package,
  Settings,
  ChevronRight,
  Building2,
  Images,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils";
import Image from "next/image";

type NavChild = { title: string; url: string };
type NavItem = {
  title: string;
  icon: React.ElementType;
  url?: string;
  children?: NavChild[];
};
type NavGroup = { label: string; items: NavItem[] };

export const sidebarConfig: NavGroup[] = [
  {
    label: "Application",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: Home },
      {
        title: "Products",
        icon: Package,
        children: [
          { title: "Product List", url: "/admin/products" },
          { title: "Add Product", url: "/admin/products/create" },
          { title: "Bulk Edit / Create", url: "/admin/products/bulk" },
          { title: "Catalogue", url: "/admin/products/catalouge" },
        ],
      },
      {
        title: "Parties",
        icon: Building2,
        children: [{ title: "Party List", url: "/admin/parties" }],
      },
      { title: "Carousel", url: "/admin/carousel", icon: Images },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", url: "/admin/settings", icon: Settings }],
  },
];

/* ── Footer user card, collapses to avatar only ── */
function SidebarUserFooter() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const collapsed = state === "collapsed";

  const initials = user?.firstName
    ? user?.firstName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email
      ? user.email.slice(0, 2).toUpperCase()
      : "AD";

  return (
    <SidebarFooter className="border-t border-black/6 p-3">
      <Link
        href="/admin/settings"
        className={cn(
          "flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-neutral-100",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black shadow-sm ring-2 ring-white">
          {initials}
          {/* online dot */}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-semibold text-gray-900">
              {user?.firstName || user?.email?.split("@")[0] || "Admin"}
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              {titleCase(user?.role?.name ?? "Admin")}
            </span>
          </div>
        )}
      </Link>
    </SidebarFooter>
  );
}

/* ── Main sidebar ── */
const AdminSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  const isChildActive = (url: string, siblings: NavChild[]) => {
    if (pathname === url) return true;
    if (!pathname.startsWith(url + "/")) return false;
    return !siblings.some(
      (s) =>
        s.url !== url &&
        (pathname === s.url || pathname.startsWith(s.url + "/")),
    );
  };

  const isGroupActive = (children: NavChild[]) =>
    children.some((c) => isChildActive(c.url, children));

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-black/6 bg-white group/sidebar"
    >
      {/* HEADER */}
      <SidebarHeader className="h-14 border-b border-black/6">
        <div className="flex h-full items-center justify-between ">
          <Link
            href="/admin/dashboard"
            className={cn(
              "flex items-center gap-2.5 overflow-hidden",
              collapsed && "justify-center w-full",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
              <Image src={"/hini_logo.png"} alt="logo" width={1000} height={1000} />
            </div>
            <span className="w-full font-bold tracking-tight text-gray-900 whitespace-nowrap bg-amber-400 px-4 py-1 group-data-[collapsible=icon]:hidden">
              HINI ADMIN
            </span>
          </Link>
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="py-2">
        <ScrollArea className="px-2">
          {sidebarConfig.map((group) => (
            <SidebarGroup key={group.label} className="mb-2 p-0">
              <SidebarGroupLabel
                className={cn(
                  "mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70",
                  collapsed && "hidden",
                )}
              >
                {group.label}
              </SidebarGroupLabel>

              <SidebarMenu className="gap-1.5">
                {group.items.map((item) =>
                  item.children ? (
                    <Collapsible
                      key={item.title}
                      className="group/collapsible mb-2"
                      defaultOpen={isGroupActive(item.children)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={cn(
                              "rounded-lg transition-all duration-150",
                              isGroupActive(item.children)
                                ? "bg-neutral-100 text-gray-800 font-medium hover:bg-neutral-200"
                                : "text-gray-600 hover:bg-neutral-100 hover:text-gray-900",
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isGroupActive(item.children)
                                  ? "text-gray-700"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span>{item.title}</span>
                            <ChevronRight
                              className={cn(
                                "ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200",
                                "group-data-[state=open]/collapsible:rotate-90",
                              )}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 border-l border-black/8 pl-0 pt-0.5">
                            {item.children.map((child) => {
                              const active = isChildActive(
                                child.url,
                                item.children!,
                              );
                              return (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuButton
                                    asChild
                                    className={cn(
                                      "relative rounded-lg py-1.5 pl-3.5 text-sm transition-all",
                                      active
                                        ? "text-amber-700 font-semibold bg-amber-500/10 hover:bg-amber-500/15"
                                        : "text-muted-foreground hover:bg-neutral-100 hover:text-gray-900",
                                    )}
                                  >
                                    <Link href={child.url}>
                                      {/* Active indicator — vertical bar on the left */}
                                      <span
                                        className={cn(
                                          "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all",
                                          active
                                            ? "h-4 bg-amber-500"
                                            : "h-0 bg-transparent",
                                        )}
                                      />
                                      {child.title}
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title} className="mb-2">
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={cn(
                          "rounded-lg transition-all duration-150",
                          isActive(item.url!)
                            ? "bg-amber-500 text-black font-semibold hover:bg-amber-400 shadow-sm"
                            : "text-gray-600 hover:bg-neutral-100 hover:text-gray-900",
                        )}
                      >
                        <Link
                          href={item.url!}
                          className="flex items-center gap-2"
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isActive(item.url!)
                                ? "text-black"
                                : "text-muted-foreground",
                            )}
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
                )}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarUserFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
