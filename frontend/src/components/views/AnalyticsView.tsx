import React, { useState, useEffect } from 'react';
import { FileRecordItem, api } from '../../services/api';
import { Card } from '../ui/Card';
import { MetricCard } from '../ui/MetricCard';
import { Table } from '../ui/Table';
import { formatArea, formatLength, formatNumber } from '../../lib/utils';
import { BarChart3, Globe, Ruler, Layers, PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface AnalyticsViewProps {
  files: FileRecordItem[];
}

interface DatasetMeasurementSummary {
  id: string;
  filename: string;
  featureCount: number;
  totalArea: number;
  totalLength: number;
  polygons: number;
  lines: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ files }) => {
  const [summaries, setSummaries] = useState<DatasetMeasurementSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      setIsLoading(true);
      const results: DatasetMeasurementSummary[] = [];

      for (const file of files.filter((f) => f.status === 'COMPLETED').slice(0, 15)) {
        try {
          const res = await api.getMeasurements(file.id, false);
          let fileArea = 0;
          let fileLength = 0;
          let polyCount = 0;
          let lineCount = 0;

          res.measurements.forEach((m) => {
            if (m.measurement_type === 'area' && m.value) {
              fileArea += m.value;
              polyCount++;
            } else if (m.measurement_type === 'length' && m.value) {
              fileLength += m.value;
              lineCount++;
            }
          });

          results.push({
            id: file.id,
            filename: file.filename,
            featureCount: file.feature_count,
            totalArea: fileArea,
            totalLength: fileLength,
            polygons: polyCount,
            lines: lineCount,
          });
        } catch (err) {
          console.error(`Error loading analytics for ${file.id}`, err);
        }
      }

      if (isMounted) {
        setSummaries(results);
        setIsLoading(false);
      }
    };

    if (files.length > 0) {
      loadAnalytics();
    }
    return () => {
      isMounted = false;
    };
  }, [files]);

  const grandTotalArea = summaries.reduce((acc, s) => acc + s.totalArea, 0);
  const grandTotalLength = summaries.reduce((acc, s) => acc + s.totalLength, 0);
  const totalPolygons = summaries.reduce((acc, s) => acc + s.polygons, 0);
  const totalLines = summaries.reduce((acc, s) => acc + s.lines, 0);

  const columns = [
    {
      key: 'filename',
      header: 'Spatial Layer',
      render: (item: DatasetMeasurementSummary) => (
        <span className="font-mono text-xs font-semibold text-slate-100">{item.filename}</span>
      ),
    },
    {
      key: 'polygons',
      header: 'Polygon Count',
      render: (item: DatasetMeasurementSummary) => (
        <span className="font-mono text-xs text-emerald-400">{item.polygons}</span>
      ),
    },
    {
      key: 'totalArea',
      header: 'Surface Area',
      render: (item: DatasetMeasurementSummary) => (
        <span className="font-mono text-xs font-bold text-slate-100">
          {formatArea(item.totalArea)}
        </span>
      ),
    },
    {
      key: 'lines',
      header: 'Line Features',
      render: (item: DatasetMeasurementSummary) => (
        <span className="font-mono text-xs text-blue-400">{item.lines}</span>
      ),
    },
    {
      key: 'totalLength',
      header: 'Total Perimeter / Length',
      render: (item: DatasetMeasurementSummary) => (
        <span className="font-mono text-xs text-slate-100">{formatLength(item.totalLength)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          Measurement Analytics & Aggregates
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          High-precision UTM spatial geometry metrics aggregated by area (m²) and distance (m).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Aggregated Area"
          value={formatArea(grandTotalArea)}
          subtext="Total UTM surface area"
          icon={<Globe className="w-5 h-5" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Aggregated Length"
          value={formatLength(grandTotalLength)}
          subtext="Total vector path length"
          icon={<Ruler className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricCard
          title="Polygon Geometries"
          value={formatNumber(totalPolygons)}
          subtext="Closed surface features"
          icon={<Layers className="w-5 h-5" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Line Geometries"
          value={formatNumber(totalLines)}
          subtext="Linear vector segments"
          icon={<PieIcon className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Bar Chart: Surface Area per Dataset */}
      <Card title="Surface Area Distribution per Layer (m²)">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis
                dataKey="filename"
                stroke="#64748B"
                fontSize={10}
                tickFormatter={(v) => (v.length > 10 ? `${v.slice(0, 8)}...` : v)}
              />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
                formatter={(val: number) => [formatArea(val), 'Area']}
              />
              <Bar dataKey="totalArea" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Data Table */}
      <Card title="Spatial Layer Measurement Breakdown">
        <Table
          columns={columns}
          data={summaries}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};
