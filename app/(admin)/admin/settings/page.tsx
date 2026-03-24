"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Lock,
  Building2,
  Bell,
  Settings2,
  Users,
  FolderOpen,
  Tag,
  Hash,
  Percent,
  Ruler,
} from "lucide-react";

import ProfileTab from "./components/ProfileTab";
import BusinessTab from "./components/BusinessTab";
import SecurityTab from "./components/SecurityTab";
import NotificationTab from "./components/NotificationTab";
import SystemTab from "./components/SystemTab";
import UsersTab from "./components/UsersTab";
import CategoriesTab from "./components/CategoriesTab";
import BrandsTab from "./components/BrandsTab";
import HsnTab from "./components/HsnTab";
import GstTab from "./components/GstTab";
import UnitsTab from "./components/UnitsTab";

const groups = [
  {
    label: "Master Data",
    items: [
      { value: "categories", label: "Categories", icon: FolderOpen },
      { value: "brands",     label: "Brands",     icon: Tag },
      { value: "hsn",        label: "HSN Codes",  icon: Hash },
      { value: "gst",        label: "GST Rates",  icon: Percent },
      { value: "units",      label: "Units",      icon: Ruler },
    ],
  },
  {
    label: "Access",
    items: [
      { value: "users", label: "Users", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { value: "profile",  label: "Profile",  icon: User },
      { value: "security", label: "Security", icon: Lock },
      { value: "business", label: "Business", icon: Building2 },
    ],
  },
  {
    label: "System",
    items: [
      { value: "notifications", label: "Notifications", icon: Bell },
      { value: "system",        label: "System",        icon: Settings2 },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account, master data, and system preferences.
        </p>
      </div>

      <Tabs
        defaultValue="categories"
        orientation="vertical"
        className="flex flex-row items-start rounded-xl bg-white ring-1 ring-black/5 overflow-hidden"
      >
        {/* ── Sidebar nav ── */}
        <TabsList className="flex flex-col h-auto w-56 shrink-0 bg-neutral-50/70 border-r border-black/5 p-3 gap-0.5 justify-start self-stretch rounded-none">
          {groups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-4 w-full" : "w-full"}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              {group.items.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="w-full justify-start gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground
                             data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700
                             data-[state=active]:shadow-none data-[state=active]:ring-0
                             hover:bg-black/5 hover:text-gray-900 transition-colors h-auto flex-none"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </TabsTrigger>
              ))}
            </div>
          ))}
        </TabsList>

        {/* ── Content panel ── */}
        <div className="flex-1 min-w-0">
          <TabsContent value="categories"><CategoriesTab /></TabsContent>
          <TabsContent value="brands"><BrandsTab /></TabsContent>
          <TabsContent value="hsn"><HsnTab /></TabsContent>
          <TabsContent value="gst"><GstTab /></TabsContent>
          <TabsContent value="units"><UnitsTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="profile"><ProfileTab /></TabsContent>
          <TabsContent value="security"><SecurityTab /></TabsContent>
          <TabsContent value="business"><BusinessTab /></TabsContent>
          <TabsContent value="notifications"><NotificationTab /></TabsContent>
          <TabsContent value="system"><SystemTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
