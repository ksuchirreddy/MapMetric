import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Settings, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [autoRepair, setAutoRepair] = useState(true);
  const [unitMode, setUnitMode] = useState('METRIC');
  const [utmStrategy, setUtmStrategy] = useState('CENTROID');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Engine & Coordinate Projection Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure default spatial reference systems (CRS), units, and Shapely topology repairs.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UTM Strategy */}
        <Card title="UTM Zone Resolution Strategy">
          <div className="space-y-4 text-xs font-mono text-slate-300">
            <label className="block space-y-1.5">
              <span className="text-slate-400">Projection Calculation Method:</span>
              <select
                value={utmStrategy}
                onChange={(e) => setUtmStrategy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="CENTROID">Feature Centroid UTM (Default)</option>
                <option value="BOUNDING_BOX">Bounding Box Center UTM</option>
                <option value="EPSG_3857">Fixed Web Mercator (EPSG:3857)</option>
              </select>
            </label>
            <p className="text-[11px] text-slate-500">
              Determines which WGS84 UTM Zone (326xx for N, 327xx for S) is assigned to geometry polygons.
            </p>
          </div>
        </Card>

        {/* Units System */}
        <Card title="Default Metric Output Units">
          <div className="space-y-4 text-xs font-mono text-slate-300">
            <label className="block space-y-1.5">
              <span className="text-slate-400">Unit System:</span>
              <select
                value={unitMode}
                onChange={(e) => setUnitMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="METRIC">Metric System (m², km², m, km)</option>
                <option value="HECTARES">Hectares & Kilometers</option>
                <option value="IMPERIAL">Imperial (sq ft, miles)</option>
              </select>
            </label>
            <p className="text-[11px] text-slate-500">
              Values in the database are stored in true m² and converted in UI formatting.
            </p>
          </div>
        </Card>

        {/* Topology Repair */}
        <Card title="Topology Repair Policy">
          <div className="space-y-4 text-xs font-mono text-slate-300">
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <span className="font-bold text-slate-200 block">Auto-Repair Invalid Geometries</span>
                <span className="text-[10px] text-slate-400">Apply shapely.make_valid() automatically</span>
              </div>
              <input
                type="checkbox"
                checked={autoRepair}
                onChange={(e) => setAutoRepair(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* API Endpoint */}
        <Card title="Backend API Integration">
          <div className="space-y-3 text-xs font-mono text-slate-300">
            <label className="block space-y-1">
              <span className="text-slate-400">MapMetric API Gateway URL:</span>
              <input
                type="text"
                readOnly
                value="http://localhost:8000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-400 font-mono"
              />
            </label>
            <span className="text-[10px] text-emerald-400 block">Status: Connected to FastAPI backend</span>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          icon={saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          variant={saved ? 'primary' : 'secondary'}
        >
          {saved ? 'Settings Saved!' : 'Save Engine Preferences'}
        </Button>
      </div>
    </div>
  );
};
