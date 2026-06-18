'use client';

import { useState } from 'react';
import { mockReports } from '@/lib/mock-data';
import { PageHeader } from '@/components/shared/PageHelpers';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Gauge, Activity, Zap, Droplets, GitBranch, Receipt, Banknote,
  Scale, WifiOff, AlertTriangle, Shield, Filter, Download, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n/context';

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="h-6 w-6" />,
  Gauge: <Gauge className="h-6 w-6" />,
  Activity: <Activity className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Droplets: <Droplets className="h-6 w-6" />,
  GitBranch: <GitBranch className="h-6 w-6" />,
  Receipt: <Receipt className="h-6 w-6" />,
  Banknote: <Banknote className="h-6 w-6" />,
  Scale: <Scale className="h-6 w-6" />,
  WifiOff: <WifiOff className="h-6 w-6" />,
  AlertTriangle: <AlertTriangle className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
};

const categoryColors: Record<string, string> = {
  Billing: 'bg-emerald-500/15 text-emerald-500',
  Operations: 'bg-blue-500/15 text-blue-500',
  System: 'bg-violet-500/15 text-violet-500',
};

export default function ReportsPage() {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = ['all', ...new Set(mockReports.map((r) => r.category))];
  const filtered = activeCategory === 'all' ? mockReports : mockReports.filter((r) => r.category === activeCategory);

  return (
    <div>
      <PageHeader title={t('reports.title')} subtitle="Generate, view, and export reports" />

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? t('common.all') : cat}
          </Button>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((report) => (
          <Card key={report.id} className="glass-card border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="text-primary">{iconMap[report.icon] || <FileText className="h-6 w-6" />}</div>
                <span className={categoryColors[report.category] || ''}>
                  <StatusBadge status={report.category.toLowerCase()} label={report.category} />
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-1">{report.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{report.description}</p>
              {report.lastGenerated && (
                <p className="text-xs text-muted-foreground mb-3">Last generated: {report.lastGenerated}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast.info('Filters dialog would open')}>
                  <Filter className="h-3 w-3" /> Filters
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast.info('Export CSV placeholder')}>
                  <Download className="h-3 w-3" /> CSV
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast.info('Export XLSX placeholder')}>
                  <Download className="h-3 w-3" /> XLSX
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast.info('Preview report')}>
                  <Eye className="h-3 w-3" /> Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
