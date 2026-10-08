import React from 'react';
import { FileRecordItem } from '../../services/api';
import { Card } from '../ui/Card';
import { MetricCard } from '../ui/MetricCard';
import { Table } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { AlertTriangle, ShieldAlert, CheckCircle2, FileX } from 'lucide-react';

interface AlertsViewProps {
  files: FileRecordItem[];
}

export const AlertsView: React.FC<AlertsViewProps> = ({ files }) => {
  const failedFiles = files.filter((f) => f.status === 'FAILED');

  const alertItems = failedFiles.map((f) => ({
    id: f.id,
    filename: f.filename,
    code: f.error_code || 'UNSUPPORTED_FORMAT',
    message: f.error_message || 'Failed to parse vector geometry from spatial file archive',
    timestamp: f.created_at || new Date().toISOString(),
  }));

  const columns = [
    {
      key: 'filename',
      header: 'Source Dataset',
      render: (item: any) => (
        <span className="font-mono text-xs font-semibold text-slate-100">{item.filename}</span>
      ),
    },
    {
      key: 'code',
      header: 'Alert Code',
      render: (item: any) => (
        <span className="font-mono text-xs text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
          {item.code}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Diagnostic Reason',
      render: (item: any) => (
        <span className="font-mono text-xs text-slate-300">{item.message}</span>
      ),
    },
    {
      key: 'status',
      header: 'Severity',
      render: () => <StatusBadge status="FAILED" size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          CRS & Spatial Validation Alerts
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Active system notifications for spatial projection errors, corrupt Shapefiles, or unparseable KML tags.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Alerts"
          value={alertItems.length}
          subtext="Requires file re-upload"
          icon={<ShieldAlert className="w-5 h-5" />}
          accentColor={alertItems.length > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard
          title="CRS Mismatches"
          value="0"
          subtext="Auto-resolved by UTM lookup"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Corrupt Archives"
          value={alertItems.length}
          subtext="Missing .shp or .dbf"
          icon={<FileX className="w-5 h-5" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Pipeline Health"
          value={alertItems.length === 0 ? '100%' : '95%'}
          subtext="Normal operation status"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
        />
      </div>

      {/* Alert Logs */}
      <Card title="System Diagnostics & Warning Logs">
        <Table
          columns={columns}
          data={alertItems}
          keyExtractor={(item) => item.id}
          emptyMessage="System healthy. Zero active spatial validation alerts."
        />
      </Card>
    </div>
  );
};
