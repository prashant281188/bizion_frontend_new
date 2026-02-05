import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
  Layers,
  ShoppingCart,
  Truck,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";
import { ScrollArea } from "../scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";
import Link from "next/link";

export const sidebarConfig = [
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
          { title: "Product List", url: "/admin/products" },
          { title: "Add Product", url: "/admin/products/new" },
          { title: "Categories", url: "/admin/categories" },
          { title: "Brands", url: "/admin/brands" },
        ],
      },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Sales Invoice", url: "/admin/sales/invoice", icon: ShoppingCart },
      { title: "Sales Estimate", url: "/admin/sales/estimate", icon: Layers },
      { title: "Customers", url: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Purchase",
    items: [
      { title: "Purchase Invoice", url: "/admin/purchase/invoice", icon: Truck },
      { title: "Vendors", url: "/admin/vendors", icon: Users },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Sales Report", url: "/admin/reports/sales", icon: BarChart3 },
      { title: "Stock Report", url: "/admin/reports/stock", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

import {
  ChevronRight,
  ChevronUp,
  TvIcon,
  User2,
} from "lucide-react";


const AdminSidebar = () => {
  return (
    <Sidebar className="bg-white border-r border-black/5">
      {/* HEADER */}
      <SidebarHeader className="h-16 px-4 border-b border-black/5">
        <div className="flex items-center gap-2 font-semibold tracking-wide">
          <TvIcon size={18} className="text-amber-500" />
          HINI Admin
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <ScrollArea className="px-2">
          {sidebarConfig.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="px-3 text-xs uppercase tracking-widest text-muted-foreground">
                {group.label}
              </SidebarGroupLabel>

              <SidebarMenu>
                {group.items.map((item) =>
                  item.children ? (
                    <Collapsible key={item.title} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.title}
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuButton asChild>
                                  <Link href={child.url}>
                                    {child.title}
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
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

      {/* FOOTER */}
      <SidebarFooter className="border-t border-black/5 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 className="mr-2 h-4 w-4" />
                  Admin User
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" className="w-full">
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
