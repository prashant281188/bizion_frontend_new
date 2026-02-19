import React from "react";
import { Calendar1Icon } from "lucide-react";

import PageHeader from "@/components/navigation/public/PageHeader";
import BiDataTable from "@/components/datatable/BiDataTable";
import BiBreadcrumb from "@/components/navigation/admin/BiBreadcrumb";
import InfoCard from "../components/InfoCard";


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
