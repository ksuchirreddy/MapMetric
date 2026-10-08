import React, { useState, useEffect } from 'react';
import { FileRecordItem, MeasurementItem, api } from '../../services/api';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchInput } from '../ui/SearchInput';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { formatArea, formatLength } from '../../lib/utils';
import { Layers, Eye, Filter, Code2 } from 'lucide-react';

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
      header: 'Feature ID',
      render: (item: MeasurementItem) => (
        <span className="font-mono text-xs font-bold text-emerald-400">
          #{item.feature_id}
        </span>
      ),
    },
    {
      key: 'geometry_type',
      header: 'Geometry Type',
      render: (item: MeasurementItem) => (
        <span className="font-mono text-xs text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {item.geometry_type || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'measurement_type',
      header: 'Dimension',
      render: (item: MeasurementItem) => (
        <span className="font-mono text-xs text-slate-400 capitalize">
          {item.measurement_type || '-'}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Measured Output',
      render: (item: MeasurementItem) => (
        <span className="font-mono text-xs font-semibold text-slate-100">
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
      header: 'Geometry Status',
      render: (item: MeasurementItem) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'action',
      header: 'Inspect',
      render: (item: MeasurementItem) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setInspectedFeature(item);
          }}
          icon={<Eye className="w-3.5 h-3.5" />}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Geospatial Feature Resources
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Individual vector feature attributes, UTM projections, and Shapely topology repairs.
          </p>
        </div>

        {/* Dataset Selector Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Active Layer:</span>
          <select
            value={activeFileId}
            onChange={(e) => {
              setActiveFileId(e.target.value);
              onSelectFile(e.target.value);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none max-w-xs truncate"
          >
            {files.map((f) => (
              <option key={f.id} value={f.id}>
                {f.filename} ({f.feature_count} features)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search feature attributes, properties, or ID..."
            containerClassName="w-full md:w-96"
          />

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Geometry Type:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Geometries</option>
              <option value="POLYGON">Polygon</option>
              <option value="MULTIPOLYGON">MultiPolygon</option>
              <option value="LINESTRING">LineString</option>
              <option value="MULTILINESTRING">MultiLineString</option>
              <option value="POINT">Point</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Feature Table */}
      <Card
        title={`Layer Features (${filteredMeasurements.length})`}
        subtitle={activeFile ? `Dataset: ${activeFile.filename}` : undefined}
      >
        {filteredMeasurements.length === 0 && !isLoading ? (
          <EmptyState title="No Features Found" description="Try selecting a different dataset or adjusting your filter." />
        ) : (
          <Table
            columns={featureColumns}
            data={filteredMeasurements}
            keyExtractor={(item) => String(item.feature_id)}
            onRowClick={(item) => setInspectedFeature(item)}
            isLoading={isLoading}
          />
        )}
      </Card>

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
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Measured Value</span>
                <div className="text-base font-bold text-emerald-400">
                  {inspectedFeature.measurement_type === 'area'
                    ? formatArea(inspectedFeature.value)
                    : inspectedFeature.measurement_type === 'length'
                    ? formatLength(inspectedFeature.value)
                    : '-'}
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Topology Repair</span>
                <div>
                  <StatusBadge status={inspectedFeature.status} size="sm" />
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {inspectedFeature.error_message && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-rose-300">
                <span className="font-bold">Topology Error: </span>
                {inspectedFeature.error_message}
              </div>
            )}

            {/* GeoJSON Feature Properties */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Attributes & Metadata (GeoJSON Properties)
                </span>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(inspectedFeature.properties || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
