'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { usePageStore } from '@/lib/router-store';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHelpers';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/context';
import { useProjectsList } from '@/hooks/use-projects';
import {
  useCustomersList, useCreateCustomer, useUpdateCustomer, useDeleteCustomer,
  type CreateCustomerPayload, type UpdateCustomerPayload,
} from '@/hooks/use-customers';
import type { Customer } from '@/lib/types';

type DialogMode = 'create' | 'edit' | null;

const INITIAL_FORM: CreateCustomerPayload = {
  customerCode: '', name: '', phone: '', email: '',
  customerType: 'individual', nationalOrCommercialId: '',
};

export default function CustomersPage() {
  const t = useT();
  const { navigate } = usePageStore();
  const [projectFilter, setProjectFilter] = useState<string>('');
  const handleProjectChange = (v: string) => setProjectFilter(v === '__all__' ? '' : v);
  const { data: apiProjects, isLoading, isError, error } = useProjectsList();
  const projects = apiProjects ?? [];
  const { data: apiCustomers } = useCustomersList(projectFilter);
  const customers = apiCustomers ?? [];
  const createMutation = useCreateCustomer(projectFilter);
  const updateMutation = useUpdateCustomer(projectFilter);
  const deleteMutation = useDeleteCustomer(projectFilter);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [form, setForm] = useState<CreateCustomerPayload>(INITIAL_FORM);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setEditTarget(null);
    setDialogMode('create');
  };

  const openEdit = (customer: Customer) => {
    setEditTarget(customer);
    setForm({
      customerCode: customer.code,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      customerType: customer.customerType,
      nationalOrCommercialId: '',
    });
    setDialogMode('edit');
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync(form);
        toast.success(t('customers.created'));
      } else if (dialogMode === 'edit' && editTarget) {
        const data: UpdateCustomerPayload = { ...form };
        await updateMutation.mutateAsync({ id: editTarget.id, data });
        toast.success(t('customers.updated'));
      }
      setDialogMode(null);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t('customers.deleted'));
      setDeleteTarget(null);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const columns = [
    { key: 'code', label: t('customers.code'), sortable: true, width: '120px' },
    { key: 'name', label: t('customers.name'), sortable: true },
    { key: 'phone', label: t('customers.phone'), width: '140px' },
    { key: 'email', label: t('customers.email'), render: (v: string) => <span className="text-xs">{v}</span> },
    {
      key: 'customerType', label: t('customers.type'), sortable: true, width: '120px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: 'projectName', label: t('customers.project'), sortable: true },
    { key: 'activeMeters', label: t('customers.meterCount'), width: '80px' },
    {
      key: 'currentBalance', label: t('customers.balance'), sortable: true, width: '110px',
      render: (v: number) => (
        <span className={cn(v > 0 ? 'text-red-500' : v < 0 ? 'text-blue-500' : 'text-emerald-500', 'font-medium')}>
          {v.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status', label: t('customers.status'), sortable: true, width: '100px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'actions', label: t('common.actions'), width: '60px',
      render: (_val: unknown, row: Customer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate('customer-detail', { projectId: row.projectId, id: row.id }); }}>
              <Eye className="h-4 w-4 mr-2" /> {t('common.view')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
              <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} className="text-red-500">
              <Trash2 className="h-4 w-4 mr-2" /> {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('customers.title')}
        subtitle={t('customers.subtitle')}
        action={
          <Button className="gap-2" onClick={openCreate} disabled={!projectFilter}>
            <Plus className="h-4 w-4" /> {t('customers.add')}
          </Button>
        }
      />
      <QueryBoundary isLoading={isLoading} isError={apiProjects ? isError : false} error={error}>
      <div className="mb-4">
        <Select value={projectFilter} onValueChange={handleProjectChange}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder={t('customers.allProjects')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('customers.allProjects')}</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SmartTable
        data={customers}
        columns={columns}
        filters={[
          {
            key: 'balanceState', label: t('customers.balance'), type: 'select',
            options: [
              { label: t('customers.balancePositive'), value: 'positive' },
              { label: t('customers.balanceZero'), value: 'zero' },
              { label: t('customers.creditBalance'), value: 'credit' },
            ],
          },
          {
            key: 'status', label: t('customers.status'), type: 'select',
            options: [
              { label: t('common.active'), value: 'active' },
              { label: t('common.inactive'), value: 'inactive' },
              { label: t('common.suspended'), value: 'suspended' },
            ],
          },
        ]}
        searchKeys={['name', 'code', 'phone', 'email']}
        searchPlaceholder={t('customers.search')}
        onRowClick={(row) => navigate('customer-detail', { projectId: row.projectId, id: row.id })}
      />
      </QueryBoundary>

      <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? t('customers.add') : t('common.edit')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('customers.code')}</label>
              <Input value={form.customerCode} onChange={(e) => setForm({ ...form, customerCode: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('customers.name')}</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('customers.phone')}</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('customers.email')}</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('customers.type')}</label>
              <Select value={form.customerType} onValueChange={(v) => setForm({ ...form, customerType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">{t('customers.individual')}</SelectItem>
                  <SelectItem value="company">{t('customers.company')}</SelectItem>
                  <SelectItem value="tenant">{t('customers.tenant')}</SelectItem>
                  <SelectItem value="owner">{t('customers.owner')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">{t('customers.nationalOrCommercialId')}</label>
              <Input value={form.nationalOrCommercialId} onChange={(e) => setForm({ ...form, nationalOrCommercialId: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {dialogMode === 'create' ? t('customers.add') : t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('customers.deleteConfirm', { name: deleteTarget?.name })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
