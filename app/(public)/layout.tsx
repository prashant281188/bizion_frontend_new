import PublicFooter from "@/components/navigation/public/public-footer";
import PublicNavbar from "@/components/navigation/public/public-navbar";
import { Metadata } from "next";

import React from "react";

export const metadata: Metadata = {
  title: "Hini | Products",
};
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-neutral-50 w-full">
      <PublicNavbar />
      {children}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
