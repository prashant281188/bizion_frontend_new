"use client";

import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Package,
  PackageSearch,
  PackagePlus,
  Pencil,
  BookOpen,
  Settings,
  ChevronRight,
  Building2,
  Users,
  ShoppingCart,
  ClipboardList,
  FilePlus,
  Truck,
  PackageCheck,
  Warehouse,
  Images,
  LogOut,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils";
import Image from "next/image";

type NavChild = { title: string; url: string; icon: React.ElementType };
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
          { title: "Product List",      url: "/admin/products",         icon: PackageSearch },
          { title: "Add Product",       url: "/admin/products/create",  icon: PackagePlus },
          { title: "Bulk Edit / Create",url: "/admin/products/bulk",    icon: Pencil },
          { title: "Catalogue",         url: "/admin/products/catalog",   icon: BookOpen },
        ],
      },
      {
        title: "Parties",
        icon: Building2,
        children: [
          { title: "Party List", url: "/admin/parties", icon: Users },
        ],
      },
      {
        title: "Orders",
        icon: ShoppingCart,
        children: [
          { title: "Order List",     url: "/admin/orders",        icon: ClipboardList },
          { title: "New Order",      url: "/admin/orders/create", icon: FilePlus },
          { title: "Dispatches",     url: "/admin/dispatches",    icon: Truck },
          { title: "Goods Received", url: "/admin/receipts",      icon: PackageCheck },
        ],
      },
      { title: "Inventory", url: "/admin/inventory", icon: Warehouse },
      { title: "Carousel",  url: "/admin/carousel",  icon: Images },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", url: "/admin/settings", icon: Settings }],
  },
];

/* ── Collapsed nav item — hover popover for children ── */
function CollapsedNavItem({
  item,
  isGroupActive,
  isChildActive,
}: {
  item: NavItem;
  isGroupActive: (children: NavChild[]) => boolean;
  isChildActive: (url: string, siblings: NavChild[]) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const active = isGroupActive(item.children!);

  return (
    <SidebarMenuItem>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className={cn(
              "flex h-9 w-full items-center justify-center rounded-lg transition-all duration-150",
              active
                ? "bg-amber-500/10 text-amber-600"
                : "text-muted-foreground hover:bg-neutral-100 hover:text-gray-900",
            )}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={10}
          className="w-48 p-1.5 shadow-lg"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <p className="px-2.5 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {item.title}
          </p>
          <div className="space-y-0.5">
            {item.children!.map((child) => {
              const childActive = isChildActive(child.url, item.children!);
              return (
                <Link
                  key={child.title}
                  href={child.url}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    childActive
                      ? "bg-amber-500/10 text-amber-700"
                      : "text-gray-600 hover:bg-neutral-100 hover:text-gray-900",
                  )}
                >
                  <child.icon className="h-3.5 w-3.5 shrink-0" />
                  {child.title}
                </Link>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  );
}

/* ── Footer user card ── */
function SidebarUserFooter() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const collapsed = state === "collapsed";

  const initials = user?.firstName
    ? user.firstName[0].toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : "A";

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Admin";
  const roleName = titleCase(user?.role?.name ?? "Admin");

  return (
    <SidebarFooter className="border-t border-black/6 p-2">
      {collapsed ? (
        <div className="flex justify-center py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black ring-2 ring-white shadow-sm">
            {initials}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5 ring-1 ring-black/5">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black shadow-sm">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-900">{displayName}</p>
            <p className="truncate text-[10px] text-muted-foreground">{roleName}</p>
          </div>
          <Link
            href="/admin/settings"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-neutral-200 hover:text-gray-900"
            title="Settings"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </SidebarFooter>
  );
}

/* ── Main sidebar ── */
const AdminSidebar = () => {
  const pathname = usePathname();
  const { state, setOpenMobile } = useSidebar();
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

  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-black/6 bg-white"
    >
      {/* HEADER */}
      <SidebarHeader className="h-14 border-b border-black/6 px-3">
        <Link
          href="/admin/dashboard"
          onClick={closeMobile}
          className="flex h-full items-center gap-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-black/8 shadow-sm">
            <Image src="/hini_logo.png" alt="logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="font-bold tracking-tight text-gray-900 group-data-[collapsible=icon]:hidden">
            HINI ADMIN
          </span>
        </Link>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <ScrollArea className="flex-1 px-2 py-2">
          {sidebarConfig.map((group, gi) => (
            <SidebarGroup key={group.label} className="p-0">
              {/* Group divider — visible only when expanded */}
              {!collapsed && (
                <div className={cn("flex items-center gap-2 px-1 pb-1.5", gi > 0 && "pt-3")}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-black/5" />
                </div>
              )}
              {collapsed && gi > 0 && (
                <div className="my-2 mx-1 h-px bg-black/8" />
              )}

              <SidebarMenu className="gap-0.5">
                {group.items.map((item) =>
                  item.children ? (
                    collapsed ? (
                      <CollapsedNavItem
                        key={item.title}
                        item={item}
                        isGroupActive={isGroupActive}
                        isChildActive={isChildActive}
                      />
                    ) : (
                      <Collapsible
                        key={item.title}
                        className="group/collapsible"
                        defaultOpen={isGroupActive(item.children)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              className={cn(
                                "h-9 rounded-lg transition-all duration-150",
                                isGroupActive(item.children)
                                  ? "text-gray-900 font-medium"
                                  : "text-gray-500 hover:bg-neutral-100 hover:text-gray-900",
                              )}
                            >
                              <item.icon
                                className={cn(
                                  "h-[18px] w-[18px] shrink-0",
                                  isGroupActive(item.children)
                                    ? "text-amber-500"
                                    : "text-muted-foreground",
                                )}
                              />
                              <span className="text-sm">{item.title}</span>
                              <ChevronRight
                                className={cn(
                                  "ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200",
                                  "group-data-[state=open]/collapsible:rotate-90",
                                )}
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="ml-3 mt-0.5 mb-1 space-y-0.5 border-l border-black/8 pl-3">
                              {item.children.map((child) => {
                                const active = isChildActive(child.url, item.children!);
                                return (
                                  <Link
                                    key={child.title}
                                    href={child.url}
                                    onClick={closeMobile}
                                    className={cn(
                                      "flex min-h-[34px] items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                                      active
                                        ? "bg-amber-500/10 text-amber-700 font-medium"
                                        : "text-muted-foreground hover:bg-neutral-100 hover:text-gray-900",
                                    )}
                                  >
                                    <child.icon
                                      className={cn(
                                        "h-3.5 w-3.5 shrink-0",
                                        active ? "text-amber-500" : "text-muted-foreground/60",
                                      )}
                                    />
                                    {child.title}
                                  </Link>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={cn(
                          "h-9 rounded-lg transition-all duration-150",
                          isActive(item.url!)
                            ? "bg-amber-500 text-black font-semibold hover:bg-amber-400 shadow-sm"
                            : "text-gray-500 hover:bg-neutral-100 hover:text-gray-900",
                        )}
                      >
                        <Link href={item.url!} onClick={closeMobile}>
                          <item.icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0",
                              isActive(item.url!) ? "text-black" : "text-muted-foreground",
                            )}
                          />
                          <span className="text-sm">{item.title}</span>
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
