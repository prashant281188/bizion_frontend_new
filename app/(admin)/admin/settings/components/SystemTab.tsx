"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api/axios";

type SystemConfig = {
  currency: string;
  dateFormat: string;
  timezone: string;
  language: string;
};

const defaults: SystemConfig = {
  currency: "inr",
  dateFormat: "dd/mm/yyyy",
  timezone: "Asia/Kolkata",
  language: "en",
};

export default function SystemTab() {
  const [config, setConfig] = useState<SystemConfig>(defaults);

  const set = (key: keyof SystemConfig) => (value: string) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const save = useMutation({
    mutationFn: () => api.patch("/settings/system", config),
    onSuccess: () => toast.success("System settings saved."),
    onError: () => toast.error("Failed to save system settings."),
  });

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>Global settings that affect the entire application.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 max-w-md">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Locale</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-1.5">
            <Label>Currency</Label>
            <Select value={config.currency} onValueChange={set("currency")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inr">INR — Indian Rupee (₹)</SelectItem>
                <SelectItem value="usd">USD — US Dollar ($)</SelectItem>
                <SelectItem value="eur">EUR — Euro (€)</SelectItem>
                <SelectItem value="gbp">GBP — British Pound (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Date Format</Label>
            <Select value={config.dateFormat} onValueChange={set("dateFormat")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Timezone</Label>
            <Select value={config.timezone} onValueChange={set("timezone")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Language</Label>
            <Select value={config.language} onValueChange={set("language")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="btn-amber">
            {save.isPending ? "Saving…" : "Save System Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
