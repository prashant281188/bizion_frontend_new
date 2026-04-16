"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Building2, Phone, MapPin, Hash } from "lucide-react";
import { adminGetParty } from "@/lib/api/admin";
import PartyBalanceCard from "../components/PartyBalanceCard";
import PartyOrdersCard from "../components/PartyOrdersCard";

const typeColor: Record<string, string> = {
  retailer: "bg-blue-50 text-blue-600 ring-blue-200",
  supplier: "bg-violet-50 text-violet-600 ring-violet-200",
  customer: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  distributor: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: party, isLoading, isError } = useQuery({
    queryKey: ["admin-party", id],
    queryFn: () => adminGetParty(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="h-40 rounded-2xl bg-neutral-100 animate-pulse" />
        <div className="h-32 rounded-2xl bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  if (isError || !party) {
    return (
      <div className="empty-state">
        <Building2 className="empty-state-icon" />
        <p className="empty-state-title">Party not found</p>
        <p className="empty-state-subtitle">This party may have been deleted or the ID is invalid.</p>
        <Link href="/admin/parties" className="mt-4 text-xs text-amber-600 hover:underline">← Back to Parties</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link href="/admin/parties" className="icon-btn-view">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{party.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Party Detail</p>
        </div>
      </div>

      {/* Detail card */}
      <div className="rounded-2xl bg-white ring-1 ring-black/5 divide-y divide-black/5">
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm font-semibold text-gray-900">Party Information</p>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 capitalize ${typeColor[party.type] ?? typeColor.retailer}`}>
            {party.type}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-black/5">
          {[
            { icon: Building2, label: "Company", value: party.name },
            { icon: Hash, label: "GSTIN", value: party.gstNo || "—" },
            { icon: Phone, label: "Contact", value: party.phone || "—" },
            { icon: MapPin, label: "City", value: party.city || "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 px-6 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200 text-amber-600">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {party.address && (
          <div className="px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1">Address</p>
            <p className="text-sm text-gray-800">{party.address}</p>
          </div>
        )}
      </div>

      {/* Balance card */}
      <PartyBalanceCard partyId={id} />

      {/* Order history */}
      <PartyOrdersCard partyId={id} />
    </div>
  );
}
