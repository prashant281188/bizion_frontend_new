"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "../../ui/sidebar";
import { usePathname } from "next/navigation";
import Notification from "./Notification";
import SearchBar from "./SearchBar";
import UserIcon from "./UserIcon";
import { ChevronRight } from "lucide-react";

const pageMeta: Record<string, { title: string; description: string; crumbs?: string[] }> = {
  "/admin/dashboard":           { title: "Dashboard",      description: "Overview & statistics" },
  "/admin/products":            { title: "Products",       description: "Manage your catalogue",       crumbs: ["Products"] },
  "/admin/products/create":     { title: "Add Product",    description: "Create a new product listing", crumbs: ["Products", "Add Product"] },
  "/admin/products/bulk":       { title: "Bulk Edit",      description: "Edit multiple products at once", crumbs: ["Products", "Bulk Edit"] },
  "/admin/products/catalog":    { title: "Catalogue",      description: "Full product catalogue",       crumbs: ["Products", "Catalogue"] },
  "/admin/parties":             { title: "Parties",        description: "Customers, suppliers & more",  crumbs: ["Parties"] },
  "/admin/carousel":            { title: "Carousel",       description: "Manage homepage slides",       crumbs: ["Carousel"] },
  "/admin/settings":            { title: "Settings",       description: "System configuration",         crumbs: ["Settings"] },
};

const getPageMeta = (pathname: string) => {
  if (pageMeta[pathname]) return pageMeta[pathname];
  if (pathname.startsWith("/admin/products/")) return { title: "Edit Product",  description: "Update product details",   crumbs: ["Products", "Edit"] };
  if (pathname.startsWith("/admin/parties/"))  return { title: "Party Details", description: "View & manage party",      crumbs: ["Parties", "Details"] };
  return { title: "Admin", description: "" };
};

const AdminNavbar = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const { title, description, crumbs } = getPageMeta(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-black/6 bg-white/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4">

        {/* Sidebar toggle */}
        <SidebarTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-neutral-100 hover:text-gray-900" />

        {/* Divider */}
        <div className="h-5 w-px shrink-0 bg-black/8" />

        {/* Page identity */}
        <div className="hidden min-w-0 md:block">
          {/* Breadcrumb trail */}
          {crumbs && crumbs.length > 0 && (
            <div className="mb-0.5 flex items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide">
                Admin
              </span>
              {crumbs.map((crumb, i) => (
                <React.Fragment key={crumb}>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wide",
                      i === crumbs.length - 1
                        ? "text-amber-600"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Title + description */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-semibold leading-tight text-gray-900">{title}</h1>
            {description && (
              <span className="hidden text-xs text-muted-foreground lg:block">
                — {description}
              </span>
            )}
          </div>
        </div>

        {/* Search — centered on large screens */}
        <div className="hidden flex-1 justify-center px-4 lg:flex">
          <div className="w-full max-w-xs">
            <SearchBar />
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* Mobile search hint */}
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-neutral-100 hover:text-gray-900 lg:hidden">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>

          <Notification />

          {/* Divider */}
          <div className="mx-1 h-5 w-px bg-black/8" />

          <UserIcon />
        </div>
      </div>

      {/* Amber accent line at the very bottom */}
      <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    </header>
  );
};

export default AdminNavbar;
