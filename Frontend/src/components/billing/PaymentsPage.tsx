'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { mockCustomers } from '@/lib/mock-data';
import { usePaymentsList } from '@/hooks/use-payments';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader, formatCurrency, formatDate } from '@/components/shared/PageHelpers';
import { useT } from '@/lib/i18n/context';
import { ProtectedAction } from '@/components/shared/ProtectedAction';

export default function PaymentsPage() {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: apiPayments } = usePaymentsList();
  const payments = apiPayments ?? [];

  const columns = [
    { key: 'paymentNumber', label: 'Payment #', sortable: true },
    { key: 'customerName', label: t('billing.payments.customer'), sortable: true },
    { key: 'invoiceNumber', label: 'Invoice #', sortable: true },
    { key: 'paymentDate', label: t('billing.payments.date'), sortable: true, width: '110px', render: (v: string) => formatDate(v) },
    {
      key: 'method', label: t('billing.payments.method'), width: '130px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'amount', label: t('billing.payments.amount'), sortable: true, width: '110px',
      render: (v: number) => <span className="font-medium">{formatCurrency(v)}</span>,
    },
    { key: 'collectedBy', label: 'Collected By', width: '130px' },
    {
      key: 'status', label: t('billing.payments.status'), width: '110px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: 'notes', label: 'Notes', render: (v: string) => v ? <span className="text-xs text-muted-foreground">{v}</span> : '-' },
    {
      key: 'actions', label: '', width: '50px',
      render: (_val: unknown) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info('View payment'); }}><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
            <ProtectedAction action="payment:edit">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info('Edit payment'); }}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
            </ProtectedAction>
            <ProtectedAction action="payment:delete">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info('Delete payment'); }} className="text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
            </ProtectedAction>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('billing.payments.title')}
        subtitle="Track and manage payment collections"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> {t('billing.payments.record')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('billing.payments.record')}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t('billing.payments.customer')}</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t('billing.payments.amount')}</label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">{t('billing.payments.method')}</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t('billing.payments.cash')}</SelectItem>
                      <SelectItem value="bank_transfer">{t('billing.payments.bankTransfer')}</SelectItem>
                      <SelectItem value="card">{t('billing.payments.card')}</SelectItem>
                      <SelectItem value="online_payment">{t('billing.payments.online')}</SelectItem>
                      <SelectItem value="cheque">{t('billing.payments.cheque')}</SelectItem>
                      <SelectItem value="mobile_wallet">{t('billing.payments.mobileWallet')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Notes</label>
                  <Textarea placeholder="Optional notes..." rows={2} />
                </div>
                <Button className="w-full" onClick={() => { toast.success('Payment recorded!'); setDialogOpen(false); }}>
                  {t('billing.payments.record')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <SmartTable
        data={payments}
        columns={columns}
        filters={[
          {
            key: 'method', label: t('billing.payments.method'), type: 'select',
            options: [
              { label: t('billing.payments.cash'), value: 'cash' },
              { label: t('billing.payments.bankTransfer'), value: 'bank_transfer' },
              { label: t('billing.payments.card'), value: 'card' },
              { label: t('billing.payments.online'), value: 'online_payment' },
              { label: t('billing.payments.cheque'), value: 'cheque' },
              { label: t('billing.payments.mobileWallet'), value: 'mobile_wallet' },
            ],
          },
          {
            key: 'status', label: t('billing.payments.status'), type: 'select',
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Confirmed', value: 'confirmed' },
              { label: 'Reversed', value: 'reversed' },
              { label: 'Cancelled', value: 'cancelled' },
            ],
          },
        ]}
        searchKeys={['paymentNumber', 'customerName', 'invoiceNumber', 'collectedBy']}
        searchPlaceholder={t('billing.payments.search')}
      />
    </div>
  );
}
