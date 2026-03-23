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
} from "@/components/ui/sidebar";
import {
  Home,
  Package,
  Settings,
  ChevronRight,
  LayoutGrid,
  Building2,
  BookOpen,
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
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Home,
      },
      {
        title: "Products",
        icon: Package,
        children: [
          { title: "Product List",  url: "/admin/products" },
          { title: "Add Product",   url: "/admin/products/create" },
          { title: "Catalogue",     url: "/admin/products/catalouge" },
        ],
      },
      {
        title: "Parties",
        icon: Building2,
        children: [
          { title: "Party List", url: "/admin/parties" },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  // Top-level items: exact match or any sub-path
  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  // Child items: most specific sibling wins — prevents /admin/products from
  // matching when the active path is /admin/products/create
  const isChildActive = (url: string, siblings: NavChild[]) => {
    if (pathname === url) return true;
    if (!pathname.startsWith(url + "/")) return false;
    return !siblings.some(
      (s) => s.url !== url && (pathname === s.url || pathname.startsWith(s.url + "/"))
    );
  };

  const isGroupActive = (children: NavChild[]) =>
    children.some((c) => isChildActive(c.url, children));

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <Sidebar className="border-r border-black/5">
      {/* HEADER */}
      <SidebarHeader className="h-14 px-4 border-b border-black/5">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500">
            <LayoutGrid className="h-4 w-4 text-black" />
          </div>
          <span className="font-bold tracking-tight text-gray-900">HINI Admin</span>
        </Link>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <ScrollArea className="px-2 py-2">
          {sidebarConfig.map((group) => (
            <SidebarGroup key={group.label} className="mb-1">
              <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>

              <SidebarMenu>
                {group.items.map((item) =>
                  item.children ? (
                    <Collapsible
                      key={item.title}
                      className="group/collapsible"
                      defaultOpen={isGroupActive(item.children)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "w-full rounded-lg transition-colors",
                              isGroupActive(item.children)
                                ? "bg-amber-50 text-amber-700 font-medium"
                                : "hover:bg-neutral-100"
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-4 w-4",
                                isGroupActive(item.children)
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 border-l border-black/5 pl-3">
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuButton
                                  asChild
                                  className={cn(
                                    "rounded-lg text-sm transition-colors",
                                    isChildActive(child.url, item.children!)
                                      ? "bg-amber-500 text-black font-semibold hover:bg-amber-500"
                                      : "text-muted-foreground hover:bg-neutral-100 hover:text-gray-900"
                                  )}
                                >
                                  <Link href={child.url}>{child.title}</Link>
                                </SidebarMenuButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "rounded-lg transition-colors",
                          isActive(item.url!)
                            ? "bg-amber-500 text-black font-semibold hover:bg-amber-500"
                            : "hover:bg-neutral-100"
                        )}
                      >
                        <Link href={item.url!} className="flex items-center gap-2">
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isActive(item.url!) ? "text-black" : "text-muted-foreground"
                            )}
                          />
                          {item.title}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      {/* FOOTER — user info only, no duplicate links */}
      <SidebarFooter className="border-t border-black/5 p-3">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-neutral-100 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-gray-900 truncate">
              {user?.email ?? "Admin"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {titleCase(user?.role?.name ?? "Admin")}
            </span>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
