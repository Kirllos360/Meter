'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/context';
import { mockTickets } from '@/lib/mock-data';
import { PageHeader } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import SmartTable from '@/components/smart-table/SmartTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, LayoutList, Table2 } from 'lucide-react';
import { formatDateTime } from '@/components/shared/PageHelpers';

export default function TicketsPage() {
  const t = useT();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [dialogOpen, setDialogOpen] = useState(false);

  const statusColumns = [
    { status: 'open', label: t('tickets.open'), color: 'border-slate-500/30' },
    { status: 'in_progress', label: t('tickets.inProgress'), color: 'border-amber-500/30' },
    { status: 'waiting', label: t('tickets.waiting'), color: 'border-amber-500/30' },
    { status: 'resolved', label: t('tickets.resolved'), color: 'border-emerald-500/30' },
    { status: 'closed', label: t('tickets.closed'), color: 'border-slate-500/30' },
  ];

  const columns = [
    { key: 'ticketNumber', label: '#', sortable: true, width: '130px', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
    { key: 'subject', label: t('tickets.subject'), sortable: true },
    { key: 'customerName', label: t('customers.name'), render: (v: string) => v || '-' },
    { key: 'meterSerial', label: t('meters.title'), width: '140px', render: (v: string) => v ? <span className="font-mono text-xs">{v}</span> : '-' },
    {
      key: 'priority', label: t('tickets.priority'), sortable: true, width: '100px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: 'assigneeName', label: t('tickets.assignee'), width: '130px', render: (v: string) => v || '-' },
    { key: 'createdAt', label: 'Created', sortable: true, width: '130px', render: (v: string) => formatDateTime(v) },
    {
      key: 'status', label: t('projects.status'), sortable: true, width: '110px',
      render: (v: string) => <StatusBadge status={v} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('tickets.title')}
        subtitle="Manage support tickets and issues"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> {t('tickets.create')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('tickets.create')}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t('tickets.subject')}</label>
                  <Input placeholder="Ticket subject" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Description</label>
                  <Textarea placeholder="Describe the issue..." rows={3} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t('tickets.priority')}</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('alerts.low')}</SelectItem>
                      <SelectItem value="medium">{t('alerts.medium')}</SelectItem>
                      <SelectItem value="high">{t('alerts.high')}</SelectItem>
                      <SelectItem value="critical">{t('alerts.critical')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => { toast.success('Ticket created!'); setDialogOpen(false); }}>
                  {t('tickets.create')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <Button variant={view === 'kanban' ? 'default' : 'outline'} size="sm" className="gap-1" onClick={() => setView('kanban')}>
          <LayoutList className="h-4 w-4" /> {t('tickets.kanban')}
        </Button>
        <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" className="gap-1" onClick={() => setView('table')}>
          <Table2 className="h-4 w-4" /> Table
        </Button>
      </div>

      {view === 'table' ? (
        <SmartTable
          data={mockTickets}
          columns={columns}
          filters={[
            { key: 'status', label: t('projects.status'), type: 'select', options: statusColumns.map((s) => ({ label: s.label, value: s.status })) },
            { key: 'priority', label: t('tickets.priority'), type: 'select', options: [
              { label: t('alerts.critical'), value: 'critical' }, { label: t('alerts.high'), value: 'high' },
              { label: t('alerts.medium'), value: 'medium' }, { label: t('alerts.low'), value: 'low' },
            ]},
          ]}
          searchKeys={['ticketNumber', 'subject', 'customerName', 'assigneeName']}
          searchPlaceholder={t('tickets.search')}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statusColumns.map((col) => {
            const tickets = mockTickets.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className={cn('rounded-xl border p-4 min-h-[300px]', col.color, 'glass-card')}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{col.label}</h3>
                  <span className="text-xs bg-muted rounded-full px-2 py-0.5">{tickets.length}</span>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="border-border/50 bg-background/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                          <StatusBadge status={ticket.priority} />
                        </div>
                        <p className="text-sm font-medium line-clamp-2 mb-2">{ticket.subject}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{ticket.customerName || '-'}</span>
                          <span>{ticket.assigneeName || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tickets.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">{t('tickets.noTickets')}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
