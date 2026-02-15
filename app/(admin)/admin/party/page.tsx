"use client";
import { Button } from "@/components/ui/button";

import PageHeader from "@/components/navigation/public/PageHeader";

import React from "react";
import PartyDataTable from "./components/PartyDataTable";
import BiBreadcrumb from "@/components/ui/common/BiBreadcrumb";

const page = () => {
  return (
    <div className="max-w-9xl mx-auto gap-4 grid">
      <BiBreadcrumb />
     <PageHeader
        title="Parties"
        description="Manage customers, suppliers, and their balances."
        action={<Button>Add Party</Button>}
      />

      {/* content */}
      <PartyDataTable />
    </div>
  );
};

export default page;
