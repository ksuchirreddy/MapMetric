import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  variant?: 'brass' | 'glass' | 'outline';
  icon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className,
  variant = 'brass',
  icon,
  isLoading,
  disabled,
  onClick,
}) => {
  const ref = useRef<HTMLButtonElement>(null!);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 220, damping: 18 });
  const springY = useSpring(y, { stiffness: 220, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    brass: 'bg-gradient-to-r from-[#D6A24A] via-[#F0C879] to-[#8A6428] text-[#06070B] font-bold border border-[#F0C879]/50 shadow-lg shadow-[#D6A24A]/20 hover:shadow-[#F0C879]/40',
    glass: 'bg-[#8EDCEB]/10 text-[#8EDCEB] border border-[#8EDCEB]/40 hover:bg-[#8EDCEB]/20',
    outline: 'bg-transparent text-[#ECE8DF] border border-[#ECE8DF]/20 hover:border-[#D6A24A]/60 hover:text-[#F0C879]',
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: springX, y: springY }}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D6A24A]/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
