import { Bell } from "lucide-react";
import React from "react";

const BiNotification = () => {
  return (
    <button
      aria-label="Notifications"
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-neutral-100 hover:text-gray-900 transition-colors"
    >
      <Bell className="h-4 w-4" />
    </button>
  );
};

export default BiNotification;
