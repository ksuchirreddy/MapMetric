import React from 'react';
import { Layers, FolderPlus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Spatial Data Available',
  description = 'Upload a KML file or Shapefile (.zip) to calculate accurate UTM projection measurements.',
  actionLabel = 'Upload Spatial File',
  onAction,
  icon = <Layers className="w-10 h-10 text-emerald-500/60" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/40 text-center max-w-xl mx-auto my-6">
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 font-mono mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction} icon={<FolderPlus className="w-4 h-4" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
