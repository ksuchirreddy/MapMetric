import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'cyan';
  onClick?: () => void;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className,
  glowColor = 'emerald',
  onClick,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowClasses = {
    emerald: 'hover:shadow-emerald-500/20 hover:border-emerald-500/40',
    blue: 'hover:shadow-blue-500/20 hover:border-blue-500/40',
    purple: 'hover:shadow-purple-500/20 hover:border-purple-500/40',
    amber: 'hover:shadow-amber-500/20 hover:border-amber-500/40',
    cyan: 'hover:shadow-cyan-500/20 hover:border-cyan-500/40',
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
        'relative rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 shadow-xl transition-shadow duration-300 group select-none',
        glowClasses[glowColor],
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {/* Glass Specular Reflection Gradient Overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/[0.03] to-white/0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};
