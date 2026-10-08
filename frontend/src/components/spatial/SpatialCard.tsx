import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SpatialCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'brass' | 'glass' | 'nominal' | 'degraded' | 'critical';
  onClick?: () => void;
}

export const SpatialCard: React.FC<SpatialCardProps> = ({
  children,
  className,
  glowColor = 'brass',
  onClick,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 18 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const borderGlows = {
    brass: 'hover:border-[#D6A24A]/60 hover:shadow-[#D6A24A]/15',
    glass: 'hover:border-[#8EDCEB]/60 hover:shadow-[#8EDCEB]/15',
    nominal: 'hover:border-[#5FE0B0]/60 hover:shadow-[#5FE0B0]/15',
    degraded: 'hover:border-[#F2C14E]/60 hover:shadow-[#F2C14E]/15',
    critical: 'hover:border-[#FF5C4D]/60 hover:shadow-[#FF5C4D]/15',
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative rounded-2xl bg-[#0B0E17]/85 backdrop-blur-xl border border-[#ECE8DF]/10 p-6 shadow-2xl transition-all duration-300 group select-none',
        borderGlows[glowColor],
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div style={{ transform: 'translateZ(24px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {/* Holographic Border Reflection Layer */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};
