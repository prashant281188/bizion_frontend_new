"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/common/PageHeader";
import RHFInput from "@/components/admin/form/RHFInput";

type SettingsFormValues = {
  companyName: string;
  supportEmail: string;
  darkMode: boolean;
  emailNotifications: boolean;
};

export default function SettingsPage() {
  const form = useForm<SettingsFormValues>({
    defaultValues: {
      companyName: "HINI Hardware",
      supportEmail: "support@hini.com",
      darkMode: false,
      emailNotifications: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <PageHeader
        title="Settings"
        description="Manage organization preferences, security, and system behavior."
        action={
          <Button onClick={form.handleSubmit(console.log)}>Save Changes</Button>
        }
      />

       {/* ================= SIDE BY SIDE TABS ================= */}
      <Tabs
        defaultValue="general"
        orientation="vertical"
        className="flex gap-8"
      >
        {/* ---------- LEFT NAV ---------- */}
        <TabsList className="flex h-fit w-64 flex-col items-stretch gap-1 bg-transparent p-0">
          <TabsTrigger value="general" className="justify-start">
            General
          </TabsTrigger>

          <TabsTrigger value="security" className="justify-start">
            Account & Security
          </TabsTrigger>

          <TabsTrigger value="appearance" className="justify-start">
            Appearance
          </TabsTrigger>

          <TabsTrigger value="notifications" className="justify-start">
            Notifications
          </TabsTrigger>

          <TabsTrigger
            value="danger"
            className="justify-start text-destructive"
          >
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* ---------- RIGHT CONTENT ---------- */}
        <div className="flex-1">
          {/* ================= GENERAL ================= */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold">
                  Organization
                </h3>
                <p className="text-sm text-muted-foreground">
                  Basic company information
                </p>
              </CardHeader>

              <CardContent className="grid gap-6 sm:grid-cols-2">
                <RHFInput
                  control={form.control}
                  name="companyName"
                  label="Company Name"
                  required
                />

                <RHFInput
                  control={form.control}
                  name="supportEmail"
                  label="Support Email"
                  type="email"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= SECURITY ================= */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold">
                  Account & Security
                </h3>
                <p className="text-sm text-muted-foreground">
                  Authentication and access control
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Change Password
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add extra security
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= APPEARANCE ================= */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold">
                  Appearance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize the admin UI
                </p>
              </CardHeader>

              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Dark Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enable dark theme
                  </p>
                </div>
                <Switch
                  checked={form.watch("darkMode")}
                  onCheckedChange={(v) =>
                    form.setValue("darkMode", v)
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= NOTIFICATIONS ================= */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold">
                  Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Control system alerts
                </p>
              </CardHeader>

              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Email Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={form.watch("emailNotifications")}
                  onCheckedChange={(v) =>
                    form.setValue("emailNotifications", v)
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= DANGER ================= */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive/40">
              <CardHeader>
                <h3 className="text-base font-semibold text-destructive">
                  Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground">
                  Irreversible actions
                </p>
              </CardHeader>

              <CardContent>
                <Button variant="destructive">
                  Delete Organization
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
