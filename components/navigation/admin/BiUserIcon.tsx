"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/api/auth";
import { useAuth } from "@/providers/auth-provider";
import { titleCase } from "@/utils";

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

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "AD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-52">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {user?.email ?? "Admin"}
            </span>
            <span className="text-xs text-muted-foreground">
              {titleCase(user?.role?.name ?? "Admin")}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          onClick={() => handleLogout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BiUserIcon;
