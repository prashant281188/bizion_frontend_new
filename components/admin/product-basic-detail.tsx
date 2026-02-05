import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { Edit, Edit2 } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

const ProductBasicDetail = ({ className }: { className?: string }) => {
  return (
    <Card className={cn("card", className)}>
      <CardHeader className="items-center">
        <CardTitle className="flex flex-col ">
          <p className="text-2xl">FB-125</p>
          <p className="text-xs text-muted-foreground">Brand</p>
        </CardTitle>
       <Image src={""} alt="product" />
        <CardAction>
          <Button variant={"ghost"}>
            <Edit2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
};

export default ProductBasicDetail;
