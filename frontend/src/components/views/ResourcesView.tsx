import React, { useState, useEffect } from 'react';
import { FileRecordItem, MeasurementItem, api } from '../../services/api';
import { Table } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchInput } from '../ui/SearchInput';
import { Drawer } from '../ui/Drawer';
import { EmptyState } from '../ui/EmptyState';
import { formatArea, formatLength } from '../../lib/utils';
import { Eye, Filter, Code2, Sparkles } from 'lucide-react';

interface ResourcesViewProps {
  files: FileRecordItem[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  files,
  selectedFileId,
  onSelectFile,
}) => {
  const [activeFileId, setActiveFileId] = useState<string>(
    selectedFileId || (files.length > 0 ? files[0].id : '')
  );
  const [measurements, setMeasurements] = useState<MeasurementItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [inspectedFeature, setInspectedFeature] = useState<MeasurementItem | null>(null);

  useEffect(() => {
    if (selectedFileId) setActiveFileId(selectedFileId);
    else if (files.length > 0 && !activeFileId) setActiveFileId(files[0].id);
  }, [selectedFileId, files]);

  useEffect(() => {
    if (!activeFileId) return;
    let isMounted = true;
    setIsLoading(true);
    api
      .getMeasurements(activeFileId, true, 200)
      .then((res) => {
        if (isMounted) {
          setMeasurements(res.measurements || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(`Error loading features for ${activeFileId}`, err);
        if (isMounted) {
          setMeasurements([]);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [activeFileId]);

  const activeFile = files.find((f) => f.id === activeFileId);

  const filteredMeasurements = measurements.filter((m) => {
    const geomStr = (m.geometry_type || '').toLowerCase();
    const propStr = JSON.stringify(m.properties || {}).toLowerCase();
    const searchMatch =
      geomStr.includes(searchTerm.toLowerCase()) ||
      propStr.includes(searchTerm.toLowerCase()) ||
      String(m.feature_id).includes(searchTerm);
    const typeMatch = typeFilter === 'ALL' || (m.geometry_type || '').toUpperCase() === typeFilter;
    return searchMatch && typeMatch;
  });

  const featureColumns = [
    {
      key: 'feature_id',
      header: 'FEATURE ID',
      render: (item: MeasurementItem) => (
        <span className="font-mono text-xs font-bold text-emerald-400">
          #{item.feature_id}
        </span>
      ),
    },
    {
      key: 'geometry_type',
      header: 'GEOMETRY TYPE',
      render: (item: MeasurementItem) => (
        <span className="font-mono text-xs text-gray-200 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 font-medium">
          {item.geometry_type || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'measurement_type',
      header: 'DIMENSION',
      render: (item: MeasurementItem) => (
        <span className="font-mono text-xs text-gray-400 capitalize">
          {item.measurement_type || '-'}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'MEASURED OUTPUT',
      render: (item: MeasurementItem) => (
        <span className="font-mono text-xs font-semibold text-white">
          {item.measurement_type === 'area'
            ? formatArea(item.value)
            : item.measurement_type === 'length'
            ? formatLength(item.value)
            : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (item: MeasurementItem) => <StatusBadge status={item.status} size="sm" variant="spatial" />,
    },
    {
      key: 'action',
      header: 'ACTION',
      render: (item: MeasurementItem) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setInspectedFeature(item);
          }}
          className="bg-white/5 hover:bg-white/15 text-white border border-white/10 hover:border-emerald-400/40 px-3 py-1.5 rounded-xl text-xs font-mono transition-all hover:scale-105 shadow-md flex items-center gap-1.5 group/btn"
        >
          <span>Details</span>
          <Eye className="w-3.5 h-3.5 text-gray-400 group-hover/btn:text-emerald-400 transition-colors" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* 1. FLOATING LIGHTWEIGHT HEADER (NO CARDS) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>GEOSPATIAL FEATURE RESOURCES</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-light font-serif tracking-tight text-white flex items-center gap-3">
            Infrastructure & <span className="font-serif italic text-emerald-200/90 font-normal">Layer Catalog</span>
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-2 leading-relaxed max-w-xl">
            Individual vector feature attributes, UTM projections, and Shapely topology repairs floating inside spatial memory.
          </p>
        </div>

        {/* Floating Active Layer Selector Dropdown */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md hover:border-white/20 transition-all shadow-xl">
          <span className="text-xs font-mono text-gray-400">Active Layer:</span>
          <select
            value={activeFileId}
            onChange={(e) => {
              setActiveFileId(e.target.value);
              onSelectFile(e.target.value);
            }}
            className="bg-transparent text-xs font-mono text-white focus:outline-none max-w-xs truncate cursor-pointer"
          >
            {files.map((f) => (
              <option key={f.id} value={f.id} className="bg-black text-white">
                {f.filename} ({f.feature_count} features)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. FLOATING SEARCH + FILTER (NO CONTAINER BOX) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
        <div className="relative w-full md:w-96 group">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search feature attributes, properties, or ID..."
            containerClassName="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl group-hover:border-white/20 transition-all text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md hover:border-white/20 transition-all">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono text-gray-400">Geometry Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-black text-white">All Geometries</option>
            <option value="POLYGON" className="bg-black text-white">Polygon</option>
            <option value="MULTIPOLYGON" className="bg-black text-white">MultiPolygon</option>
            <option value="LINESTRING" className="bg-black text-white">LineString</option>
            <option value="MULTILINESTRING" className="bg-black text-white">MultiLineString</option>
            <option value="POINT" className="bg-black text-white">Point</option>
          </select>
        </div>
      </div>

      {/* 3. "SPATIAL LAYERS" SECTION WITH ANIMATED LIGHT TRAIL (NO TABLE BOX) */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-mono tracking-widest text-gray-400 uppercase font-semibold">
              SPATIAL LAYERS
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
              0{filteredMeasurements.length}
            </span>
          </div>
          {activeFile && (
            <span className="text-xs font-mono text-gray-400">
              Active Dataset: <span className="text-white font-semibold">{activeFile.filename}</span>
            </span>
          )}
        </div>

        {/* Animated Light Trail Line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-emerald-400/50 via-white/20 to-transparent mb-6 relative overflow-hidden">
          <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-300 to-transparent animate-marquee" />
        </div>

        {/* Floating Table Rows Direct in Environment */}
        {filteredMeasurements.length === 0 && !isLoading ? (
          <EmptyState title="No Features Found" description="Try selecting a different dataset or adjusting your filter." />
        ) : (
          <Table
            variant="spatial"
            columns={featureColumns}
            data={filteredMeasurements}
            keyExtractor={(item) => String(item.feature_id)}
            onRowClick={(item) => setInspectedFeature(item)}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Side Drawer Feature Inspector */}
      <Drawer
        isOpen={!!inspectedFeature}
        onClose={() => setInspectedFeature(null)}
        title={`Feature Inspection #${inspectedFeature?.feature_id || ''}`}
        subtitle={inspectedFeature?.geometry_type || 'Geospatial Attribute'}
      >
        {inspectedFeature && (
          <div className="space-y-6 text-xs font-mono">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                <span className="text-gray-400 text-[10px] uppercase">Measured Value</span>
                <div className="text-base font-bold text-emerald-400">
                  {inspectedFeature.measurement_type === 'area'
                    ? formatArea(inspectedFeature.value)
                    : inspectedFeature.measurement_type === 'length'
                    ? formatLength(inspectedFeature.value)
                    : '-'}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                <span className="text-gray-400 text-[10px] uppercase">Topology Repair</span>
                <div>
                  <StatusBadge status={inspectedFeature.status} size="sm" variant="spatial" />
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {inspectedFeature.error_message && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-rose-300">
                <span className="font-bold">Topology Error: </span>
                {inspectedFeature.error_message}
              </div>
            )}

            {/* GeoJSON Feature Properties */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-gray-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Attributes & Metadata (GeoJSON Properties)
                </span>
              </div>
              <pre className="p-4 bg-black/60 border border-white/10 rounded-2xl text-gray-300 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(inspectedFeature.properties || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
