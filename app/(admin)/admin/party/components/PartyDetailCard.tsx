import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

type Party = {
  name: string;
  gstin: string;
  contact: string;
  address: string;
  type: string;
};

type PartyDetailCardProps = {
  partyDetail: Party;
  className?: string;
};

const PartyDetailCard = ({ partyDetail, className }: PartyDetailCardProps) => {
  return (
    <Card className={cn(className, "w-full")}>
      <CardHeader>{partyDetail.name}</CardHeader>
      <CardContent>
        {partyDetail.gstin}
        {partyDetail.address}
        {partyDetail.contact}
        <Badge variant={"destructive"}>{partyDetail.type}</Badge>
      </CardContent>
    </Card>
  );
};

export default PartyDetailCard;
