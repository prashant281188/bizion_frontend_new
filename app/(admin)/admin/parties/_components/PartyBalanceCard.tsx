"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { api } from "@/lib/api/axios";

type Balance = {
  totalSales: number;
  totalPurchases: number;
  outstanding: number;
};

async function getPartyBalance(id: string): Promise<Balance> {
  const res = await api.get<{ data: Balance }>(`/parties/${id}/balance`);
  return res.data.data;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function PartyBalanceCard({ partyId }: { partyId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["party-balance", partyId],
    queryFn: () => getPartyBalance(partyId),
    enabled: !!partyId,
  });

  const cards = [
    { label: "Total Sales", value: data?.totalSales, icon: TrendingUp, color: "bg-emerald-50 ring-emerald-200 text-emerald-600" },
    { label: "Total Purchases", value: data?.totalPurchases, icon: TrendingDown, color: "bg-blue-50 ring-blue-200 text-blue-600" },
    { label: "Outstanding", value: data?.outstanding, icon: Minus, color: "bg-amber-50 ring-amber-200 text-amber-600" },
  ];

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-black/5">
        <p className="text-sm font-semibold text-gray-900">Balance Summary</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-4 px-6 py-5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              {isLoading ? (
                <div className="mt-1 h-5 w-20 rounded bg-neutral-100 animate-pulse" />
              ) : (
                <p className="text-base font-bold text-gray-900 mt-0.5">{value != null ? fmt(value) : "—"}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
