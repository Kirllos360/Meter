'use client';

import { useState, useMemo } from 'react';
import { useT } from '@/lib/i18n/context';
import { mockCustomers, mockMeters, mockInvoices, mockPayments, mockTickets } from '@/lib/mock-data';
import { PageHeader } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SmartTable from '@/components/smart-table/SmartTable';
import { toast } from 'sonner';
import { Search, Phone, Mail, MapPin } from 'lucide-react';
import { formatCurrency, formatDate } from '@/components/shared/PageHelpers';

export default function SupportPage() {
  const t = useT();
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return mockCustomers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedCustomer = selectedCustomerId ? mockCustomers.find((c) => c.id === selectedCustomerId) : null;
  const customerMeters = selectedCustomer ? mockMeters.filter((m) => m.customerId === selectedCustomer.id) : [];
  const customerInvoices = selectedCustomer ? mockInvoices.filter((i) => i.customerId === selectedCustomer.id) : [];
  const customerPayments = selectedCustomer ? mockPayments.filter((p) => p.customerId === selectedCustomer.id) : [];
  const customerTickets = selectedCustomer ? mockTickets.filter((t) => t.customerId === selectedCustomer.id) : [];

  return (
    <div>
      <PageHeader title={t('support.title')} subtitle={t('support.quickLookup')} />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('support.searchCustomer')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedCustomerId(null); }}
          className="pl-9"
        />
      </div>

      {/* Search Results */}
      {search.trim() && filteredCustomers.length > 0 && !selectedCustomerId && (
        <div className="grid gap-2 mb-6 max-w-lg">
          {filteredCustomers.map((c) => (
            <button
              key={c.id}
              className="glass-card rounded-lg p-3 text-left hover:border-primary/50 transition-colors"
              onClick={() => setSelectedCustomerId(c.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.code} · {c.projectName}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Customer Profile */}
      {selectedCustomer && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">{selectedCustomer.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {selectedCustomer.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {selectedCustomer.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {selectedCustomer.projectName}
                </div>
                {selectedCustomer.address && (
                  <p className="text-xs text-muted-foreground">{selectedCustomer.address}</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">{t('support.balance')}</p>
                  <p className={selectedCustomer.currentBalance > 0 ? 'text-red-500' : 'text-emerald-500'}>
                    {formatCurrency(selectedCustomer.currentBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('sidebar.meters')}</p>
                  <p>{selectedCustomer.activeMeters}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => { setSelectedCustomerId(null); setSearch(''); }}>
                {t('common.clear')}
              </Button>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="tickets">
              <TabsList className="mb-4">
                <TabsTrigger value="meters">{t('sidebar.meters')}</TabsTrigger>
                <TabsTrigger value="invoices">{t('support.invoices')}</TabsTrigger>
                <TabsTrigger value="payments">{t('sidebar.payments')}</TabsTrigger>
                <TabsTrigger value="tickets">{t('support.tickets')}</TabsTrigger>
              </TabsList>

              <TabsContent value="meters">
                <SmartTable
                  data={customerMeters}
                  columns={[
                    { key: 'serialNumber', label: t('meters.serialNumber'), render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                    { key: 'meterType', label: t('meters.type'), render: (v: string) => <StatusBadge status={v} /> },
                    { key: 'brand', label: 'Brand' },
                    { key: 'unitNumber', label: t('locations.unit'), width: '80px', render: (v: string) => v || '-' },
                    { key: 'status', label: t('projects.status'), width: '100px', render: (v: string) => <StatusBadge status={v} /> },
                  ]}
                  compact
                  searchable={false}
                />
              </TabsContent>

              <TabsContent value="invoices">
                <SmartTable
                  data={customerInvoices}
                  columns={[
                    { key: 'invoiceNumber', label: '#', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                    { key: 'total', label: t('billing.invoices.total'), width: '100px', render: (v: number) => formatCurrency(v) },
                    { key: 'remainingAmount', label: t('billing.invoices.outstanding'), width: '100px', render: (v: number) => <span className={v > 0 ? 'text-red-500' : ''}>{formatCurrency(v)}</span> },
                    { key: 'status', label: t('billing.invoices.status'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
                    { key: 'invoiceDate', label: t('billing.invoices.issueDate'), width: '100px', render: (v: string) => formatDate(v) },
                  ]}
                  compact
                  searchable={false}
                />
              </TabsContent>

              <TabsContent value="payments">
                <SmartTable
                  data={customerPayments}
                  columns={[
                    { key: 'paymentNumber', label: '#', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                    { key: 'amount', label: t('billing.payments.amount'), width: '100px', render: (v: number) => formatCurrency(v) },
                    { key: 'method', label: t('billing.payments.method'), width: '120px', render: (v: string) => <StatusBadge status={v} /> },
                    { key: 'status', label: t('billing.payments.status'), width: '100px', render: (v: string) => <StatusBadge status={v} /> },
                  ]}
                  compact
                  searchable={false}
                />
              </TabsContent>

              <TabsContent value="tickets">
                <SmartTable
                  data={customerTickets}
                  columns={[
                    { key: 'ticketNumber', label: '#', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                    { key: 'subject', label: t('tickets.subject') },
                    { key: 'priority', label: t('tickets.priority'), width: '90px', render: (v: string) => <StatusBadge status={v} /> },
                    { key: 'status', label: t('projects.status'), width: '100px', render: (v: string) => <StatusBadge status={v} /> },
                  ]}
                  compact
                  searchable={false}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {!search.trim() && !selectedCustomerId && (
        <div className="text-center py-16 text-muted-foreground">
          <p>{t('support.quickLookup')}</p>
        </div>
      )}
    </div>
  );
}
