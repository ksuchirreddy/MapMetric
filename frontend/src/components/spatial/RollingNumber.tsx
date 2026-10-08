import React from 'react';
import { cn } from '../../lib/utils';

interface RollingNumberProps {
  value: string | number;
  unit?: string;
  className?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  unit,
  className,
}) => {
  const strVal = String(value);

  return (
    <div className={cn('inline-flex items-baseline font-mono text-5xl sm:text-7xl tracking-tighter text-[#ECE8DF]', className)}>
      <span className="roll-digit">{strVal}</span>
      {unit && (
        <span className="ml-2 font-serif italic text-2xl sm:text-3xl text-[#F0C879] align-super">
          {unit}
        </span>
      )}
    </div>
  );
};
