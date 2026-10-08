import React from 'react';
import {
  LayoutDashboard,
  Server,
  Layers,
  BarChart3,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Settings,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type NavItem =
  | 'dashboard'
  | 'infrastructure'
  | 'resources'
  | 'analytics'
  | 'cost'
  | 'recommendations'
  | 'alerts'
  | 'activity'
  | 'settings';

interface SidebarProps {
  activeTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  datasetCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  datasetCount = 0,
}) => {
  const navItems: { id: NavItem; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Server className="w-4 h-4" />, badge: datasetCount > 0 ? datasetCount : undefined },
    { id: 'resources', label: 'Resources', icon: <Layers className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'cost', label: 'Cost Intelligence', icon: <Zap className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-slate-950 border-r border-slate-800/80 transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-950/40 shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                Map<span className="text-emerald-400">Metric</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">
                Geospatial Engine v1.0
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Workspace Selector */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-800/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate font-semibold">prod-geospatial-db</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              UTM
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm shadow-emerald-950/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn('transition-colors', isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200')}>
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-mono rounded-full font-bold',
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Profile & Collapse Button */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-mono font-bold text-xs">
              GIS
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-slate-200 truncate">GIS Analyst</span>
              <span className="text-[10px] text-slate-500 font-mono truncate">engineer@mapmetric.io</span>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800/40"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
