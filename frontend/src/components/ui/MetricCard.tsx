import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Mini3DVis } from '../3d/Mini3DVis';

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'cyan';
  visType?: 'datasets' | 'features' | 'area' | 'latency';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  subtext,
  accentColor = 'emerald',
  visType = 'datasets',
  className,
}) => {
  const accentGradients = {
    emerald: 'from-emerald-500/10 via-transparent to-transparent border-emerald-500/20 text-emerald-400 bg-emerald-500/10',
    blue: 'from-blue-500/10 via-transparent to-transparent border-blue-500/20 text-blue-400 bg-blue-500/10',
    purple: 'from-purple-500/10 via-transparent to-transparent border-purple-500/20 text-purple-400 bg-purple-500/10',
    amber: 'from-amber-500/10 via-transparent to-transparent border-amber-500/20 text-amber-400 bg-amber-500/10',
    cyan: 'from-cyan-500/10 via-transparent to-transparent border-cyan-500/20 text-cyan-400 bg-cyan-500/10',
  };

  const hexColors = {
    emerald: '#10B981',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    amber: '#F59E0B',
    cyan: '#06B6D4',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition-all duration-300 group bg-gradient-to-br',
        accentGradients[accentColor],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase font-mono">{title}</p>
          <div className="text-2xl font-bold text-slate-100 tracking-tight font-mono">{value}</div>
        </div>

        {/* 3D Miniature WebGL Object Canvas */}
        <Mini3DVis type={visType} color={hexColors[accentColor]} />
      </div>

      {(change || subtext) && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-mono font-medium',
                trend === 'up' && 'text-emerald-400',
                trend === 'down' && 'text-rose-400',
                trend === 'neutral' && 'text-slate-400'
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
              {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtext && <span className="text-slate-400 truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
