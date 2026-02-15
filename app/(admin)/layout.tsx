"use client";

import AdminNavbar from "@/components/navigation/admin/admin-navbar";
import AdminSidebar from "@/components/navigation/admin/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import React, { useState } from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="flex min-h-screen flex-col">
          <AdminNavbar className="sticky top-0 z-30 border-b bg-background" />
          <AuthProvider>
            <main className="flex-1 overflow-y-auto">
              <div className="p-6">{children}</div>
            </main>
          </AuthProvider>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
};

export default AdminLayout;
