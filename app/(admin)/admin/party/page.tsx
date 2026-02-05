"use client";
import { Button } from "@/components/ui/button";

import PageHeader from "@/components/ui/common/PageHeader";

import React from "react";
import PartyDataTable from "./components/PartyDataTable";
import BiBreadcrumb from "@/components/ui/common/BiBreadcrumb";

const page = () => {
  return (
    <div className="max-w-9xl mx-auto gap-4 grid">
      <BiBreadcrumb />
      <PageHeader
        title="Party"
        description="Party Realtime Snapshot"
        action={<Button>Add Party</Button>}
      />

      {/* content */}
      <PartyDataTable />
    </div>
  );
};

export default page;
