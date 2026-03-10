"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SecurityTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Current Password</Label>
          <Input type="password" />
        </div>

        <div>
          <Label>New Password</Label>
          <Input type="password" />
        </div>

        <div>
          <Label>Confirm Password</Label>
          <Input type="password" />
        </div>

        <Button>Change Password</Button>
      </CardContent>
    </Card>
  );
}