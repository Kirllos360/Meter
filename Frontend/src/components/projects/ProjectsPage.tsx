'use client';

import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { usePageStore } from '@/lib/router-store';
import SmartTable from '@/components/smart-table/SmartTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHelpers';
import { formatDate } from '@/components/shared/PageHelpers';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { useT } from '@/lib/i18n/context';
import { useProjectsList } from '@/hooks/use-projects';

export default function ProjectsPage() {
  const t = useT();
  const { navigate } = usePageStore();
  const { data: apiProjects, isLoading, isError, error } = useProjectsList();
  const projects = apiProjects ?? [];
  const areas = [...new Set(projects.map((p) => p.area))];

  const columns = [
    { key: 'code', label: t('projects.code'), sortable: true, width: '100px' },
    { key: 'name', label: t('projects.name'), sortable: true },
    { key: 'location', label: t('projects.location'), sortable: true },
    { key: 'area', label: t('projects.area'), sortable: true },
    { key: 'buildings', label: t('projects.buildings'), sortable: true, width: '90px' },
    { key: 'units', label: t('projects.units'), sortable: true, width: '80px' },
    { key: 'customers', label: t('projects.customerCount'), sortable: true, width: '100px' },
    { key: 'activeMeters', label: t('projects.activeMeters'), sortable: true, width: '110px' },
    {
      key: 'status', label: t('projects.status'), sortable: true, width: '110px',
      render: (val: string) => <StatusBadge status={val} />,
    },
    {
      key: 'createdAt', label: t('projects.created'), sortable: true, width: '110px',
      render: (val: string) => formatDate(val),
    },
    {
      key: 'actions', label: t('common.actions'), width: '60px',
      render: (_val: unknown, row: { id: string; name: string }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate('project-detail', { id: row.id }); }}>
              <Eye className="h-4 w-4 mr-2" /> {t('common.view')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info(t('common.edit') + ': ' + row.name); }}>
              <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info(t('common.delete') + ': ' + row.name); }} className="text-red-500">
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
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        action={
          <Button className="gap-2" onClick={() => toast.info(t('projects.create') + ' ' + t('common.dialog'))}>
            <Plus className="h-4 w-4" /> {t('projects.create')}
          </Button>
        }
      />
      <QueryBoundary isLoading={isLoading} isError={isError} error={error} isEmpty={!isLoading && projects.length === 0} emptyMessage={t('projects.noProjects')}>
      <SmartTable
        data={projects}
        columns={columns}
        filters={[
          {
            key: 'status', label: t('projects.status'), type: 'select',
            options: [
              { label: t('common.active'), value: 'active' },
              { label: t('common.inactive'), value: 'inactive' },
              { label: t('common.completed'), value: 'completed' },
              { label: t('common.archived'), value: 'archived' },
            ],
          },
          {
            key: 'area', label: t('projects.area'), type: 'select',
            options: areas.map((a) => ({ label: a, value: a })),
          },
        ]}
        onRowClick={(row) => navigate('project-detail', { id: row.id })}
        searchKeys={['name', 'code', 'location', 'area']}
        searchPlaceholder={t('projects.search')}
      />
      </QueryBoundary>
    </div>
  );
}
