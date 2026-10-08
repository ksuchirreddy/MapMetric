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
    <header className="h-16 border-b border-white/10 bg-transparent backdrop-blur-md px-6 flex items-center justify-between z-20">
      {/* Left: Search Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSearchModal}
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-xs font-mono w-72 justify-between group shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-400 transition-colors" />
            <span>Search layers, datasets, IDs...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 border border-white/10 rounded-full text-gray-300 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Projection Engine Selector */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-gray-300 backdrop-blur-md">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-mono text-gray-400">Projection:</span>
          <select
            value={selectedCrs}
            onChange={(e) => onChangeCrs(e.target.value)}
            className="bg-transparent text-xs font-mono font-medium text-white focus:outline-none cursor-pointer"
          >
            <option value="AUTO_UTM" className="bg-black text-white">Auto-UTM WGS84 (Default)</option>
            <option value="EPSG:4326" className="bg-black text-white">EPSG:4326 (Geodetic deg)</option>
            <option value="EPSG:3857" className="bg-black text-white">EPSG:3857 (Web Mercator)</option>
          </select>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* UTC Ticker */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{utcTime || '00:00:00'} UTC</span>
        </div>

        {/* Health Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
          <div
            className={`w-2 h-2 rounded-full ${
              isBackendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className={isBackendHealthy ? 'text-gray-200 font-semibold' : 'text-rose-400'}>
            {isBackendHealthy ? 'API Online' : 'API Offline'}
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full border border-white/10 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
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
