"use client";

import { Bell } from "lucide-react";
import React from "react";

const BiNotification = () => {
  // TODO: wire to real unread count
  const unreadCount = 0;

  return (
    <button
      aria-label="Notifications"
      className="group relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-neutral-100 hover:text-gray-900"
    >
      <Bell className="h-4 w-4 transition-transform group-hover:scale-110" />

      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-black ring-2 ring-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default BiNotification;
