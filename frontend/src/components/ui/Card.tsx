import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  borderGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  icon,
  borderGlow = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-slate-900/80 backdrop-blur-xl border rounded-xl p-5 shadow-lg shadow-black/20 transition-all duration-200',
        borderGlow
          ? 'border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-950/20'
          : 'border-slate-800/80 hover:border-slate-700/80',
        className
      )}
      {...props}
    >
      {(title || action || icon) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-slate-800/80 text-emerald-400 border border-slate-700/50">
                {icon}
              </div>
            )}
            <div>
              {title && typeof title === 'string' ? (
                <h3 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h3>
              ) : (
                title
              )}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
