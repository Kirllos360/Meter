'use client';
import { useQuery } from '@tanstack/react-query';
import { usePageStore } from '@/lib/router-store';
import { apiGet } from '@/lib/api';
import { useCustomerDetail } from '@/hooks/use-customers';
import { BackButton, StatCard, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SmartTable from '@/components/smart-table/SmartTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Gauge, FileText, CreditCard, Bell, Ticket, DollarSign, Download, Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, User, Phone, Mail, MapPin, Shield } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const healthColors: Record<string, string> = { Excellent: 'text-emerald-500', Good: 'text-blue-500', Average: 'text-amber-500', Risk: 'text-orange-500', Critical: 'text-red-500' };
const healthBg: Record<string, string> = { Excellent: 'bg-emerald-500/10', Good: 'bg-blue-500/10', Average: 'bg-amber-500/10', Risk: 'bg-orange-500/10', Critical: 'bg-red-500/10' };

export default function Customer360Page() {
  const { pageParams, navigate } = usePageStore();
  const cid = pageParams.id ?? '';
  const { data: customer } = useCustomerDetail(cid);
  const { data: agg } = useQuery({ queryKey: ['customer-360', cid], queryFn: () => apiGet<any>(`/customers/360?id=${cid}`).catch(() => apiGet<any>(`/customers/${cid}/360`)).catch(() => null), enabled: !!cid });
  const d = agg ?? {};
  const c = customer;

  if (!c) return <div className="p-6"><BackButton fallback="customers" /><p className="text-muted-foreground mt-4">Loading...</p></div>;

  const fin = d.financial ?? {};
  const aging = d.aging?.buckets ?? {};
  const invs = d.invoices ?? [];
  const pays = d.payments ?? [];
  const meters = d.meters ?? [];
  const health = d.health ?? { score: 0, label: 'Good' };
  const insights = d.insights ?? {};
  const timeline = d.timeline ?? [];
  const openItems = d.openItems ?? {};

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <BackButton fallback="customers" />
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => toast.info('Edit customer')}><User className="h-3.5 w-3.5 mr-1" />Edit</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('invoices')}><FileText className="h-3.5 w-3.5 mr-1" />Invoice</Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Record payment')}><CreditCard className="h-3.5 w-3.5 mr-1" />Pay</Button>
          <Button variant="outline" size="sm" onClick={() => toast.info('Download statement')}><Download className="h-3.5 w-3.5 mr-1" />Statement</Button>
        </div>
      </div>

      {/* Customer Header */}
      <div className="glass-card rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold">{c.name}</h1>
              <StatusBadge status={c.status ?? 'active'} />
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${healthBg[health.label] ?? 'bg-gray-500/10'} ${healthColors[health.label] ?? 'text-gray-500'}`}>{health.label}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone ?? '-'}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email ?? '-'}</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{c.customerType ?? '-'}</span>
              <span>Code: {c.code ?? c.id}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div><span className="text-xs text-muted-foreground">Outstanding</span><p className="font-bold">{formatCurrency(fin.totalOutstanding ?? 0)}</p></div>
            <div><span className="text-xs text-muted-foreground">Collection</span><p className="font-bold">{fin.collectionRate ?? 0}%</p></div>
            <div><span className="text-xs text-muted-foreground">Invoices</span><p className="font-bold">{invs.length}</p></div>
            <div><span className="text-xs text-muted-foreground">Score</span><p className="font-bold">{health.score ?? 0}</p></div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="meters">Meters</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard label="Balance" value={formatCurrency(fin.totalOutstanding ?? 0)} icon={<DollarSign className="h-4 w-4" />} />
            <StatCard label="Invoices" value={invs.length} icon={<FileText className="h-4 w-4" />} />
            <StatCard label="Paid" value={formatCurrency(fin.totalPaid ?? 0)} icon={<TrendingUp className="h-4 w-4" />} />
            <StatCard label="Collection Rate" value={`${fin.collectionRate ?? 0}%`} icon={<Activity className="h-4 w-4" />} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Aging</CardTitle><span className="text-xs text-muted-foreground">Total: {formatCurrency(aging.total ?? 0)}</span></CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {[{l:'Current',k:'current',c:''},{l:'1-30 Days',k:'d1to30',c:''},{l:'31-60 Days',k:'d31to60',c:''},{l:'61-90 Days',k:'d61to90',c:''},{l:'91-120 Days',k:'d91to120',c:''},{l:'120+ Days',k:'d120plus',c:'text-red-500'}].map(b => (
                    <div key={b.k} className={`flex justify-between ${b.c}`}><span>{b.l}</span><span className="font-mono">{formatCurrency((aging as any)[b.k] ?? 0)}</span></div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">Open Items</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <div><p className="text-sm font-medium">{openItems.invoices ?? 0} Open Invoices</p><p className="text-xs text-muted-foreground">{openItems.overdue ?? 0} overdue</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <Ticket className="h-5 w-5 text-blue-500" />
                  <div><p className="text-sm font-medium">{openItems.tickets ?? 0} Open Tickets</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financials */}
        <TabsContent value="financials">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Invoices ({invs.length})</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={invs} columns={[
                { key: 'invoiceNumber', label: 'Number', sortable: true },
                { key: 'date', label: 'Date', render: (v: string) => formatDate(v) },
                { key: 'amount', label: 'Amount', render: (v: number) => formatCurrency(v) },
                { key: 'balance', label: 'Balance', render: (v: number) => <span className={v > 0 ? 'text-red-500' : 'text-emerald-500'}>{formatCurrency(v)}</span> },
                { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
              ]} />
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50 mt-4">
            <CardHeader><CardTitle className="text-sm">Payments ({pays.length})</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={pays} columns={[
                { key: 'receiptNumber', label: 'Receipt', sortable: true },
                { key: 'date', label: 'Date', render: (v: string) => formatDate(v) },
                { key: 'method', label: 'Method' },
                { key: 'amount', label: 'Amount', render: (v: number) => formatCurrency(v) },
                { key: 'collector', label: 'Collector' },
                { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
              ]} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meters */}
        <TabsContent value="meters">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Meters ({meters.length})</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={meters} columns={[
                { key: 'serialNumber', label: 'Serial', sortable: true },
                { key: 'meterType', label: 'Type', render: (v: string) => <StatusBadge status={v} /> },
                { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
              ]} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections */}
        <TabsContent value="collections">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">Aging Analysis</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[{l:'Current (0-30)',k:'current',v:aging.current??0},{l:'31-60 Days',k:'31-60',v:aging.d31to60??0},{l:'61-90 Days',k:'61-90',v:aging.d61to90??0},{l:'120+ Days',k:'120+',v:aging.d120plus??0}].map(b => (
                    <div key={b.k} className="flex justify-between p-2 rounded bg-muted/30"><span>{b.l}</span><span className="font-mono">{formatCurrency(b.v)}</span></div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">Collection Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Invoiced</span><span>{formatCurrency(fin.totalInvoiced ?? 0)}</span></div>
                <div className="flex justify-between"><span>Collected</span><span className="text-emerald-500">{formatCurrency(fin.totalPaid ?? 0)}</span></div>
                <div className="flex justify-between"><span>Outstanding</span><span className="text-red-500">{formatCurrency(fin.totalOutstanding ?? 0)}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t"><span>Collection Rate</span><span>{fin.collectionRate ?? 0}%</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <div className="grid md:grid-cols-3 gap-4">
            {invs.slice(0, 12).map((inv: any) => (
              <Card key={inv.id} className="glass-card border-border/50 cursor-pointer hover:border-primary/30" onClick={() => window.open(`/api/v1/downloads/invoices/${inv.id}/pdf`, '_blank')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-primary" /><span className="font-mono text-xs">{inv.invoiceNumber}</span></div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(inv.amount)} · <StatusBadge status={inv.status} /></div>
                </CardContent>
              </Card>
            ))}
            {invs.length === 0 && <p className="text-sm text-muted-foreground col-span-3 text-center py-8">No documents</p>}
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <div className="space-y-0">
                  {timeline.map((t: any, i: number) => (
                    <div key={i} className="flex gap-3 pb-3 border-b border-border/20 last:border-0 mb-3">
                      <div className={`mt-0.5 ${t.type === 'invoice' ? 'text-primary' : t.type === 'payment' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {t.type === 'invoice' ? <FileText className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      </div>
                      <div className="flex-1"><p className="text-sm">{t.desc}</p><p className="text-xs text-muted-foreground">{formatDate(t.date)}</p></div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No activity</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">Customer Health</CardTitle></CardHeader>
              <CardContent className="text-center">
                <div className={`text-4xl font-bold ${healthColors[health.label] ?? ''}`}>{health.score}</div>
                <div className={`text-sm mt-1 ${healthColors[health.label] ?? ''}`}>{health.label}</div>
                <div className="w-full bg-muted rounded-full h-2 mt-3"><div className={`h-2 rounded-full ${health.label === 'Excellent' ? 'bg-emerald-500' : health.label === 'Good' ? 'bg-blue-500' : health.label === 'Average' ? 'bg-amber-500' : health.label === 'Risk' ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${health.score}%`}} /></div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardHeader><CardTitle className="text-sm">AI Insights</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {insights.topRiskFactors?.length > 0 && <div className="flex items-start gap-2 p-2 rounded bg-red-500/5"><AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /><span>{insights.topRiskFactors.join(', ')}</span></div>}
                <div className="flex justify-between"><span>Payment Probability</span><span className="font-semibold">{Math.round((insights.expectedPaymentProbability ?? 0) * 100)}%</span></div>
                <div className="flex justify-between"><span>Expected Collection</span><span className="font-mono">{formatCurrency(insights.expectedCollectionAmount ?? 0)}</span></div>
                {insights.largestOverdueInvoice && <div className="flex justify-between"><span>Largest Overdue</span><span>{insights.largestOverdueInvoice} ({formatCurrency(insights.largestOverdueAmount ?? 0)})</span></div>}
                <div className="flex items-start gap-2 p-2 rounded bg-blue-500/5"><Shield className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span className="text-xs">{insights.suggestedAction ?? 'No action needed'}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
