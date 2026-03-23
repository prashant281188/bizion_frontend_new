"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "../../ui/sidebar";
import { usePathname } from "next/navigation";
import BiNotification from "./BiNotification";
import BiSearchBar from "./BiSearchBar";
import BiUserIcon from "./BiUserIcon";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/admin/dashboard":             { title: "Dashboard",   description: "Overview & statistics" },
  "/admin/products":              { title: "Products",    description: "Manage your catalogue" },
  "/admin/products/create":       { title: "Add Product", description: "Create a new product listing" },
  "/admin/products/catalouge":    { title: "Catalogue",   description: "Full product catalogue" },
  "/admin/parties":               { title: "Parties",     description: "Customers & suppliers" },
  "/admin/settings":              { title: "Settings",    description: "System configuration" },
};

const getPageMeta = (pathname: string) => {
  if (pageMeta[pathname]) return pageMeta[pathname];
  if (pathname.startsWith("/admin/products/")) return { title: "Edit Product",  description: "Update product details" };
  if (pathname.startsWith("/admin/parties/"))  return { title: "Party Details", description: "View & manage party" };
  return { title: "Admin", description: "" };
};

const AdminNavbar = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const { title, description } = getPageMeta(pathname);

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b border-black/5 bg-white/90 backdrop-blur-md",
        className
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Left */}
        <SidebarTrigger className="shrink-0 hover:bg-neutral-100 rounded-lg transition-colors" />

        <div className="hidden md:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground leading-tight">{description}</p>
          )}
        </div>

        {/* Center search */}
        <div className="hidden lg:flex flex-1 justify-center px-6">
          <div className="w-full max-w-sm">
            <BiSearchBar />
          </div>
        </div>

        {/* Right — notification + user only; Settings is in the sidebar */}
        <div className="ml-auto flex items-center gap-1">
          <BiNotification />
          <div className="mx-1 h-5 w-px bg-black/10" />
          <BiUserIcon />
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
