'use client';

import { usePageStore } from '@/lib/router-store';
import { mockInvoices, mockMeters, mockUnits } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton, StatCard, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Gauge, CreditCard } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import { useProjectsList } from '@/hooks/use-projects';
import { useCustomerDetail } from '@/hooks/use-customers';

export default function CustomerDetailPage() {
  const t = useT();
  const { pageParams } = usePageStore();
  const { data: apiProjects } = useProjectsList();
  const projects = apiProjects ?? [];
  const projectId = pageParams.projectId ?? '';
  const { data: apiCustomer } = useCustomerDetail(projectId, pageParams.id ?? '');
  const customer = apiCustomer;
  const project = projects.find((p) => p.id === customer?.projectId);
  if (!customer) {
    return (
      <div>
        <BackButton fallback="customers" />
        <p className="text-muted-foreground">{t('customers.notFound')}</p>
      </div>
    );
  }

  const invoices = mockInvoices.filter((i) => i.customerId === customer.id);
  const meters = mockMeters.filter((m) => m.customerId === customer.id);
  const customerUnits = mockUnits.filter((u) => customer.units?.includes(u.id));

  return (
    <div>
      <BackButton fallback="customers" />

      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <StatusBadge status={customer.status} />
              <StatusBadge status={customer.customerType} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{customer.code}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {customer.phone}</span>
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {project?.name ?? customer.projectName}</span>
            </div>
            {customer.address && <p className="text-xs text-muted-foreground mt-1">{customer.address}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('customers.activeMeters')} value={customer.activeMeters} icon={<Gauge className="h-5 w-5" />} />
        <StatCard label={t('customers.totalPaid')} value={formatCurrency(customer.totalPaid)} icon={<CreditCard className="h-5 w-5" />} color="text-emerald-500" />
        <StatCard
          label={t('customers.currentBalance')}
          value={formatCurrency(customer.currentBalance)}
          icon={<CreditCard className="h-5 w-5" />}
          color={customer.currentBalance > 0 ? 'text-red-500' : customer.currentBalance < 0 ? 'text-blue-500' : 'text-emerald-500'}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">{t('customers.overview')}</TabsTrigger>
          <TabsTrigger value="units">{t('customers.units')}</TabsTrigger>
          <TabsTrigger value="meters">{t('sidebar.meters')}</TabsTrigger>
          <TabsTrigger value="invoices">{t('sidebar.invoices')}</TabsTrigger>
          <TabsTrigger value="payments">{t('sidebar.payments')}</TabsTrigger>
          <TabsTrigger value="balance">{t('customers.balance')}</TabsTrigger>
          <TabsTrigger value="tickets">{t('sidebar.tickets')}</TabsTrigger>
          <TabsTrigger value="notes">{t('customers.notes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('customers.customerInfo')}</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('customers.code')}</span><span>{customer.code}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('customers.type')}</span><StatusBadge status={customer.customerType} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('customers.project')}</span><span>{project?.name ?? customer.projectName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('customers.created')}</span><span>{formatDate(customer.createdAt)}</span></div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('customers.assignedUnits')}</CardTitle></CardHeader>
              <CardContent>
                {customerUnits.length > 0 ? (
                  <div className="space-y-2">
                    {customerUnits.map((u) => (
                      <div key={u.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0 text-sm">
                        <span className="font-medium">{u.unitNumber}</span>
                        <span className="text-muted-foreground text-xs">{u.buildingId.replace('BLD-', '')} · Floor {u.floorNumber}</span>
                        <StatusBadge status={u.status} />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-4">{t('customers.noAssignedUnits')}</p>}
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50 md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{t('customers.recentInvoices')}</CardTitle></CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-2">
                    {invoices.slice(0, 5).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                        <div>
                          <span className="font-medium">{inv.invoiceNumber}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{formatDate(inv.invoiceDate)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>{formatCurrency(inv.total)}</span>
                          <StatusBadge status={inv.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-4">{t('billing.invoices.noInvoices')}</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="units">
          <SmartTable
            data={customerUnits}
            columns={[
              { key: 'unitNumber', label: t('locations.unit'), sortable: true },
              { key: 'unitType', label: t('customers.type'), render: (v: string) => <StatusBadge status={v} /> },
              { key: 'floorNumber', label: t('locations.floor'), width: '80px' },
              { key: 'status', label: t('customers.status'), width: '100px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('customers.search')}
          />
        </TabsContent>

        <TabsContent value="meters">
          <SmartTable
            data={meters}
            columns={[
              { key: 'serialNumber', label: t('meters.serialNumber'), sortable: true },
              { key: 'meterType', label: t('meters.type'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'brand', label: t('meters.brand') },
              { key: 'lastReading', label: t('meters.lastReading'), width: '120px', render: (v: number) => v ? v.toLocaleString() : '-' },
              { key: 'status', label: t('meters.status'), width: '100px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('meters.search')}
            searchKeys={['serialNumber', 'brand']}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <SmartTable
            data={invoices}
            columns={[
              { key: 'invoiceNumber', label: t('billing.invoices.invoiceNumber'), sortable: true },
              { key: 'billingPeriodStart', label: t('billing.invoices.period'), width: '180px', render: (v: string, row: { billingPeriodEnd: string }) => `${formatDate(v)} - ${formatDate(row.billingPeriodEnd)}` },
              { key: 'consumption', label: t('billing.consumption.consumption'), width: '80px' },
              { key: 'total', label: t('billing.invoices.total'), width: '100px', render: (v: number) => formatCurrency(v) },
              { key: 'paidAmount', label: t('billing.invoices.paid'), width: '100px', render: (v: number) => formatCurrency(v) },
              { key: 'status', label: t('billing.invoices.status'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
            ]}
            searchPlaceholder={t('billing.invoices.search')}
          />
        </TabsContent>

        <TabsContent value="payments"><div className="text-center py-12 text-muted-foreground">{t('billing.payments.noPayments')}</div></TabsContent>
        <TabsContent value="balance"><div className="text-center py-12 text-muted-foreground">{t('customers.noBalanceRecords')}</div></TabsContent>
        <TabsContent value="tickets"><div className="text-center py-12 text-muted-foreground">{t('tickets.noTickets')}</div></TabsContent>
        <TabsContent value="notes"><div className="text-center py-12 text-muted-foreground">{t('customers.noNotes')}</div></TabsContent>
      </Tabs>
    </div>
  );
}
