'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, Eye, Pencil, AlertTriangle, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { usePageStore } from '@/lib/router-store';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader, formatDate, formatDateTime } from '@/components/shared/PageHelpers';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { useReadingsList } from '@/hooks/use-readings';
import { useProjectsList } from '@/hooks/use-projects';
import { useT } from '@/lib/i18n/context';

export default function ReadingsPage() {
  const { navigate } = usePageStore();
  const t = useT();
  const [tab, setTab] = useState<'all' | 'review'>('all');
  const { data: apiReadings, isLoading, isError, error } = useReadingsList();
  const readings = apiReadings ?? [];
  const { data: apiProjects } = useProjectsList();
  const reviewQueue = readings.filter(r => r.status === 'pending_review' || r.status === 'suspicious');

  const columns = [
    {
      key: 'meterSerial', label: t('readings.meter'), sortable: true,
      render: (v: string) => <span className="font-mono text-xs">{v}</span>,
    },
    {
      key: 'meterType', label: t('readings.type'), width: '120px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    { key: 'customerName', label: 'Customer', render: (v: string) => v || '-' },
    { key: 'unitNumber', label: 'Unit', width: '90px', render: (v: string) => v || '-' },
    { key: 'previousReading', label: 'Previous', width: '100px' },
    { key: 'currentReading', label: 'Current', width: '90px' },
    { key: 'consumption', label: t('billing.consumption.consumption'), width: '110px' },
    {       key: 'readingDate', label: t('readings.date'), sortable: true, width: '110px', render: (v: string) => formatDate(v) },
    {
      key: 'source', label: 'Source', width: '100px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'status', label: t('readings.status'), width: '120px',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: 'anomaly', label: '', width: '40px',
      render: (v: boolean) => v ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : null,
    },
    { key: 'enteredBy', label: 'Entered By', width: '110px' },
    {
      key: 'actions', label: '', width: '50px',
      render: (_val: unknown, row: { id: string }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info('View reading details'); }}><Eye className="h-4 w-4 mr-2" /> {t('common.view')}</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info('Edit reading'); }}><Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('readings.title')}
        subtitle="View and manage all meter readings"
        action={
          <Button className="gap-2" onClick={() => navigate('reading-new')}>
            <Plus className="h-4 w-4" /> {t('readings.newReading')}
          </Button>
        }
      />
      <div className="flex gap-2 mb-4 border-b border-border">
        <button onClick={() => setTab('all')} className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${tab === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t('readings.title')}</button>
        <button onClick={() => setTab('review')} className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${tab === 'review' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'} flex items-center gap-1`}>{t('readings.reviewQueue')} {reviewQueue.length > 0 && <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">{reviewQueue.length}</span>}</button>
      </div>
      <QueryBoundary isLoading={isLoading} isError={isError} error={error}>
      <SmartTable
        data={tab === 'review' ? reviewQueue : readings}
        columns={columns}
        filters={[
          {
            key: 'meterType', label: 'Meter Type', type: 'select',
            options: [
              { label: 'Electricity', value: 'electricity' },
              { label: 'Main Water', value: 'main_water' },
              { label: 'Child Water', value: 'child_water' },
            ],
          },
          {
            key: 'status', label: 'Status', type: 'select',
            options: [
              { label: t('readings.valid'), value: 'valid' },
              { label: t('readings.pending'), value: 'pending_review' },
              { label: t('readings.estimated'), value: 'estimated' },
              { label: t('readings.suspicious'), value: 'suspicious' },
              { label: t('readings.corrected'), value: 'corrected' },
              { label: t('readings.rejected'), value: 'rejected' },
            ],
          },
          {
            key: 'source', label: 'Source', type: 'select',
            options: [
              { label: 'Automated', value: 'automated' },
              { label: 'Manual', value: 'manual' },
              { label: 'Estimated', value: 'estimated' },
            ],
          },
          {
            key: 'projectId', label: 'Project', type: 'select',
            options: (apiProjects ?? []).map((p: { name: string; id: string }) => ({ label: p.name, value: p.id })),
          },
          {
            key: 'anomaly', label: 'Anomaly Only', type: 'select',
            options: [
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' },
            ],
          },
        ]}
        searchKeys={['meterSerial', 'customerName', 'unitNumber', 'enteredBy']}
        searchPlaceholder={t('readings.search')}
      />
      </QueryBoundary>
    </div>
  );
}
