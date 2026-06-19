'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';
import { PageHeader, formatDateTime } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SmartTable from '@/components/smart-table/SmartTable';
import { toast } from 'sonner';
import { Upload, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

export default function UploadCenterPage() {
  const t = useT();
  const [entityType, setEntityType] = useState('customers');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const qc = useQueryClient();

  const { data: history } = useQuery({
    queryKey: ['upload-history', entityType],
    queryFn: () => apiGet<any[]>(`/upload/history/${entityType}`),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) return;
      const text = await file.text();
      const rows = text.split('\n').filter(Boolean).slice(1).map(line => {
        const cols = line.split(',');
        if (entityType === 'customers') return { customerCode: cols[0]?.trim(), name: cols[1]?.trim(), phone: cols[2]?.trim(), email: cols[3]?.trim() };
        if (entityType === 'meters') return { serialNumber: cols[0]?.trim(), meterType: cols[1]?.trim(), brand: cols[2]?.trim(), model: cols[3]?.trim() };
        return {};
      });
      setPreview(rows);
      return apiPost(`/upload/${entityType}`, { rows });
    },
    onSuccess: (data: any) => { qc.invalidateQueries({ queryKey: ['upload-history'] }); toast.success(`Import: ${data.success} ok, ${data.failed} failed`); setPreview(null); setFile(null); },
    onError: () => toast.error('Upload failed'),
  });

  return (
    <div>
      <PageHeader title="Upload Center" subtitle="Bulk import data from CSV files" />
      <Tabs defaultValue="customers" onValueChange={setEntityType}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="meters">Meters</TabsTrigger>
        </TabsList>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Upload CSV</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Upload a CSV file with headers matching the template.</p>
              <Input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.info('Download template')}><Download className="h-3.5 w-3.5 mr-1" />Template</Button>
                <Button size="sm" onClick={() => uploadMutation.mutate()} disabled={!file || uploadMutation.isPending}><Upload className="h-3.5 w-3.5 mr-1" />{uploadMutation.isPending ? 'Uploading...' : 'Upload'}</Button>
              </div>
              {preview && <div className="text-xs text-muted-foreground">{preview.length} rows parsed. <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setPreview(null)}>Clear</Button></div>}
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-sm">Upload History</CardTitle></CardHeader>
            <CardContent>
              <SmartTable data={history ?? []} columns={[
                { key: 'entityType', label: 'Type' },
                { key: 'fileName', label: 'File' },
                { key: 'success', label: 'Success', render: (v: number) => <span className="text-emerald-500">{v}</span> },
                { key: 'failed', label: 'Failed', render: (v: number) => <span className="text-red-500">{v}</span> },
                { key: 'createdAt', label: 'Date', render: (v: string) => formatDateTime(v) },
              ]} />
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
