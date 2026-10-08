import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'API Connection Error',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-rose-500/20 rounded-2xl bg-rose-950/10 text-center max-w-lg mx-auto my-6">
      <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 mb-3 border border-rose-500/20">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-rose-200 font-mono mb-1">{title}</h3>
      <p className="text-xs text-rose-300/80 mb-4 max-w-md font-mono">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} icon={<RotateCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      )}
    </div>
  );
};
