"use client";

import AdminNavbar from "@/components/ui/common/admin-navbar";
import AdminSidebar from "@/components/ui/common/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

import React, { useEffect } from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  (useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }),
    [isAuthenticated, isLoading]);

  if (isLoading) return <>Loading...</>;

  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset className="flex min-h-screen flex-col">
        <AdminNavbar className="sticky top-0 z-30 border-b bg-background" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
