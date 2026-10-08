import React from 'react';
import { Badge } from './Badge';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Wrench } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

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
