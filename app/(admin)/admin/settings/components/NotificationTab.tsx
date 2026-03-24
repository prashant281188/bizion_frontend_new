"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api/axios";

type Prefs = {
  emailNewOrder: boolean;
  emailLowStock: boolean;
  emailWeeklyReport: boolean;
  smsNewOrder: boolean;
  smsPaymentReceived: boolean;
};

const defaults: Prefs = {
  emailNewOrder: true,
  emailLowStock: true,
  emailWeeklyReport: false,
  smsNewOrder: false,
  smsPaymentReceived: false,
};

const Row = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="space-y-0.5">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default function NotificationTab() {
  const [prefs, setPrefs] = useState<Prefs>(defaults);

  const toggle = (key: keyof Prefs) => (v: boolean) => setPrefs((p) => ({ ...p, [key]: v }));

  const save = useMutation({
    mutationFn: () => api.patch("/settings/notifications", prefs),
    onSuccess: () => toast.success("Notification preferences saved."),
    onError: () => toast.error("Failed to save preferences."),
  });

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how and when you want to be notified.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 max-w-lg">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
        </div>
        <div className="space-y-4">
          <Row label="New Order" description="Get notified when a new order is placed." checked={prefs.emailNewOrder} onChange={toggle("emailNewOrder")} />
          <Row label="Low Stock Alert" description="Alert when product stock falls below threshold." checked={prefs.emailLowStock} onChange={toggle("emailLowStock")} />
          <Row label="Weekly Report" description="Receive a weekly summary of activity." checked={prefs.emailWeeklyReport} onChange={toggle("emailWeeklyReport")} />
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SMS</p>
        </div>
        <div className="space-y-4">
          <Row label="New Order" description="SMS alert for every new order." checked={prefs.smsNewOrder} onChange={toggle("smsNewOrder")} />
          <Row label="Payment Received" description="SMS when a payment is confirmed." checked={prefs.smsPaymentReceived} onChange={toggle("smsPaymentReceived")} />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="btn-amber">
            {save.isPending ? "Saving…" : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
