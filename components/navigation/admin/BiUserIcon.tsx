"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/api/auth";
import { useAuth } from "@/providers/auth-provider";

const BiUserIcon = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { mutate: handleLogout } = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.clear();
      router.push("/logout");
    },
  });

  const initials = user?.firstName
    ? user.firstName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Admin";
  const roleName = (user?.role?.name ?? "Admin");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black ring-2 ring-transparent transition-all hover:ring-amber-400 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          {/* Subtle shimmer on hover */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative">{initials}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-60 p-0 overflow-hidden rounded-xl shadow-lg border border-black/8">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-br from-amber-50 to-white border-b border-black/6">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-black shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email?.toLowerCase()}</p>
            <span className="mt-0.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 capitalize">
              {roleName}
            </span>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-1.5 space-y-0.5">
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-neutral-100 focus:text-gray-900">
            <Link href="/admin/settings" className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100">
                <Settings className="h-3.5 w-3.5" />
              </span>
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-neutral-100 focus:text-gray-900">
            <Link href="/admin/settings?tab=profile" className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-100">
                <User className="h-3.5 w-3.5" />
              </span>
              My Profile
            </Link>
          </DropdownMenuItem>
        </div>

        {/* Sign out */}
        <div className="border-t border-black/6 p-1.5">
          <DropdownMenuItem
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-red-600 focus:bg-red-50 focus:text-red-700 flex items-center gap-2.5"
            onClick={() => handleLogout()}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-red-50">
              <LogOut className="h-3.5 w-3.5" />
            </span>
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BiUserIcon;
