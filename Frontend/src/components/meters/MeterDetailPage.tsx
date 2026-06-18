'use client';

import { usePageStore } from '@/lib/router-store';
import { mockReadings, mockSimCards, mockInvoices } from '@/lib/mock-data';
import { useMeterDetail } from '@/hooks/use-meters';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton, StatCard, formatDate, formatDateTime } from '@/components/shared/PageHelpers';
import { useT } from '@/lib/i18n/context';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Droplets, Wifi, MapPin, Building2, Home, User } from 'lucide-react';

export default function MeterDetailPage() {
  const { pageParams } = usePageStore();
  const t = useT();
  const meterQuery = useMeterDetail(pageParams.id);
  const meter = meterQuery.data;

  if (!meter) {
    return (
      <div>
        <BackButton fallback="meters" />
        <p className="text-muted-foreground">{t('meters.noMeters')}</p>
      </div>
    );
  }

  const readings = mockReadings.filter((r) => r.meterId === meter.id).sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
  const sim = meter.simCardId ? mockSimCards.find((s) => s.id === meter.simCardId) : null;
  const invoices = mockInvoices.filter((i) => i.meterSerial === meter.serialNumber);

  const chartData = readings.slice(-6).map((r) => ({
    date: new Date(r.readingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reading: r.currentReading,
  }));

  return (
    <div>
      <BackButton fallback="meters" />
      <QueryBoundary query={meterQuery}>

      {/* Header */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          {meter.meterType === 'electricity' ? <Zap className="h-6 w-6 text-amber-500" /> : <Droplets className="h-6 w-6 text-blue-500" />}
          <h1 className="text-2xl font-bold font-mono">{meter.serialNumber}</h1>
          <StatusBadge status={meter.meterType} />
          <StatusBadge status={meter.status} />
        </div>
        <p className="text-sm text-muted-foreground">{meter.brand} {meter.model}</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {meter.projectName && <StatCard label="Project" value={meter.projectName} icon={<MapPin className="h-4 w-4" />} />}
        {meter.buildingName && <StatCard label="Building" value={meter.buildingName} icon={<Building2 className="h-4 w-4" />} />}
        {meter.unitNumber && <StatCard label="Unit" value={meter.unitNumber} icon={<Home className="h-4 w-4" />} />}
        {meter.customerName && <StatCard label="Customer" value={meter.customerName} icon={<User className="h-4 w-4" />} />}
        {sim && <StatCard label="SIM" value={sim.msisdn} icon={<Wifi className="h-4 w-4" />} />}
        {meter.ipAddress && <StatCard label="IP Address" value={meter.ipAddress} />}
        {meter.installedDate && <StatCard label="Installed" value={formatDate(meter.installedDate)} />}
        {meter.lastReading != null && <StatCard label="Last Reading" value={meter.lastReading.toLocaleString()} />}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="glass-card border-border/50 mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Reading History</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="reading" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Last Reading & Communication */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Last Reading</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="text-xl font-bold">{meter.lastReading?.toLocaleString() || '-'}</p>
            <p className="text-muted-foreground text-xs">{meter.lastReadingDate ? formatDateTime(meter.lastReadingDate) : '-'}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Last Communication</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">{meter.lastCommunication ? formatDateTime(meter.lastCommunication) : '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="readings">{t('meters.actions.readings')}</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="sim">SIM/IP</TabsTrigger>
          <TabsTrigger value="invoices">{t('billing.invoices.title')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('alerts.title')}</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="text-center py-8 text-muted-foreground text-sm">Overview summary shown above.</div>
        </TabsContent>

        <TabsContent value="readings">
          <SmartTable
            data={readings}
            columns={[
              { key: 'readingDate', label: t('readings.date'), sortable: true, render: (v: string) => formatDateTime(v) },
              { key: 'previousReading', label: 'Previous', width: '100px' },
              { key: 'currentReading', label: 'Current', width: '100px' },
              { key: 'consumption', label: t('billing.consumption.consumption'), width: '110px' },
              { key: 'source', label: 'Source', width: '100px', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'status', label: t('readings.status'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'enteredBy', label: 'Entered By', width: '110px' },
            ]}
            searchPlaceholder={t('readings.search')}
          />
        </TabsContent>

        <TabsContent value="assignments"><div className="text-center py-8 text-muted-foreground text-sm">No assignment history.</div></TabsContent>
        <TabsContent value="sim">
          {sim ? (
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('simCards.iccid')}</span><span className="font-mono text-xs">{sim.iccid.slice(0, 12)}...</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">MSISDN</span><span>{sim.msisdn}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IP</span><span>{sim.ipAddress || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('simCards.provider')}</span><span>{sim.provider}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('simCards.status')}</span><StatusBadge status={sim.status} /></div>
              </CardContent>
            </Card>
          ) : <div className="text-center py-8 text-muted-foreground text-sm">{t('simCards.noSims')}</div>}
        </TabsContent>

        <TabsContent value="invoices">
          <SmartTable
            data={invoices}
            columns={[
              { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
              { key: 'billingPeriodStart', label: 'Period', width: '180px', render: (v: string, row: { billingPeriodEnd: string }) => `${formatDate(v)} - ${formatDate(row.billingPeriodEnd)}` },
              { key: 'total', label: 'Total', width: '100px', render: (v: number) => `EGP ${v.toLocaleString()}` },
              { key: 'status', label: 'Status', width: '120px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            emptyMessage={t('billing.invoices.noInvoices')}
          />
        </TabsContent>
        <TabsContent value="alerts"><div className="text-center py-8 text-muted-foreground text-sm">{t('alerts.noAlerts')}</div></TabsContent>
        <TabsContent value="maintenance"><div className="text-center py-8 text-muted-foreground text-sm">No maintenance records.</div></TabsContent>
      </Tabs>
      </QueryBoundary>
    </div>
  );
}
