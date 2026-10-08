import React from 'react';
import { Badge } from './Badge';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Wrench } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  variant?: 'spatial' | 'pill';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', variant = 'spatial' }) => {
  const normalized = (status || '').toUpperCase();

  if (variant === 'spatial') {
    switch (normalized) {
      case 'COMPLETED':
      case 'OK':
        return (
          <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            COMPLETED
          </span>
        );
      case 'PROCESSING':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping" />
            PROCESSING
          </span>
        );
      case 'REPAIRED':
        return (
          <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(240,200,121,0.8)]" />
            REPAIRED
          </span>
        );
      case 'FAILED':
      case 'TRANSFORM_ERROR':
      case 'UNSUPPORTED_GEOMETRY':
        return (
          <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            {normalized || 'UNKNOWN'}
          </span>
        );
    }
  }

  // Fallback to pill badge
  switch (normalized) {
    case 'COMPLETED':
    case 'OK':
      return (
        <Badge variant="emerald" size={size} className="gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>{normalized}</span>
        </Badge>
      );
    case 'PROCESSING':
    case 'PENDING':
      return (
        <Badge variant="blue" size={size} className="gap-1 animate-pulse">
          <Clock className="w-3 h-3" />
          <span>{normalized}</span>
        </Badge>
      );
    case 'REPAIRED':
      return (
        <Badge variant="amber" size={size} className="gap-1">
          <Wrench className="w-3 h-3" />
          <span>{normalized}</span>
        </Badge>
      );
    case 'INVALID_GEOMETRY':
    case 'NULL_GEOMETRY':
    case 'EMPTY_GEOMETRY':
      return (
        <Badge variant="amber" size={size} className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{normalized.replace('_GEOMETRY', '')}</span>
        </Badge>
      );
    case 'FAILED':
    case 'TRANSFORM_ERROR':
    case 'UNSUPPORTED_GEOMETRY':
      return (
        <Badge variant="rose" size={size} className="gap-1">
          <XCircle className="w-3 h-3" />
          <span>{normalized}</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="slate" size={size}>
          {normalized || 'UNKNOWN'}
        </Badge>
      );
  }
};
