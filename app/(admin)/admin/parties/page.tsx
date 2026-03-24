"use client";

import React, { Suspense } from "react";
import PartyDataTable from "./components/PartyDataTable";

const PartiesPage = () => (
  <div className="page-wrapper">
    <Suspense>
      <PartyDataTable />
    </Suspense>
  </div>
);

export default PartiesPage;
