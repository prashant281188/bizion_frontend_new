"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/axios";
import { useBackdrop } from "@/providers/backdrop-provider";

type BusinessForm = {
  businessName: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
};

const empty: BusinessForm = {
  businessName: "",
  gstin: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
};

export default function BusinessTab() {
  const [form, setForm] = useState<BusinessForm>(empty);
  const { show, hide } = useBackdrop();

  const set = (key: keyof BusinessForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = useMutation({
    mutationFn: () => api.patch("/settings/business", form),
    onMutate: () => show("Saving business info…"),
    onSettled: () => hide(),
    onSuccess: () => toast.success("Business information updated."),
    onError: () => toast.error("Failed to save business information."),
  });

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle>Business Details</CardTitle>
        <CardDescription>Your company information used on invoices and documents.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 max-w-lg">
        <div className="grid gap-1.5">
          <Label>Business Name</Label>
          <Input value={form.businessName} onChange={set("businessName")} placeholder="e.g. Himani Enterprises" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>GSTIN</Label>
            <Input value={form.gstin} onChange={set("gstin")} placeholder="e.g. 09ABCDE1234F1Z5" />
          </div>
          <div className="grid gap-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX" />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="business@company.com" />
        </div>

        <div className="grid gap-1.5">
          <Label>Address</Label>
          <Textarea value={form.address} onChange={set("address")} placeholder="Street address" rows={2} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-1.5">
            <Label>City</Label>
            <Input value={form.city} onChange={set("city")} placeholder="City" />
          </div>
          <div className="grid gap-1.5">
            <Label>State</Label>
            <Input value={form.state} onChange={set("state")} placeholder="State" />
          </div>
          <div className="grid gap-1.5">
            <Label>Pincode</Label>
            <Input value={form.pincode} onChange={set("pincode")} placeholder="000000" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="btn-amber">
            {save.isPending ? "Saving…" : "Save Business Info"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
