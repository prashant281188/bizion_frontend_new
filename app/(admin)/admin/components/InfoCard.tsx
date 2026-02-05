import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type InfoCardProps = {
  icon?: ReactNode;
  value: string;
  title: string;
  changePercentage: number;
  className?: string;
};

const InfoCard = ({
  icon,
  value,
  title,
  changePercentage,
  className,
}: InfoCardProps) => {
  const isPositive =
    typeof changePercentage === "number" && changePercentage >= 0;
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-md">
            {icon}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold tracking-tight">{value}</span>

          {typeof changePercentage === "number" && (
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isPositive ? "text-green-600" : "text-red-600",
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(changePercentage)}%
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">Compared to last week</p>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
