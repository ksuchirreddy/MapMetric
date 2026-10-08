import React, { useState, useEffect } from 'react';
import {
  FileRecordItem,
  api,
} from '../../services/api';
import { Table } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { RollingNumber } from '../spatial/RollingNumber';
import { EmptyState } from '../ui/EmptyState';
import { Spatial3DNetwork } from '../3d/Spatial3DNetwork';
import { Spatial3DBarChart } from '../3d/Spatial3DBarChart';
import { formatArea, formatNumber } from '../../lib/utils';
import {
  Upload,
  RefreshCw,
  FileCode,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Zap,
  Activity
} from 'lucide-react';

interface OverviewViewProps {
  files: FileRecordItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectFile: (fileId: string) => void;
  onOpenUploadModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  files,
  isLoading,
  onRefresh,
  onSelectFile,
  onOpenUploadModal,
}) => {
  const [totalArea, setTotalArea] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const computeStats = async () => {
      const completedFiles = files.filter((f) => f.status === 'COMPLETED');
      if (completedFiles.length === 0) return;

      setIsCalculating(true);
      let cumulativeArea = 0;

      for (const file of completedFiles.slice(0, 10)) {
        try {
          const res = await api.getMeasurements(file.id, false);
          res.measurements.forEach((m) => {
            if (m.measurement_type === 'area' && m.value) {
              cumulativeArea += m.value;
            }
          });
        } catch (err) {
          console.error(`Failed to load measurements for ${file.id}`, err);
        }
      }

      if (isMounted) {
        setTotalArea(cumulativeArea);
        setIsCalculating(false);
      }
    };

    computeStats();
    return () => {
      isMounted = false;
    };
  }, [files]);

  const totalFeatures = files.reduce((acc, f) => acc + (f.feature_count || 0), 0);
  const avgProcessingTime =
    files.length > 0
      ? (
          files.reduce((acc, f) => acc + (f.processing_time_ms || 0), 0) / files.length
        ).toFixed(1)
      : '0';

  const datasetColumns = [
    {
      key: 'filename',
      header: 'SPATIAL DATASET FILE',
      render: (item: FileRecordItem) => (
        <div className="flex items-center gap-3 group/icon">
          <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 shadow-lg group-hover/icon:rotate-6 group-hover/icon:scale-110 transition-transform duration-300">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-white group-hover:text-amber-200 transition-colors block">
              {item.filename}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              ID: {item.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'file_type',
      header: 'FORMAT',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-white uppercase bg-white/5 px-2.5 py-1 rounded-md border border-white/10 font-bold">
          {item.file_type || (item.filename.endsWith('.kml') ? 'KML' : 'SHP ZIP')}
        </span>
      ),
    },
    {
      key: 'feature_count',
      header: 'FEATURES',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-emerald-400 font-bold">
          {formatNumber(item.feature_count)}
        </span>
      ),
    },
    {
      key: 'crs',
      header: 'TARGET PROJECTION',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-gray-400">
          {item.crs || 'Auto-UTM WGS84'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (item: FileRecordItem) => <StatusBadge status={item.status} size="sm" variant="spatial" />,
    },
    {
      key: 'processing_time_ms',
      header: 'LATENCY',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-gray-400">
          {item.processing_time_ms !== null && item.processing_time_ms !== undefined
            ? `${item.processing_time_ms} ms`
            : '-'}
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
    <div className="space-y-12 pb-16">
      
      {/* 1. ELEGANT HERO SECTION FLOATING DIRECTLY OVER 3D LIQUID METAL SCULPTURE */}
      <div className="flex flex-col items-center text-center pt-8 pb-4 max-w-4xl mx-auto space-y-6">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-amber-300 text-xs font-mono font-medium shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>THE SIGNAL ORRERY • SPATIAL CORE v2.0</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-light font-serif tracking-tight text-white leading-[1.1] text-center">
          Precision <span className="font-serif italic text-amber-200/90 font-normal">Geospatial Metric</span> Orchestration
        </h1>

        <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-light max-w-2xl text-center">
          WGS84 geodesic coordinate transformation to UTM projection zones. Sub-meter surface area (<span className="font-mono text-amber-300 font-semibold">m²</span>) & distance (<span className="font-mono text-amber-300 font-semibold">m</span>) calculations with automated Shapely topology repairs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onOpenUploadModal}
            className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white px-8 py-3.5 rounded-full border border-white/10 text-base font-medium shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 group"
          >
            <Upload className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Upload Spatial Data</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onRefresh}
            className="text-gray-300 hover:text-white px-7 py-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-base font-medium transition-all duration-300 flex items-center gap-2 backdrop-blur-md"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Orrery</span>
          </button>
        </div>
      </div>

      {/* 2. FLOATING SPATIAL KPI METRIC NODES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1 */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300 shadow-2xl group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 tracking-wider uppercase font-medium">TOTAL DATASETS</span>
            <div className="p-2 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-light text-white font-mono tracking-tight mb-2">
            <RollingNumber value={files.length} />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-t border-white/5 pt-3">
            <span className="text-emerald-400 font-semibold">{files.length > 0 ? '+100%' : '0%'}</span>
            <span>Uploaded KML & SHP</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300 shadow-2xl group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 tracking-wider uppercase font-medium">INDEXED FEATURES</span>
            <div className="p-2 rounded-xl bg-blue-400/10 border border-blue-400/30 text-blue-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-light text-white font-mono tracking-tight mb-2">
            <RollingNumber value={totalFeatures} />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-t border-white/5 pt-3">
            <span className="text-blue-400 font-semibold">{totalFeatures} Vector Objects</span>
            <span>UTM Transformed</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300 shadow-2xl group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 tracking-wider uppercase font-medium">MEASURED AREA</span>
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-light text-amber-200 font-mono tracking-tight mb-2 truncate">
            {isCalculating ? 'Computing...' : formatArea(totalArea)}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-t border-white/5 pt-3">
            <span className="text-amber-300 font-semibold">UTM m²</span>
            <span>Geodesic Surface</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300 shadow-2xl group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 tracking-wider uppercase font-medium">AVG LATENCY</span>
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-light text-white font-mono tracking-tight mb-2">
            <RollingNumber value={avgProcessingTime} unit="ms" />
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-t border-white/5 pt-3">
            <span className="text-emerald-400 font-semibold">Sub-50ms</span>
            <span>PyProj Engine</span>
          </div>
        </div>

      </div>

      {/* 3. 3D VISUALIZATIONS INTEGRATED IN SPATIAL ENVIRONMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 p-2 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <Spatial3DNetwork files={files} />
        </div>

        <div className="rounded-3xl border border-white/10 p-2 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <Spatial3DBarChart files={files} />
        </div>
      </div>

      {/* 4. FLOATING SPATIAL DATASET REGISTRY TABLE */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-mono tracking-widest text-gray-400 uppercase font-semibold">
              SPATIAL DATASET REGISTRY
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
              0{files.length}
            </span>
          </div>
          <button
            onClick={onOpenUploadModal}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-2xl text-xs font-mono font-medium backdrop-blur-md transition-all hover:scale-105 shadow-xl flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Layer</span>
          </button>
        </div>

        {/* Animated Light Trail Line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-amber-400/50 via-white/20 to-transparent mb-6 relative overflow-hidden">
          <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-marquee" />
        </div>

        {/* Floating Table Rows Direct in Environment */}
        {files.length === 0 && !isLoading ? (
          <EmptyState onAction={onOpenUploadModal} />
        ) : (
          <Table
            variant="spatial"
            columns={datasetColumns}
            data={files}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => onSelectFile(item.id)}
            isLoading={isLoading}
          />
        )}
      </div>

    </div>
  );
};
