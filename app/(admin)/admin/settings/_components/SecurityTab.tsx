"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/api/auth";
import { useBackdrop } from "@/providers/backdrop-provider";

type Form = { current: string; next: string; confirm: string };
const empty: Form = { current: "", next: "", confirm: "" };

export default function SecurityTab() {
  const [form, setForm] = useState<Form>(empty);
  const { show, hide } = useBackdrop();

  const save = useMutation({
    mutationFn: () => changePassword({ currentPassword: form.current, newPassword: form.next }),
    onMutate: () => show("Changing password…"),
    onSettled: () => hide(),
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setForm(empty);
    },
    onError: () => toast.error("Current password is incorrect or request failed."),
  });

  const handleSubmit = () => {
    if (!form.current || !form.next || !form.confirm) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (form.next !== form.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (form.next.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    save.mutate();
  };

  const field = (label: string, key: keyof Form) => (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input
        type="password"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder="••••••••"
      />
    </div>
  );

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Change your account password. You will need your current password.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 max-w-md">
        {field("Current Password", "current")}
        {field("New Password", "next")}
        {field("Confirm New Password", "confirm")}

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={save.isPending} className="btn-amber">
            {save.isPending ? "Updating…" : "Change Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
