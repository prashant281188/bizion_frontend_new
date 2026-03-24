import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

type Party = {
  name: string;
  gstin?: string | null;
  contact?: string | null;
  address?: string | null;
  city?: string | null;
  type: string;
};

type PartyDetailCardProps = {
  partyDetail: Party;
  className?: string;
};

const typeColor: Record<string, string> = {
  retailer: "bg-blue-50 text-blue-600 ring-blue-200",
  supplier: "bg-violet-50 text-violet-600 ring-violet-200",
  customer: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  distributor: "bg-amber-50 text-amber-700 ring-amber-200",
};

const PartyDetailCard = ({ partyDetail, className }: PartyDetailCardProps) => (
  <Card className={cn(className, "w-full")}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <h3 className="text-base font-semibold text-gray-900">{partyDetail.name}</h3>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 capitalize ${typeColor[partyDetail.type] ?? typeColor.retailer}`}>
        {partyDetail.type}
      </span>
    </CardHeader>
    <CardContent className="space-y-1 text-sm text-muted-foreground">
      {partyDetail.gstin && <p><span className="font-medium text-gray-700">GSTIN:</span> {partyDetail.gstin}</p>}
      {partyDetail.contact && <p><span className="font-medium text-gray-700">Contact:</span> {partyDetail.contact}</p>}
      {partyDetail.city && <p><span className="font-medium text-gray-700">City:</span> {partyDetail.city}</p>}
      {partyDetail.address && <p><span className="font-medium text-gray-700">Address:</span> {partyDetail.address}</p>}
    </CardContent>
  </Card>
);

export default PartyDetailCard;
