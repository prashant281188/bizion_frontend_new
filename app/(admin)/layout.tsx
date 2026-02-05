import AdminNavbar from "@/components/ui/common/admin-navbar";
import AdminSidebar from "@/components/ui/common/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminNavbar className="sticky top-0 bg-white" />
        <div className="  p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
