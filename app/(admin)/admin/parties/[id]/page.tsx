import React from "react";
import PartyDetailCard from "../components/PartyDetailCard";
import PageHeader from "@/components/navigation/public/PageHeader";
import PartyBalanceCard from "../components/PartyBalanceCard";

const PartyDemo = {
  name: "Garg Brothers",
  gstin: "09BEPPG7632N1ZS",
  address: "Aligarh",
  contact: "+91 9917174488",
  type: "retailer",
};
const page = () => {
  return (
   <div className="max-w-9xl mx-auto gap-4 grid">
      <PageHeader title="Party" description="Party Realtime Snapshot" />
      <PartyDetailCard partyDetail={PartyDemo}/> 
      <PartyBalanceCard/> 
    </div>
  );
};

export default page;
