"use client";

import AdminNavbar from "@/components/navigation/admin/AdminNavbar";
import AdminSidebar from "@/components/navigation/admin/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/providers/auth-provider";
import React from "react";

const AdminShell = ({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) => {
  return (
    <AuthProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AdminSidebar />
        <SidebarInset className="flex min-h-screen flex-col">
          <AdminNavbar className="sticky top-0 z-30 border-b bg-background" />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AdminShell;
