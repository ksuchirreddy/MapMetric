import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe2,
  Server,
  Layers,
  BarChart3,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Settings,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NavItem } from '../layout/Sidebar';
import { SceneMode } from '../../scene/store';

interface SpatialNavProps {
  activeTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isBackendHealthy: boolean;
  sceneMode: SceneMode;
  onToggleSceneMode: () => void;
}

export const SpatialNav: React.FC<SpatialNavProps> = ({
  activeTab,
  onSelectTab,
  isBackendHealthy,
  sceneMode,
  onToggleSceneMode,
}) => {
  const items: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Ignition', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Server className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <Layers className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'cost', label: 'Cost', icon: <Zap className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Audit', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-6xl">
      <div className="flex items-center justify-between p-2 rounded-full bg-[#0B0E17]/85 backdrop-blur-2xl border border-[#D6A24A]/30 shadow-2xl shadow-black/80">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 pl-4 pr-2">
          <div className="w-7 h-7 rounded-full bg-[#D6A24A]/20 border border-[#F0C879]/40 flex items-center justify-center text-[#F0C879]">
            <Globe2 className="w-4 h-4" />
          </div>
          <span className="font-serif text-lg font-normal tracking-tight text-[#ECE8DF]">
            Map<span className="brass-sheen font-sans italic">Metric</span>
          </span>
        </div>

        {/* Navigation Tabs with Gliding Active Circle Indicator */}
        <nav className="hidden lg:flex items-center gap-1">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'relative px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 flex items-center gap-1.5',
                  isActive ? 'text-[#F0C879] font-bold' : 'text-[#A9A8A0] hover:text-[#ECE8DF]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavOrb"
                    className="absolute inset-0 rounded-full bg-[#D6A24A]/20 border border-[#F0C879]/50 shadow-inner"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls & Scene Mode Toggle */}
        <div className="flex items-center gap-3 pr-2">
          {/* Scene Mode Toggle (Full / Calm / Off) */}
          <button
            onClick={onToggleSceneMode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141A2B] border border-[#ECE8DF]/10 text-[11px] font-mono text-[#ECE8DF] hover:border-[#D6A24A]/50 transition-colors"
            title="Toggle 3D Orrery Scene Mode (Full / Calm / Off)"
          >
            <SlidersHorizontal className="w-3 h-3 text-[#F0C879]" />
            <span className="uppercase text-[10px] text-[#A9A8A0]">Scene:</span>
            <span className="text-[#F0C879] uppercase font-bold">{sceneMode}</span>
          </button>

          {/* Backend Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141A2B] border border-[#ECE8DF]/10 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-[#5FE0B0] animate-pulse' : 'bg-[#FF5C4D]'}`} />
            <span className="text-[#A9A8A0]">{isBackendHealthy ? 'API Live' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
