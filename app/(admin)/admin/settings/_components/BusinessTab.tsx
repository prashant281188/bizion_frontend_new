"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api/axios";
import { useBackdrop } from "@/providers/backdrop-provider";
import { cn } from "@/lib/utils";

/* ── Schema (mirror of backend) ─────────────────────────── */
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex   = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex  = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const pinRegex   = /^[1-9][0-9]{5}$/;
const tanRegex   = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

const schema = z.object({
  legalName:    z.string().trim().min(1, "Legal name is required"),
  tradeName:    z.string().trim().optional(),
  businessType: z.enum([
    "sole_proprietorship", "partnership", "llp", "private_limited",
    "public_limited", "one_person_company", "huf", "trust", "society",
    "ngo", "government", "other",
  ]).default("sole_proprietorship"),

  primaryPhone: z.string().trim().min(10, "Phone must be at least 10 digits"),
  altPhone:     z.string().trim().optional(),
  primaryEmail: z.string().trim().email("Invalid email"),
  altEmail:     z.string().trim().email("Invalid email").optional().or(z.literal("")),
  websiteUrl:   z.string().trim().url("Invalid URL").optional().or(z.literal("")),

  addressLine1: z.string().trim().min(1, "Address line 1 is required"),
  addressLine2: z.string().trim().optional(),
  city:         z.string().trim().min(1, "City is required"),
  district:     z.string().trim().optional(),
  state:        z.string().trim().min(1, "State is required"),
  stateCode:    z.string().trim().regex(/^[0-9]{2}$/, "Must be 2 digits"),
  pincode:      z.string().trim().regex(pinRegex, "Invalid 6-digit pincode"),
  country:      z.string().trim().default("India"),

  gstin:               z.string().trim().regex(gstinRegex, "Invalid GSTIN").optional().or(z.literal("")),
  gstRegistrationType: z.enum(["regular", "composition", "unregistered", "sez_unit", "sez_developer"]).default("unregistered"),
  panNo:               z.string().trim().regex(panRegex, "Invalid PAN").optional().or(z.literal("")),
  tanNo:               z.string().trim().regex(tanRegex, "Invalid TAN").optional().or(z.literal("")),
  cin:                 z.string().trim().optional(),
  llpin:               z.string().trim().optional(),
  udyamNo:             z.string().trim().optional(),
  iecCode:             z.string().trim().optional(),
  fssaiLicenseNo:      z.string().trim().optional(),
  drugLicenseNo:       z.string().trim().optional(),
  shopEstablishmentNo: z.string().trim().optional(),

  isRcmApplicable:     z.boolean().default(false),
  isTdsApplicable:     z.boolean().default(false),
  isTcsApplicable:     z.boolean().default(false),
  isEwayBillRequired:  z.boolean().default(false),
  isEInvoicingEnabled: z.boolean().default(false),
  eWayBillThreshold:   z.number().int().min(0).default(50000),

  financialYearStart: z.enum(["april", "january"]).default("april"),

  invoicePrefix:             z.string().trim().default("INV"),
  creditNotePrefix:          z.string().trim().default("CN"),
  debitNotePrefix:           z.string().trim().default("DN"),
  purchaseOrderPrefix:       z.string().trim().default("PO"),
  challanPrefix:             z.string().trim().default("DC"),
  invoiceTermsAndConditions: z.string().trim().optional(),
  invoiceNotes:              z.string().trim().optional(),

  bankName:        z.string().trim().optional(),
  bankAccountNo:   z.string().trim().optional(),
  bankIfsc:        z.string().trim().regex(ifscRegex, "Invalid IFSC").optional().or(z.literal("")),
  bankMicr:        z.string().trim().optional(),
  bankBranch:      z.string().trim().optional(),
  bankAccountType: z.enum(["current", "savings", "cc", "od"]).default("current"),
  upiId:           z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  legalName: "", tradeName: "", businessType: "sole_proprietorship",
  primaryPhone: "", altPhone: "", primaryEmail: "", altEmail: "", websiteUrl: "",
  addressLine1: "", addressLine2: "", city: "", district: "", state: "",
  stateCode: "", pincode: "", country: "India",
  gstin: "", gstRegistrationType: "unregistered", panNo: "", tanNo: "",
  cin: "", llpin: "", udyamNo: "", iecCode: "", fssaiLicenseNo: "",
  drugLicenseNo: "", shopEstablishmentNo: "",
  isRcmApplicable: false, isTdsApplicable: false, isTcsApplicable: false,
  isEwayBillRequired: false, isEInvoicingEnabled: false, eWayBillThreshold: 50000,
  financialYearStart: "april",
  invoicePrefix: "INV", creditNotePrefix: "CN", debitNotePrefix: "DN",
  purchaseOrderPrefix: "PO", challanPrefix: "DC",
  invoiceTermsAndConditions: "", invoiceNotes: "",
  bankName: "", bankAccountNo: "", bankIfsc: "", bankMicr: "",
  bankBranch: "", bankAccountType: "current", upiId: "",
};

/* ── Section accordion ───────────────────────────────────── */
function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-black/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-neutral-50/60 hover:bg-neutral-50 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────────── */
function Field({ label, error, required, children, className }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ── Toggle row ──────────────────────────────────────────── */
function ToggleRow({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <Checkbox
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
      />
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

/* ── Label maps ──────────────────────────────────────────── */
const BUSINESS_TYPES = [
  ["sole_proprietorship", "Sole Proprietorship"],
  ["partnership", "Partnership"],
  ["llp", "LLP"],
  ["private_limited", "Private Limited"],
  ["public_limited", "Public Limited"],
  ["one_person_company", "One Person Company"],
  ["huf", "HUF"],
  ["trust", "Trust"],
  ["society", "Society"],
  ["ngo", "NGO"],
  ["government", "Government"],
  ["other", "Other"],
] as const;

const GST_REG_TYPES = [
  ["regular", "Regular"],
  ["composition", "Composition"],
  ["unregistered", "Unregistered"],
  ["sez_unit", "SEZ Unit"],
  ["sez_developer", "SEZ Developer"],
] as const;

const BANK_ACCOUNT_TYPES = [
  ["current", "Current"],
  ["savings", "Savings"],
  ["cc", "Cash Credit"],
  ["od", "Overdraft"],
] as const;

/* ── Component ───────────────────────────────────────────── */
export default function BusinessTab() {
  const { show, hide } = useBackdrop();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: DEFAULTS,
  });

  /* Fetch existing business data */
  const { data: businessData, isLoading } = useQuery({
    queryKey: ["business-settings"],
    queryFn: () => api.get("/business").then((r) => r.data?.data ?? r.data),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!businessData) return;
    reset({ ...DEFAULTS, ...businessData });
  }, [businessData, reset]);

  /* Save */
  const save = useMutation({
    mutationFn: (data: FormValues) => api.patch("/business", data),
    onMutate: () => show("Saving business info…"),
    onSettled: () => hide(),
    onSuccess: () => toast.success("Business information saved"),
    onError: () => toast.error("Failed to save"),
  });

  const onSubmit = (data: FormValues) => save.mutate(data);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-none rounded-none">
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle>Business Details</CardTitle>
        <CardDescription>Company information used on invoices and legal documents.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-w-2xl">

          {/* ── Business Identity ── */}
          <Section title="Business Identity" defaultOpen>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Legal Name" required error={errors.legalName?.message} className="sm:col-span-2">
                <Input {...register("legalName")} placeholder="e.g. Himani Enterprises Pvt Ltd" className={cn("rounded-lg", errors.legalName && "border-red-400")} />
              </Field>
              <Field label="Trade Name" error={errors.tradeName?.message}>
                <Input {...register("tradeName")} placeholder="DBA / Trade name" className="rounded-lg" />
              </Field>
              <Field label="Business Type">
                <Controller control={control} name="businessType" render={({ field }) => (
                  <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </Field>
            </div>
          </Section>

          {/* ── Contact ── */}
          <Section title="Contact Information" defaultOpen>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Primary Phone" required error={errors.primaryPhone?.message}>
                <Input {...register("primaryPhone")} placeholder="+91 98765 43210" className={cn("rounded-lg", errors.primaryPhone && "border-red-400")} />
              </Field>
              <Field label="Alt Phone" error={errors.altPhone?.message}>
                <Input {...register("altPhone")} placeholder="Optional" className="rounded-lg" />
              </Field>
              <Field label="Primary Email" required error={errors.primaryEmail?.message}>
                <Input {...register("primaryEmail")} type="email" placeholder="info@company.com" className={cn("rounded-lg", errors.primaryEmail && "border-red-400")} />
              </Field>
              <Field label="Alt Email" error={errors.altEmail?.message}>
                <Input {...register("altEmail")} type="email" placeholder="Optional" className="rounded-lg" />
              </Field>
              <Field label="Website" error={errors.websiteUrl?.message} className="sm:col-span-2">
                <Input {...register("websiteUrl")} placeholder="https://www.company.com" className="rounded-lg" />
              </Field>
            </div>
          </Section>

          {/* ── Address ── */}
          <Section title="Address" defaultOpen>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Address Line 1" required error={errors.addressLine1?.message} className="sm:col-span-2">
                <Input {...register("addressLine1")} placeholder="Street / Building" className={cn("rounded-lg", errors.addressLine1 && "border-red-400")} />
              </Field>
              <Field label="Address Line 2" className="sm:col-span-2">
                <Input {...register("addressLine2")} placeholder="Area / Landmark (optional)" className="rounded-lg" />
              </Field>
              <Field label="City" required error={errors.city?.message}>
                <Input {...register("city")} placeholder="City" className={cn("rounded-lg", errors.city && "border-red-400")} />
              </Field>
              <Field label="District">
                <Input {...register("district")} placeholder="District" className="rounded-lg" />
              </Field>
              <Field label="State" required error={errors.state?.message}>
                <Input {...register("state")} placeholder="State" className={cn("rounded-lg", errors.state && "border-red-400")} />
              </Field>
              <Field label="State Code" required error={errors.stateCode?.message}>
                <Input {...register("stateCode")} placeholder="e.g. 09" maxLength={2} className={cn("rounded-lg", errors.stateCode && "border-red-400")} />
              </Field>
              <Field label="Pincode" required error={errors.pincode?.message}>
                <Input {...register("pincode")} placeholder="6-digit pincode" maxLength={6} className={cn("rounded-lg", errors.pincode && "border-red-400")} />
              </Field>
              <Field label="Country">
                <Input {...register("country")} placeholder="India" className="rounded-lg" />
              </Field>
            </div>
          </Section>

          {/* ── Tax & Registration ── */}
          <Section title="Tax & Registration">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="GSTIN" error={errors.gstin?.message}>
                <Input {...register("gstin")} placeholder="e.g. 09ABCDE1234F1Z5" className={cn("rounded-lg uppercase", errors.gstin && "border-red-400")} />
              </Field>
              <Field label="GST Registration Type">
                <Controller control={control} name="gstRegistrationType" render={({ field }) => (
                  <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GST_REG_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </Field>
              <Field label="PAN" error={errors.panNo?.message}>
                <Input {...register("panNo")} placeholder="e.g. ABCDE1234F" className={cn("rounded-lg uppercase", errors.panNo && "border-red-400")} />
              </Field>
              <Field label="TAN" error={errors.tanNo?.message}>
                <Input {...register("tanNo")} placeholder="e.g. ABCD12345E" className={cn("rounded-lg uppercase", errors.tanNo && "border-red-400")} />
              </Field>
              <Field label="CIN">
                <Input {...register("cin")} placeholder="Company Identification Number" className="rounded-lg" />
              </Field>
              <Field label="LLPIN">
                <Input {...register("llpin")} placeholder="LLP Identification Number" className="rounded-lg" />
              </Field>
              <Field label="Udyam No.">
                <Input {...register("udyamNo")} placeholder="UDYAM-XX-00-0000000" className="rounded-lg" />
              </Field>
              <Field label="IEC Code">
                <Input {...register("iecCode")} placeholder="Import Export Code" className="rounded-lg" />
              </Field>
              <Field label="FSSAI License No.">
                <Input {...register("fssaiLicenseNo")} placeholder="14-digit FSSAI number" className="rounded-lg" />
              </Field>
              <Field label="Drug License No.">
                <Input {...register("drugLicenseNo")} placeholder="Drug license number" className="rounded-lg" />
              </Field>
              <Field label="Shop Establishment No." className="sm:col-span-2">
                <Input {...register("shopEstablishmentNo")} placeholder="Shop / establishment registration" className="rounded-lg" />
              </Field>
            </div>
          </Section>

          {/* ── Compliance Toggles ── */}
          <Section title="Compliance & Tax Settings">
            <div className="space-y-3">
              <Controller control={control} name="isRcmApplicable" render={({ field }) => (
                <ToggleRow label="RCM Applicable" description="Reverse Charge Mechanism is applicable" checked={field.value} onChange={field.onChange} />
              )} />
              <Controller control={control} name="isTdsApplicable" render={({ field }) => (
                <ToggleRow label="TDS Applicable" description="Tax Deducted at Source" checked={field.value} onChange={field.onChange} />
              )} />
              <Controller control={control} name="isTcsApplicable" render={({ field }) => (
                <ToggleRow label="TCS Applicable" description="Tax Collected at Source" checked={field.value} onChange={field.onChange} />
              )} />
              <Controller control={control} name="isEwayBillRequired" render={({ field }) => (
                <ToggleRow label="e-Way Bill Required" description="Generate e-way bills for qualifying consignments" checked={field.value} onChange={field.onChange} />
              )} />
              <Controller control={control} name="isEInvoicingEnabled" render={({ field }) => (
                <ToggleRow label="e-Invoicing Enabled" description="GST e-Invoice system integration" checked={field.value} onChange={field.onChange} />
              )} />
              <Field label="e-Way Bill Threshold (₹)" error={errors.eWayBillThreshold?.message} className="max-w-xs">
                <Input
                  type="number" min={0}
                  {...register("eWayBillThreshold", { valueAsNumber: true })}
                  placeholder="50000"
                  className="rounded-lg"
                />
              </Field>
              <Field label="Financial Year Start">
                <Controller control={control} name="financialYearStart" render={({ field }) => (
                  <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-lg w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="april">April (Apr – Mar)</SelectItem>
                      <SelectItem value="january">January (Jan – Dec)</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </Field>
            </div>
          </Section>

          {/* ── Document Settings ── */}
          <Section title="Document Prefixes & Settings">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Invoice Prefix">
                <Input {...register("invoicePrefix")} placeholder="INV" className="rounded-lg" />
              </Field>
              <Field label="Credit Note Prefix">
                <Input {...register("creditNotePrefix")} placeholder="CN" className="rounded-lg" />
              </Field>
              <Field label="Debit Note Prefix">
                <Input {...register("debitNotePrefix")} placeholder="DN" className="rounded-lg" />
              </Field>
              <Field label="Purchase Order Prefix">
                <Input {...register("purchaseOrderPrefix")} placeholder="PO" className="rounded-lg" />
              </Field>
              <Field label="Challan Prefix">
                <Input {...register("challanPrefix")} placeholder="DC" className="rounded-lg" />
              </Field>
            </div>
            <Field label="Invoice Terms & Conditions" className="mt-2">
              <Textarea {...register("invoiceTermsAndConditions")} rows={3} placeholder="Payment due within 30 days…" className="rounded-lg resize-none" />
            </Field>
            <Field label="Invoice Notes">
              <Textarea {...register("invoiceNotes")} rows={2} placeholder="Thank you for your business." className="rounded-lg resize-none" />
            </Field>
          </Section>

          {/* ── Banking ── */}
          <Section title="Banking Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Bank Name">
                <Input {...register("bankName")} placeholder="e.g. HDFC Bank" className="rounded-lg" />
              </Field>
              <Field label="Account Type">
                <Controller control={control} name="bankAccountType" render={({ field }) => (
                  <Select key={field.value} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BANK_ACCOUNT_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </Field>
              <Field label="Account Number">
                <Input {...register("bankAccountNo")} placeholder="Account number" className="rounded-lg" />
              </Field>
              <Field label="IFSC Code" error={errors.bankIfsc?.message}>
                <Input {...register("bankIfsc")} placeholder="e.g. HDFC0001234" className={cn("rounded-lg uppercase", errors.bankIfsc && "border-red-400")} />
              </Field>
              <Field label="MICR Code">
                <Input {...register("bankMicr")} placeholder="9-digit MICR" className="rounded-lg" />
              </Field>
              <Field label="Branch">
                <Input {...register("bankBranch")} placeholder="Branch name / city" className="rounded-lg" />
              </Field>
              <Field label="UPI ID" className="sm:col-span-2">
                <Input {...register("upiId")} placeholder="e.g. business@upi" className="rounded-lg" />
              </Field>
            </div>
          </Section>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={save.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg"
            >
              {save.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save Business Info</>
              )}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
