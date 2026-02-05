import React from "react";
import { Calendar1Icon } from "lucide-react";

import InfoCard from "../components/InfoCard";
import BiBreadcrumb from "@/components/ui/common/BiBreadcrumb";
import PageHeader from "@/components/ui/common/PageHeader";
import BiDataTable from "@/components/ui/common/BiDataTable";


const AdminDashboardPage = () => {
  return (
   <div className="max-w-9xl mx-auto gap-4 grid">
      <BiBreadcrumb/>
      <PageHeader title="Dashboard" description="Realtime Dashboard Snapshot"/>
      {/* page content */}
      <InfoCard
        changePercentage={10}
        title="Info"
        value="10"
        icon={<Calendar1Icon />}
      />
      <BiDataTable />
    </div>
  );
};

export default AdminDashboardPage;
