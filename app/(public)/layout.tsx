import PublicFooter from "@/components/ui/common/public-footer";
import PublicNavbar from "@/components/ui/common/public-navbar";

import React from "react";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-neutral-50">
      <PublicNavbar />
      {children}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
