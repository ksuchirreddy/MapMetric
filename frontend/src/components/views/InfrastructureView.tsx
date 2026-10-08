import React, { useState } from 'react';
import { FileRecordItem } from '../../services/api';
import { Table } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchInput } from '../ui/SearchInput';
import { EmptyState } from '../ui/EmptyState';
import { FileCode, RefreshCw, Upload, Filter, Sparkles, ChevronRight } from 'lucide-react';

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
      header: 'DATASET LAYER',
      render: (item: FileRecordItem) => (
        <div className="flex items-center gap-3 group/icon">
          <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 shadow-lg group-hover/icon:rotate-6 group-hover/icon:scale-110 transition-transform duration-300">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-white group-hover:text-amber-200 transition-colors block">
              {item.filename}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">UUID: {item.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'file_type',
      header: 'SPATIAL TYPE',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-white uppercase bg-white/5 px-2.5 py-1 rounded-md border border-white/10 font-bold">
          {item.filename.endsWith('.kml') ? 'KML Vector' : 'Shapefile Archive'}
        </span>
      ),
    },
    {
      key: 'feature_count',
      header: 'INDEXED FEATURES',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs font-bold text-emerald-400">
          {item.feature_count} features
        </span>
      ),
    },
    {
      key: 'crs',
      header: 'DEFAULT CRS',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-gray-400">{item.crs || 'Auto UTM (WGS 84)'}</span>
      ),
    },
    {
      key: 'status',
      header: 'PIPELINE STATUS',
      render: (item: FileRecordItem) => <StatusBadge status={item.status} size="sm" variant="spatial" />,
    },
    {
      key: 'created_at',
      header: 'INGESTED AT',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-gray-400">
          {item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'ACTION',
      render: (item: FileRecordItem) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectFile(item.id);
          }}
          className="bg-white/5 hover:bg-white/15 text-white border border-white/10 hover:border-amber-400/40 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all hover:scale-105 shadow-md flex items-center gap-1.5 group/btn"
        >
          <span>View Layer</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. FLOATING LIGHTWEIGHT HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>INFRASTRUCTURE DATASETS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-light font-serif tracking-tight text-white flex items-center gap-3">
            Infrastructure & <span className="font-serif italic text-blue-200/90 font-normal">Layer Catalog</span>
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-2 leading-relaxed max-w-xl">
            Registered spatial file pipelines, vector layers, and database index storage floating in spatial memory.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-2xl text-xs font-mono font-medium backdrop-blur-md transition-all hover:scale-105 shadow-xl flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Layers</span>
          </button>
          
          <button
            onClick={onOpenUploadModal}
            className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white px-5 py-2.5 rounded-2xl border border-white/10 text-xs font-mono font-medium shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Layer</span>
          </button>
        </div>
      </div>

      {/* 2. FLOATING SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
        <div className="relative w-full md:w-96 group">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search layers by filename or dataset ID..."
            containerClassName="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl group-hover:border-white/20 transition-all text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md hover:border-white/20 transition-all">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono text-gray-400">Format:</span>
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-black text-white">All Formats</option>
            <option value="KML" className="bg-black text-white">KML (.kml)</option>
            <option value="ZIP" className="bg-black text-white">Shapefile (.zip)</option>
          </select>
        </div>
      </div>

      {/* 3. "SPATIAL LAYERS" SECTION WITH ANIMATED LIGHT TRAIL */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-mono tracking-widest text-gray-400 uppercase font-semibold">
              SPATIAL LAYERS
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
              0{filteredFiles.length}
            </span>
          </div>
        </div>

        {/* Animated Light Trail Line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-amber-400/50 via-white/20 to-transparent mb-6 relative overflow-hidden">
          <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-marquee" />
        </div>

        {/* Floating Table Rows Direct in Environment */}
        {filteredFiles.length === 0 && !isLoading ? (
          <EmptyState onAction={onOpenUploadModal} />
        ) : (
          <Table
            variant="spatial"
            columns={columns}
            data={filteredFiles}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => onSelectFile(item.id)}
            isLoading={isLoading}
          />
        )}
      </div>

    </div>
  );
};
