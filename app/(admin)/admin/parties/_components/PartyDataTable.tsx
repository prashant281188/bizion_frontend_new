"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminGetParties,
  adminCreateParty,
  adminUpdateParty,
  adminDeleteParty,
  type Party,
  type PartyType,
  type GstRegistrationType,
  type CreatePartyPayload,
  type UpdatePartyPayload,
} from "@/lib/api/admin";
import { useSearch } from "@/hooks/use-debounce";
import { useBackdrop } from "@/providers/backdrop-provider";

const PARTY_TYPES: PartyType[] = ["retailer", "supplier", "customer", "distributor"];
const GST_REG_TYPES: GstRegistrationType[] = ["regular", "composition", "unregistered", "consumer", "sez", "overseas"];

const INDIAN_STATES: { name: string; code: string }[] = [
  { name: "Andaman and Nicobar Islands", code: "35" },
  { name: "Andhra Pradesh", code: "37" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Assam", code: "18" },
  { name: "Bihar", code: "10" },
  { name: "Chandigarh", code: "04" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
  { name: "Delhi", code: "07" },
  { name: "Goa", code: "30" },
  { name: "Gujarat", code: "24" },
  { name: "Haryana", code: "06" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jammu and Kashmir", code: "01" },
  { name: "Jharkhand", code: "20" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Ladakh", code: "38" },
  { name: "Lakshadweep", code: "31" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Maharashtra", code: "27" },
  { name: "Manipur", code: "14" },
  { name: "Meghalaya", code: "17" },
  { name: "Mizoram", code: "15" },
  { name: "Nagaland", code: "13" },
  { name: "Odisha", code: "21" },
  { name: "Puducherry", code: "34" },
  { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" },
  { name: "Sikkim", code: "11" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Tripura", code: "16" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Uttarakhand", code: "05" },
  { name: "West Bengal", code: "19" },
];

const typeColor: Record<string, string> = {
  retailer: "bg-blue-50 text-blue-600 ring-blue-200",
  supplier: "bg-violet-50 text-violet-600 ring-violet-200",
  customer: "bg-emerald-50 text-emerald-600 ring-emerald-200",
  distributor: "bg-amber-50 text-amber-700 ring-amber-200",
};

type FormState = {
  name: string;
  tradeName: string;
  contactPerson: string;
  phone: string;
  altPhone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  stateCode: string;
  pincode: string;
  country: string;
  type: PartyType;
  gstNo: string;
  gstRegistrationType: GstRegistrationType;
  panNo: string;
  isRcmApplicable: boolean;
  ecomGstin: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  notes: string;
  isActive: boolean;
};

const empty: FormState = {
  name: "",
  tradeName: "",
  contactPerson: "",
  phone: "",
  altPhone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  state: "",
  stateCode: "",
  pincode: "",
  country: "India",
  type: "retailer",
  gstNo: "",
  gstRegistrationType: "unregistered",
  panNo: "",
  isRcmApplicable: false,
  ecomGstin: "",
  bankName: "",
  bankAccountNo: "",
  bankIfsc: "",
  bankBranch: "",
  notes: "",
  isActive: true,
};

function partyToForm(p: Party): FormState {
  return {
    name: p.name,
    tradeName: p.tradeName ?? "",
    contactPerson: p.contactPerson ?? "",
    phone: p.phone ?? "",
    altPhone: p.altPhone ?? "",
    email: p.email ?? "",
    addressLine1: p.addressLine1 ?? "",
    addressLine2: p.addressLine2 ?? "",
    city: p.city ?? "",
    district: p.district ?? "",
    state: p.state ?? "",
    stateCode: p.stateCode ?? "",
    pincode: p.pincode ?? "",
    country: p.country ?? "India",
    type: (p.type as PartyType) ?? "retailer",
    gstNo: p.gstNo ?? "",
    gstRegistrationType: (p.gstRegistrationType as GstRegistrationType) ?? "unregistered",
    panNo: p.panNo ?? "",
    isRcmApplicable: p.isRcmApplicable ?? false,
    ecomGstin: p.ecomGstin ?? "",
    bankName: p.bankName ?? "",
    bankAccountNo: p.bankAccountNo ?? "",
    bankIfsc: p.bankIfsc ?? "",
    bankBranch: p.bankBranch ?? "",
    notes: p.notes ?? "",
    isActive: p.isActive ?? true,
  };
}

function formToPayload(form: FormState): CreatePartyPayload {
  return {
    name: form.name,
    tradeName: form.tradeName || undefined,
    contactPerson: form.contactPerson || undefined,
    phone: form.phone || undefined,
    altPhone: form.altPhone || undefined,
    email: form.email || undefined,
    addressLine1: form.addressLine1 || undefined,
    addressLine2: form.addressLine2 || undefined,
    city: form.city || undefined,
    district: form.district || undefined,
    state: form.state || undefined,
    stateCode: form.stateCode || undefined,
    pincode: form.pincode || undefined,
    country: form.country || undefined,
    type: form.type,
    gstNo: form.gstNo || undefined,
    gstRegistrationType: form.gstRegistrationType,
    panNo: form.panNo || undefined,
    isRcmApplicable: form.isRcmApplicable,
    ecomGstin: form.ecomGstin || undefined,
    bankName: form.bankName || undefined,
    bankAccountNo: form.bankAccountNo || undefined,
    bankIfsc: form.bankIfsc || undefined,
    bankBranch: form.bankBranch || undefined,
    notes: form.notes || undefined,
    isActive: form.isActive,
  };
}

export default function PartyDataTable() {
  const qc = useQueryClient();
  const { show, hide } = useBackdrop();
  const { value: search, query: debouncedSearch, onChange: onSearchChange } = useSearch(400);
  const [typeFilter, setTypeFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: parties = [], isLoading } = useQuery({
    queryKey: ["admin-parties", debouncedSearch, typeFilter],
    queryFn: () => adminGetParties({ search: debouncedSearch || undefined, type: typeFilter as PartyType || undefined }),
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = formToPayload(form);
      return editing
        ? adminUpdateParty(editing.id, payload as UpdatePartyPayload)
        : adminCreateParty(payload);
    },
    onMutate: () => show(editing ? "Updating party…" : "Creating party…"),
    onSettled: () => hide(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-parties"] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteParty(id),
    onMutate: () => show("Deleting party…"),
    onSettled: () => hide(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-parties"] }); setDeleteTarget(null); },
  });

  function openAdd() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(p: Party) { setEditing(p); setForm(partyToForm(p)); setOpen(true); }

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const totalPages = Math.max(1, Math.ceil(parties.length / limit));
  const paged = parties.slice((page - 1) * limit, page * limit);

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Parties</h1>
            <p className="page-subtitle">{isLoading ? "Loading…" : `${parties.length} parties total`}</p>
          </div>
          <Button size="sm" className="btn-amber rounded-lg" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Party
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={(e) => { onSearchChange(e); setPage(1); }} placeholder="Search name, GST…" className="pl-8 h-8 text-sm rounded-lg border-black/10" />
          </div>
          <Select value={typeFilter || "__all__"} onValueChange={(v) => { setTypeFilter(v === "__all__" ? "" : v); setPage(1); }}>
            <SelectTrigger className="h-8 text-sm w-[140px] rounded-lg border-black/10">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {PARTY_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-neutral-100 animate-pulse" style={{ animationDelay: `${i * 40}ms` }} />
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="empty-state">
            <Building2 className="empty-state-icon" />
            <p className="empty-state-title">No parties found</p>
            <p className="empty-state-subtitle">{search || typeFilter ? "Try adjusting filters" : "Add your first party to get started"}</p>
          </div>
        ) : (
          <div className="data-table">
            <div className="grid grid-cols-[1fr_140px_140px_120px_80px] items-center px-4 py-2.5 gap-4 bg-neutral-50 border-b border-black/5">
              <span className="data-table-th">Name</span>
              <span className="data-table-th">GST No</span>
              <span className="data-table-th">Phone</span>
              <span className="data-table-th">Type</span>
              <span className="data-table-th text-right">Actions</span>
            </div>
            <div className="data-table-body">
              {paged.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-up grid grid-cols-[1fr_140px_140px_120px_80px] items-center px-4 py-2.5 gap-4 hover:bg-neutral-50/80 transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="min-w-0">
                    <Link href={`/admin/parties/${p.id}`} className="text-sm font-semibold text-gray-900 truncate block hover:text-amber-600 transition-colors">
                      {p.name}
                    </Link>
                    {p.city && <p className="text-xs text-muted-foreground truncate">{p.city}</p>}
                  </div>
                  <span className="text-sm font-mono text-muted-foreground truncate">{p.gstNo || "—"}</span>
                  <span className="text-sm text-gray-700 truncate">{p.phone || "—"}</span>
                  <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 capitalize ${typeColor[p.type] ?? typeColor.retailer}`}>
                    {p.type}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="icon-btn-edit"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteTarget(p)} className="icon-btn-delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, parties.length)} of {parties.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-amber-500 text-black" : "border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-muted-foreground hover:border-amber-500 hover:text-amber-600 disabled:opacity-30 transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Party" : "Add Party"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="gst">GST</TabsTrigger>
              <TabsTrigger value="bank">Banking</TabsTrigger>
            </TabsList>

            {/* Basic */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid gap-1.5">
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={set("name")} placeholder="Party / Company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>Trade Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input value={form.tradeName} onChange={set("tradeName")} placeholder="Trade name" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Contact Person <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input value={form.contactPerson} onChange={set("contactPerson")} placeholder="Contact name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input value={form.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Alt Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input value={form.altPhone} onChange={set("altPhone")} placeholder="Alternate number" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input type="email" value={form.email} onChange={set("email")} placeholder="email@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as PartyType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARTY_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Active</Label>
                  <div className="flex items-center h-9 gap-2">
                    <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
                    <span className="text-sm text-muted-foreground">{form.isActive ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.notes} onChange={set("notes")} placeholder="Internal notes" />
              </div>
            </TabsContent>

            {/* Address */}
            <TabsContent value="address" className="space-y-4 pt-4">
              <div className="grid gap-1.5">
                <Label>Address Line 1</Label>
                <Input value={form.addressLine1} onChange={set("addressLine1")} placeholder="Street / Building" />
              </div>
              <div className="grid gap-1.5">
                <Label>Address Line 2</Label>
                <Input value={form.addressLine2} onChange={set("addressLine2")} placeholder="Area / Locality" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>City</Label>
                  <Input value={form.city} onChange={set("city")} placeholder="City" />
                </div>
                <div className="grid gap-1.5">
                  <Label>District</Label>
                  <Input value={form.district} onChange={set("district")} placeholder="District" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-1.5 col-span-2">
                  <Label>State</Label>
                  <Select
                    value={form.state || "__none__"}
                    onValueChange={(v) => {
                      if (v === "__none__") {
                        setForm((f) => ({ ...f, state: "", stateCode: "" }));
                      } else {
                        const match = INDIAN_STATES.find((s) => s.name === v);
                        setForm((f) => ({ ...f, state: v, stateCode: match?.code ?? "" }));
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— None —</SelectItem>
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>State Code</Label>
                  <Input value={form.stateCode} readOnly className="bg-neutral-50 text-muted-foreground" placeholder="Auto" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Pincode</Label>
                  <Input value={form.pincode} onChange={set("pincode")} placeholder="110001" maxLength={6} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={set("country")} placeholder="India" />
              </div>
            </TabsContent>

            {/* GST */}
            <TabsContent value="gst" className="space-y-4 pt-4">
              <div className="grid gap-1.5">
                <Label>GSTIN <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.gstNo} onChange={set("gstNo")} placeholder="09ABCDE1234F1Z5" className="uppercase" />
              </div>
              <div className="grid gap-1.5">
                <Label>GST Registration Type</Label>
                <Select value={form.gstRegistrationType} onValueChange={(v) => setForm((f) => ({ ...f, gstRegistrationType: v as GstRegistrationType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GST_REG_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>PAN <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.panNo} onChange={set("panNo")} placeholder="ABCDE1234F" className="uppercase" />
              </div>
              <div className="grid gap-1.5">
                <Label>E-Commerce GSTIN <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input value={form.ecomGstin} onChange={set("ecomGstin")} placeholder="E-commerce operator GSTIN" className="uppercase" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isRcmApplicable} onCheckedChange={(v) => setForm((f) => ({ ...f, isRcmApplicable: v }))} />
                <Label>RCM Applicable</Label>
              </div>
            </TabsContent>

            {/* Banking */}
            <TabsContent value="bank" className="space-y-4 pt-4">
              <div className="grid gap-1.5">
                <Label>Bank Name</Label>
                <Input value={form.bankName} onChange={set("bankName")} placeholder="Bank name" />
              </div>
              <div className="grid gap-1.5">
                <Label>Account Number</Label>
                <Input value={form.bankAccountNo} onChange={set("bankAccountNo")} placeholder="Account number" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>IFSC Code</Label>
                  <Input value={form.bankIfsc} onChange={set("bankIfsc")} placeholder="SBIN0001234" className="uppercase" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Branch</Label>
                  <Input value={form.bankBranch} onChange={set("bankBranch")} placeholder="Branch name" />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending} className="btn-amber">
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Party"
        description={<>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        isPending={remove.isPending}
      />
    </>
  );
}
