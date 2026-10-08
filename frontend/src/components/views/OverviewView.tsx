import React, { useState, useEffect } from 'react';
import {
  FileRecordItem,
  api,
} from '../../services/api';
import { MetricCard } from '../ui/MetricCard';
import { SpatialCard } from '../spatial/SpatialCard';
import { Table } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { MagneticButton } from '../spatial/MagneticButton';
import { RollingNumber } from '../spatial/RollingNumber';
import { EmptyState } from '../ui/EmptyState';
import { HolographicGlobe } from '../3d/HolographicGlobe';
import { Spatial3DNetwork } from '../3d/Spatial3DNetwork';
import { Spatial3DBarChart } from '../3d/Spatial3DBarChart';
import { formatArea, formatNumber } from '../../lib/utils';
import {
  Upload,
  RefreshCw,
  FileCode,
  ChevronRight,
  Sparkles,
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
      header: 'Spatial File',
      render: (item: FileRecordItem) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#141A2B] text-[#F0C879] border border-[#D6A24A]/30 shadow-lg">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-[#ECE8DF] block">
              {item.filename}
            </span>
            <span className="text-[10px] text-[#A9A8A0] font-mono">
              ID: {item.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'file_type',
      header: 'Format',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-[#ECE8DF] uppercase bg-[#141A2B] px-2.5 py-1 rounded-md border border-[#ECE8DF]/10 font-bold">
          {item.file_type || (item.filename.endsWith('.kml') ? 'KML' : 'SHP ZIP')}
        </span>
      ),
    },
    {
      key: 'feature_count',
      header: 'Features',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-[#5FE0B0] font-bold">
          {formatNumber(item.feature_count)}
        </span>
      ),
    },
    {
      key: 'crs',
      header: 'Target Projection',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-[#A9A8A0]">
          {item.crs || 'Auto-UTM WGS84'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: FileRecordItem) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'processing_time_ms',
      header: 'Processing Time',
      render: (item: FileRecordItem) => (
        <span className="font-mono text-xs text-[#A9A8A0]">
          {item.processing_time_ms !== null && item.processing_time_ms !== undefined
            ? `${item.processing_time_ms} ms`
            : '-'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (item: FileRecordItem) => (
        <MagneticButton
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onSelectFile(item.id);
          }}
          className="min-h-[32px] px-3 text-[10px]"
          icon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Inspect
        </MagneticButton>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* S1 IGNITION HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Command Content */}
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D6A24A]/10 border border-[#F0C879]/30 text-[#F0C879] text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            THE SIGNAL ORRERY • SPATIAL CORE
          </div>

          <h1 className="text-4xl sm:text-6xl font-normal font-serif tracking-tight text-[#ECE8DF] leading-tight">
            Precision Geospatial <br />
            <span className="brass-sheen italic">Metric Orrery</span>
          </h1>

          <p className="text-sm text-[#A9A8A0] leading-relaxed max-w-xl">
            WGS84 geodesic coordinate transformation to UTM projection zones. Sub-meter surface area (<span className="font-mono text-[#F0C879]">m²</span>) & distance (<span className="font-mono text-[#F0C879]">m</span>) calculations with automated Shapely topology repairs.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <MagneticButton
              variant="brass"
              onClick={onOpenUploadModal}
              icon={<Upload className="w-4 h-4" />}
            >
              Upload Spatial Data
            </MagneticButton>
            <MagneticButton
              variant="outline"
              onClick={onRefresh}
              isLoading={isLoading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh Orrery
            </MagneticButton>
          </div>
        </div>

        {/* Right Interactive 3D Holographic Globe Core */}
        <div className="lg:col-span-6">
          <HolographicGlobe
            featureCount={totalFeatures}
            activeDatasetName={files[0]?.filename}
          />
        </div>
      </div>

      {/* S2 THE CORE: KEY METRICS WITH ROLLING NUMERALS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpatialCard glowColor="brass">
          <MetricCard
            title="Total Datasets"
            value={<RollingNumber value={files.length} />}
            change={files.length > 0 ? '+100%' : '0%'}
            trend="up"
            subtext="Uploaded KML & Shapefiles"
            accentColor="emerald"
            visType="datasets"
          />
        </SpatialCard>

        <SpatialCard glowColor="glass">
          <MetricCard
            title="Processed Geometries"
            value={<RollingNumber value={totalFeatures} />}
            change={`${totalFeatures} Total`}
            trend="up"
            subtext="Indexed vector features"
            accentColor="blue"
            visType="features"
          />
        </SpatialCard>

        <SpatialCard glowColor="brass">
          <MetricCard
            title="Measured Area"
            value={isCalculating ? 'Computing...' : formatArea(totalArea)}
            change="UTM m²"
            trend="neutral"
            subtext="Aggregated polygon surface area"
            accentColor="cyan"
            visType="area"
          />
        </SpatialCard>

        <SpatialCard glowColor="degraded">
          <MetricCard
            title="Avg Processing Latency"
            value={<RollingNumber value={avgProcessingTime} unit="ms" />}
            change="Optimal"
            trend="up"
            subtext="PyProj transformation speed"
            accentColor="amber"
            visType="latency"
          />
        </SpatialCard>
      </div>

      {/* S4 TIME RINGS & S5 FLARES: 3D VISUALIZATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Topology Network Graph */}
        <SpatialCard glowColor="glass" className="p-0 overflow-hidden">
          <Spatial3DNetwork files={files} />
        </SpatialCard>

        {/* 3D Extruded Bar Chart */}
        <SpatialCard glowColor="brass" className="p-0 overflow-hidden">
          <Spatial3DBarChart files={files} />
        </SpatialCard>
      </div>

      {/* S3 THE ORBITS: DATASETS TABLE */}
      <SpatialCard glowColor="brass">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE8DF]/10 pb-3">
            <div>
              <h3 className="text-lg font-serif text-[#ECE8DF]">
                Spatial Dataset Registry <span className="text-xs font-mono text-[#A9A8A0] font-normal">({files.length} active layers)</span>
              </h3>
              <p className="text-xs text-[#A9A8A0]">Vector layer pipelines & database index</p>
            </div>
            <MagneticButton
              variant="outline"
              onClick={onOpenUploadModal}
              className="min-h-[36px] text-[11px]"
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Upload Layer
            </MagneticButton>
          </div>

          {files.length === 0 && !isLoading ? (
            <EmptyState onAction={onOpenUploadModal} />
          ) : (
            <Table
              columns={datasetColumns}
              data={files}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => onSelectFile(item.id)}
              isLoading={isLoading}
            />
          )}
        </div>
      </SpatialCard>
    </div>
  );
};
