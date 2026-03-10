"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UsersTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users & Roles</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground">
          Manage user roles and permissions here.
        </p>
        <Button className="mt-4">Manage Users</Button>
      </CardContent>
    </Card>
  );
}