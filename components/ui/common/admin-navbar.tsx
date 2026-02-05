import React from "react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "../sidebar";

import BiNotification from "./admin-navbar/BiNotification";
import BiSettings from "./admin-navbar/BiSettings";
import BiUserIcon from "./admin-navbar/BiUserIcon";
import BiSearchBar from "./admin-navbar/BiSearchBar";

const AdminNavbar = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b border-black/5 bg-white/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <SidebarTrigger size="icon-lg" className="hover:bg-muted" />

          {/* Page title / breadcrumb (recommended) */}
          <div className="hidden md:block">
            <h1 className="text-sm font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs text-muted-foreground">
              Overview & statistics
            </p>
          </div>
        </div>

        {/* CENTER (Global Search) */}
        <div className="hidden lg:flex flex-1 justify-center px-10">
          <div className="w-full max-w-md">
            <BiSearchBar />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <BiNotification />
          <BiSettings />

          {/* User Menu */}
          <BiUserIcon />
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
