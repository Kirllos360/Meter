'use client';
import { useQuery } from '@tanstack/react-query';
import { usePageStore } from '@/lib/router-store';
import { apiGet } from '@/lib/api';
import { useProjectDetail } from '@/hooks/use-projects';
import { useLocationsList } from '@/hooks/use-locations';
import { useCustomersList } from '@/hooks/use-customers';
import { useMetersList } from '@/hooks/use-meters';
import { BackButton, StatCard, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Gauge, FileText, DollarSign, Activity, TrendingUp, Download, AlertTriangle, Shield } from 'lucide-react';

export default function Project360Page() {
  const { pageParams } = usePageStore();
  const pid = pageParams.id ?? '';
  const { data: project } = useProjectDetail(pid);
  const { data: locations } = useLocationsList(pid);
  const { data: customers } = useCustomersList(pid);
  const { data: meters } = useMetersList();

  const locs = locations ?? [];
  const custs = customers ?? [];
  const mtrs = meters?.filter((m: any) => m.projectId === pid) ?? [];
  const buildings = locs.filter((l: any) => l.nodeType === 'building');
  const units = locs.filter((l: any) => l.nodeType === 'unit');

  const p = project;

  if (!p) return <div className="p-6"><BackButton fallback="projects" /><p className="text-muted-foreground mt-4">Loading...</p></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <BackButton fallback="projects" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}><FileText className="h-3.5 w-3.5 mr-1" />Generate Invoices</Button>
          <Button variant="outline" size="sm" onClick={() => {}}><Download className="h-3.5 w-3.5 mr-1" />Export Report</Button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3"><h1 className="text-xl font-bold">{p.name}</h1><StatusBadge status={p.status ?? 'active'} /></div>
            <p className="text-sm text-muted-foreground">{p.code} · {p.location ?? '-'}</p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div><span className="text-xs text-muted-foreground">Buildings</span><p className="font-bold">{buildings.length}</p></div>
            <div><span className="text-xs text-muted-foreground">Units</span><p className="font-bold">{units.length}</p></div>
            <div><span className="text-xs text-muted-foreground">Customers</span><p className="font-bold">{custs.length}</p></div>
            <div><span className="text-xs text-muted-foreground">Meters</span><p className="font-bold">{mtrs.length}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Buildings" value={buildings.length} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Units" value={units.length} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Customers" value={custs.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Meters" value={mtrs.length} icon={<Gauge className="h-4 w-4" />} />
      </div>

      <Tabs defaultValue="customers">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="meters">Meters</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Customers ({custs.length})</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={custs} columns={[
                { key: 'name', label: 'Name', sortable: true },
                { key: 'customerCode', label: 'Code' },
                { key: 'phone', label: 'Phone' },
                { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
              ]} searchKeys={['name', 'customerCode']} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meters">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Meters ({mtrs.length})</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={mtrs} columns={[
                { key: 'serialNumber', label: 'Serial', sortable: true },
                { key: 'meterType', label: 'Type', render: (v: string) => <StatusBadge status={v} /> },
                { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
                { key: 'brand', label: 'Brand' },
              ]} searchKeys={['serialNumber']} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Locations</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={locs} columns={[
                { key: 'name', label: 'Name', sortable: true },
                { key: 'nodeType', label: 'Type', render: (v: string) => <StatusBadge status={v} /> },
                { key: 'code', label: 'Code' },
                { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
              ]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
