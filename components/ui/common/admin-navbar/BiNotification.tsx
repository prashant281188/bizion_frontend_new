import { BellIcon } from "lucide-react";
import React from "react";

const BiNotification = () => {
  return (
    <div className="relative inline-flex items-center justify-center">
      <BellIcon className="h-6 w-6 text-gray-600" />

      {/* Badge */}
      <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
        9
      </span>
    </div>
  );
};

export default BiNotification;
