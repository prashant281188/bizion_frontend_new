import { cookies } from "next/headers";
import React from "react";
import AdminShell from "./admin-shell";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get("sidebar_state");
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true;

  return <AdminShell defaultOpen={defaultOpen}>{children}</AdminShell>;
};

export default AdminLayout;
