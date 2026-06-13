'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { mockUsers } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [companyName, setCompanyName] = useState('Meter Verse');
  const [companyEmail, setCompanyEmail] = useState('info@meterpulse.com');
  const [companyPhone, setCompanyPhone] = useState('+201012345670');
  const [readingThreshold, setReadingThreshold] = useState('500');
  const [waterThreshold, setWaterThreshold] = useState('10');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [alertNotif, setAlertNotif] = useState(true);

  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'phone', label: 'Phone', render: (v: string) => v || '-' },
  ];

  const tariffData = [
    { name: 'Residential Tier 1', electricity: 1.25, water: 5.50 },
    { name: 'Residential Tier 2', electricity: 1.15, water: 4.80 },
    { name: 'Commercial Tier 1', electricity: 2.00, water: 8.00 },
    { name: 'Commercial Tier 2', electricity: 2.50, water: 10.00 },
    { name: 'Industrial', electricity: 3.00, water: 12.00 },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="System configuration and preferences" />

      <Tabs defaultValue="general">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="tariff">Tariff/Rates</TabsTrigger>
          <TabsTrigger value="billing">Billing Period</TabsTrigger>
          <TabsTrigger value="reading">Reading Validation</TabsTrigger>
          <TabsTrigger value="water">Water Thresholds</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Application Name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="mt-1" />
              </div>
              <Button onClick={() => toast.success('Settings saved!')}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">System Users</CardTitle></CardHeader>
            <CardContent>
              <SmartTable
                data={mockUsers}
                columns={userColumns}
                searchPlaceholder="Search users..."
                searchKeys={['name', 'email']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tariff">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Tariff Configuration</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="text-left py-2 pr-4">Tariff Name</th>
                      <th className="text-right py-2 px-4">Electricity (EGP/kWh)</th>
                      <th className="text-right py-2 pl-4">Water (EGP/m³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tariffData.map((t) => (
                      <tr key={t.name} className="border-b border-border/30">
                        <td className="py-2 pr-4 font-medium">{t.name}</td>
                        <td className="text-right py-2 px-4">{t.electricity.toFixed(2)}</td>
                        <td className="text-right py-2 pl-4">{t.water.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Billing Period Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Billing Cycle</span><span>Monthly</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start Day</span><span>15th</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">End Day</span><span>14th</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Grace Period</span><span>7 days</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax Rate</span><span>9%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>EGP</span></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reading">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Reading Validation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Max Normal Consumption (units)</Label>
                <Input type="number" value={readingThreshold} onChange={(e) => setReadingThreshold(e.target.value)} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Readings above this will be flagged as suspicious</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Flag negative consumption</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Flag zero consumption</span>
                <Switch defaultChecked />
              </div>
              <Button onClick={() => toast.success('Validation settings saved!')}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="water">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Water Difference Threshold</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Threshold (%)</Label>
                <Input type="number" value={waterThreshold} onChange={(e) => setWaterThreshold(e.target.value)} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Alert if main vs child difference exceeds this percentage</p>
              </div>
              <Button onClick={() => toast.success('Water settings saved!')}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">Receive alerts via email</p></div>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">SMS Notifications</p><p className="text-xs text-muted-foreground">Receive alerts via SMS</p></div>
                <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Critical Alerts</p><p className="text-xs text-muted-foreground">Immediate notification for critical alerts</p></div>
                <Switch checked={alertNotif} onCheckedChange={setAlertNotif} />
              </div>
              <Button onClick={() => toast.success('Notification settings saved!')}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="glass-card border-border/50 max-w-lg">
            <CardHeader><CardTitle className="text-sm">Theme Selection</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'system'].map((t) => (
                  <button
                    key={t}
                    className={cn(
                      'p-4 rounded-lg border-2 text-center text-sm font-medium transition-colors',
                      theme === t ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/30'
                    )}
                    onClick={() => setTheme(t)}
                  >
                    {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'}
                    <p className="mt-1 capitalize">{t}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
