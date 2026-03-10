"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function BusinessTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Business Name</Label>
          <Input placeholder="Enter business name" />
        </div>

        <div>
          <Label>GST Number</Label>
          <Input placeholder="Enter GST number" />
        </div>

        <div>
          <Label>Business Address</Label>
          <Input placeholder="Enter address" />
        </div>

        <Button>Update Business Info</Button>
      </CardContent>
    </Card>
  );
}