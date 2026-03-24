"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { updateProfile } from "@/lib/api/auth";

export default function ProfileTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");

  const save = useMutation({
    mutationFn: () => updateProfile({ name: name || undefined, email: email || undefined }),
    onSuccess: () => {
      toast.success("Profile updated.");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => toast.error("Failed to update profile."),
  });

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your account display name and email address.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 max-w-md">
        <div className="grid gap-1.5">
          <Label>Display Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={user?.email ?? "your@email.com"}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-muted-foreground text-xs">Role</Label>
          <p className="text-sm font-medium capitalize">{user?.role?.name ?? "—"}</p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="btn-amber"
          >
            {save.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
