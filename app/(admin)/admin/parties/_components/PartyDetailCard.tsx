import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Party } from "@/lib/api/admin";

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

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <p><span className="font-medium text-gray-700">{label}:</span> {value}</p>
  );
}

const PartyDetailCard = ({ partyDetail: p, className }: PartyDetailCardProps) => (
  <Card className={cn(className, "w-full")}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
        {p.tradeName && <p className="text-xs text-muted-foreground">{p.tradeName}</p>}
      </div>
      <div className="flex items-center gap-2">
        {p.isActive === false && (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200">
            Inactive
          </span>
        )}
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 capitalize ${typeColor[p.type] ?? typeColor.retailer}`}>
          {p.type}
        </span>
      </div>
    </CardHeader>
    <CardContent className="space-y-1 text-sm text-muted-foreground">
      <Row label="Contact" value={p.contactPerson} />
      <Row label="Phone" value={p.phone} />
      <Row label="Alt Phone" value={p.altPhone} />
      <Row label="Email" value={p.email} />
      {(p.addressLine1 || p.city) && (
        <p>
          <span className="font-medium text-gray-700">Address:</span>{" "}
          {[p.addressLine1, p.addressLine2, p.city, p.district, p.state, p.pincode].filter(Boolean).join(", ")}
        </p>
      )}
      <Row label="GSTIN" value={p.gstNo} />
      <Row label="GST Type" value={p.gstRegistrationType} />
      <Row label="PAN" value={p.panNo} />
      {p.isRcmApplicable && <p className="text-xs text-amber-600 font-medium">RCM Applicable</p>}
      <Row label="Bank" value={p.bankName} />
      <Row label="Account No" value={p.bankAccountNo} />
      <Row label="IFSC" value={p.bankIfsc} />
    </CardContent>
  </Card>
);

export default PartyDetailCard;
