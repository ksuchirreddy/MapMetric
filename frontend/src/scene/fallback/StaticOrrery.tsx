import React from 'react';
import { COLOR_TOKENS } from '../../lib/tokens';

export const StaticOrrery: React.FC = () => {
  return (
    <div className="w-full h-80 relative rounded-2xl overflow-hidden bg-[#06070B] border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
      {/* Layered Concentric SVG Orrery Rings */}
      <svg className="w-64 h-64 animate-spin-slow opacity-60 pointer-events-none" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke={COLOR_TOKENS.brass} strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="65" fill="none" stroke={COLOR_TOKENS.glass} strokeWidth="1.5" opacity="0.6" />
        <circle cx="100" cy="100" r="40" fill="none" stroke={COLOR_TOKENS.brassHi} strokeWidth="1" />
        <circle cx="100" cy="100" r="15" fill={COLOR_TOKENS.brassHi} opacity="0.8" />

        {/* Orbiting Bodies */}
        <circle cx="100" cy="10" r="6" fill={COLOR_TOKENS.status.nominal} />
        <circle cx="165" cy="100" r="5" fill={COLOR_TOKENS.glass} />
        <circle cx="100" cy="140" r="7" fill={COLOR_TOKENS.status.degraded} />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-[#06070B] via-transparent to-transparent">
        <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
          Static 2D Orrery Fallback Active
        </span>
        <p className="text-xs text-slate-400 max-w-sm">
          WebGL rendering is disabled or kill switch <code className="text-emerald-400">?scene=off</code> is enabled. All dataset measurements and API functions remain 100% active.
        </p>
      </div>
    </div>
  );
};
