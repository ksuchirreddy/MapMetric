import React, { useState } from 'react';
import { FileRecordItem } from '../../services/api';
import { Card3D } from '../ui/Card3D';
import { Table } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchInput } from '../ui/SearchInput';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Server, FileCode, RefreshCw, Upload, Eye, Filter } from 'lucide-react';

interface InfrastructureViewProps {
  files: FileRecordItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectFile: (fileId: string) => void;
  onOpenUploadModal: () => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  files,
  isLoading,
  onRefresh,
  onSelectFile,
  onOpenUploadModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');

  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const ext = f.filename.endsWith('.kml') ? 'KML' : 'ZIP';
    const matchesFormat = formatFilter === 'ALL' || ext === formatFilter;
    return matchesSearch && matchesFormat;
  });

  const columns = [
    {
      key: 'filename',
      header: 'Dataset Layer',
      render: (item: FileRecordItem) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-slate-100 block">
              {item.filename}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">UUID: {item.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'file_type',
      header: 'Spatial Type',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-slate-300 uppercase bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 font-bold">
          {item.filename.endsWith('.kml') ? 'KML Vector' : 'Shapefile Archive'}
        </span>
      ),
    },
    {
      key: 'feature_count',
      header: 'Indexed Features',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs font-bold text-emerald-400">
          {item.feature_count} features
        </span>
      ),
    },
    {
      key: 'crs',
      header: 'Default CRS',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-slate-400">{item.crs || 'Auto UTM (WGS 84)'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Pipeline Status',
      render: (item: FileRecordItem) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'created_at',
      header: 'Ingested At',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-slate-400">
          {item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Inspect',
      render: (item: FileRecordItem) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onSelectFile(item.id);
          }}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          View Layer
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card3D glowColor="blue">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Infrastructure & Layer Catalog
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Registered spatial file pipelines, vector layers, and database index storage.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onRefresh} isLoading={isLoading} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh Layers
            </Button>
            <Button size="sm" onClick={onOpenUploadModal} icon={<Upload className="w-3.5 h-3.5" />}>
              Upload Layer
            </Button>
          </div>
        </div>
      </Card3D>

      {/* Filter Bar */}
      <Card3D glowColor="cyan" className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search layers by filename or dataset ID..."
            containerClassName="w-full md:w-96"
          />

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Format:</span>
            </div>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Formats</option>
              <option value="KML">KML (.kml)</option>
              <option value="ZIP">Shapefile (.zip)</option>
            </select>
          </div>
        </div>
      </Card3D>

      {/* Table */}
      <Card3D glowColor="emerald">
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-100 font-mono">
            Spatial Layers ({filteredFiles.length})
          </h3>
          {filteredFiles.length === 0 && !isLoading ? (
            <EmptyState onAction={onOpenUploadModal} />
          ) : (
            <Table
              columns={columns}
              data={filteredFiles}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => onSelectFile(item.id)}
              isLoading={isLoading}
            />
          )}
        </div>
      </Card3D>
    </div>
  );
};
