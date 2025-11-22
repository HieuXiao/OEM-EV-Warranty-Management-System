import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Mail, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AdminSetting() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    warrantyAlerts: true,
    lowStockAlerts: true,
    systemUpdates: false,
    companyName: "VinFast Auto",
    supportEmail: "support@vinfast.vn",
    warrantyPeriod: "96",
    autoApproval: false,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenMenu = () => setIsMobileMenuOpen(true);
  const handleCloseMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar isMobileOpen={isMobileMenuOpen} onClose={handleCloseMenu} />
      {/* Main Content */}
      <div className="lg:pl-64">
        <Header onMenuClick={handleOpenMenu} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                System Settings
              </h1>
              {/* <p className="text-muted-foreground mt-1">
                Configure system preferences and integrations
              </p> */}
            </div>
            {/* Switch Tabs */}
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="warranty">Warranty Policy</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>
              {/* Genaral Tab */}
              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Basic company details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={settings.companyName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            companyName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            supportEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Preferences</CardTitle>
                    <CardDescription>
                      Configure system behavior and defaults
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-approve warranty claims</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically approve claims under certain conditions
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoApproval}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, autoApproval: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive system notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            emailNotifications: checked,
                          })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in browser
                        </p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            pushNotifications: checked,
                          })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Warranty Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new warranty claims
                        </p>
                      </div>
                      <Switch
                        checked={settings.warrantyAlerts}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, warrantyAlerts: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when parts are running low
                        </p>
                      </div>
                      <Switch
                        checked={settings.lowStockAlerts}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, lowStockAlerts: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about system updates
                        </p>
                      </div>
                      <Switch
                        checked={settings.systemUpdates}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, systemUpdates: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Warranty Tab */}
              <TabsContent value="warranty" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Warranty Configuration</CardTitle>
                    <CardDescription>
                      Configure default warranty policies and terms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="warrantyPeriod">
                        Default Warranty Period (months)
                      </Label>
                      <Input
                        id="warrantyPeriod"
                        type="number"
                        value={settings.warrantyPeriod}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            warrantyPeriod: e.target.value,
                          })
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        Standard warranty period for new vehicles
                      </p>
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Integration Tab */}
              <TabsContent value="integrations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Integrations</CardTitle>
                    <CardDescription>
                      Connect external services and APIs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Email Service</p>
                          <p className="text-sm text-muted-foreground">
                            SMTP configuration for email notifications
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Database className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Database Backup</p>
                          <p className="text-sm text-muted-foreground">
                            Automated backup configuration
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">API Access</p>
                          <p className="text-sm text-muted-foreground">
                            External API keys and webhooks
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
