"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Lock,
  Building2,
  Bell,
  Settings2,
  Users,
  ShieldCheck,
  FolderOpen,
  Tag,
  Hash,
  Percent,
  Ruler,
} from "lucide-react";

import ProfileTab from "./_components/ProfileTab";
import BusinessTab from "./_components/BusinessTab";
import SecurityTab from "./_components/SecurityTab";
import NotificationTab from "./_components/NotificationTab";
import SystemTab from "./_components/SystemTab";
import UsersTab from "./_components/UsersTab";
import RolesTab from "./_components/RolesTab";
import CategoriesTab from "./_components/CategoriesTab";
import BrandsTab from "./_components/BrandsTab";
import HsnTab from "./_components/HsnTab";
import GstTab from "./_components/GstTab";
import UnitsTab from "./_components/UnitsTab";

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
      { value: "roles", label: "Roles & Permissions", icon: ShieldCheck },
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

const allItems = groups.flatMap((g) => g.items);

export default function SettingsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Manage your account, master data, and system preferences.
        </p>
      </div>

      <Tabs defaultValue="categories">

        {/* ── Mobile: horizontal scrollable pill bar ── */}
        <div className="md:hidden mb-3 -mx-4 px-4 overflow-x-auto scrollbar-none">
          <TabsList className="inline-flex h-auto w-max gap-1.5 bg-neutral-100 rounded-xl p-1.5">
            {allItems.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground
                           data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm
                           data-[state=active]:shadow-none data-[state=active]:ring-0 h-auto flex-none"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Desktop: vertical sidebar + content ── */}
        <div className="hidden md:flex flex-row items-start rounded-xl bg-white ring-1 ring-black/5 overflow-hidden">
          {/* Sidebar nav */}
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

          {/* Content panel */}
          <div className="flex-1 min-w-0">
            <TabsContent value="categories"><CategoriesTab /></TabsContent>
            <TabsContent value="brands"><BrandsTab /></TabsContent>
            <TabsContent value="hsn"><HsnTab /></TabsContent>
            <TabsContent value="gst"><GstTab /></TabsContent>
            <TabsContent value="units"><UnitsTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="roles"><RolesTab /></TabsContent>
            <TabsContent value="profile"><ProfileTab /></TabsContent>
            <TabsContent value="security"><SecurityTab /></TabsContent>
            <TabsContent value="business"><BusinessTab /></TabsContent>
            <TabsContent value="notifications"><NotificationTab /></TabsContent>
            <TabsContent value="system"><SystemTab /></TabsContent>
          </div>
        </div>

        {/* ── Mobile: content (no wrapper box, just padded cards) ── */}
        <div className="md:hidden rounded-xl bg-white ring-1 ring-black/5 overflow-hidden">
          <TabsContent value="categories"><CategoriesTab /></TabsContent>
          <TabsContent value="brands"><BrandsTab /></TabsContent>
          <TabsContent value="hsn"><HsnTab /></TabsContent>
          <TabsContent value="gst"><GstTab /></TabsContent>
          <TabsContent value="units"><UnitsTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="roles"><RolesTab /></TabsContent>
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
