"use client";

import AdminNavbar from "@/components/navigation/admin/admin-navbar";
import AdminSidebar from "@/components/navigation/admin/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/providers/auth-provider";

import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex min-h-screen flex-col">
          <AdminNavbar className="sticky top-0 z-30 border-b bg-background" />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default AdminLayout;
