import React, { useState, useEffect } from 'react';
import {
  Search,
  Upload,
  Bell,
  Clock,
  Globe,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TopBarProps {
  onOpenUploadModal: () => void;
  onOpenSearchModal: () => void;
  isBackendHealthy: boolean;
  selectedCrs: string;
  onChangeCrs: (crs: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenUploadModal,
  onOpenSearchModal,
  isBackendHealthy,
  selectedCrs,
  onChangeCrs,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC').split(' ').slice(4, 5)[0]);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 flex items-center justify-between z-20">
      {/* Left: Search Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearchModal}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs font-mono w-72 justify-between group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span>Search datasets, layers, features...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Projection Engine Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-mono text-slate-400">Projection:</span>
          <select
            value={selectedCrs}
            onChange={(e) => onChangeCrs(e.target.value)}
            className="bg-transparent text-xs font-mono font-medium text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="AUTO_UTM" className="bg-slate-900">Auto-UTM WGS84 (Default)</option>
            <option value="EPSG:4326" className="bg-slate-900">EPSG:4326 (Geodetic deg)</option>
            <option value="EPSG:3857" className="bg-slate-900">EPSG:3857 (Web Mercator)</option>
          </select>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* UTC Ticker */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-slate-400">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{utcTime || '00:00:00'} UTC</span>
        </div>

        {/* Health Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
          <div
            className={`w-2 h-2 rounded-full ${
              isBackendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className={isBackendHealthy ? 'text-slate-300' : 'text-rose-400'}>
            {isBackendHealthy ? 'API Online' : 'API Offline'}
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
        </button>

        {/* Primary CTA: Upload Spatial File */}
        <Button
          onClick={onOpenUploadModal}
          size="sm"
          icon={<Upload className="w-3.5 h-3.5" />}
        >
          Upload Spatial File
        </Button>
      </div>
    </header>
  );
};
