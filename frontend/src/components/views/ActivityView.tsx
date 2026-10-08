import React from 'react';
import { FileRecordItem } from '../../services/api';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Activity, Upload, Clock } from 'lucide-react';

interface ActivityViewProps {
  files: FileRecordItem[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ files }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Ingestion & Processing Activity Audit
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological event stream of spatial file uploads, coordinate transformations, and database commits.
        </p>
      </div>

      {/* Audit Log Stream */}
      <Card title="Activity Timeline Logs">
        <div className="space-y-4 font-mono text-xs">
          {files.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No recent pipeline activity logged.</p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{file.filename}</span>
                    <StatusBadge status={file.status} size="sm" />
                  </div>
                  <p className="text-slate-400">
                    Uploaded file parsed <span className="text-emerald-400">{file.feature_count} features</span>.{' '}
                    UTM auto-projection applied. Execution latency:{' '}
                    <span className="text-amber-400">{file.processing_time_ms ?? '-'} ms</span>.
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {file.created_at ? new Date(file.created_at).toLocaleString() : 'Recent event'}
                    </span>
                    <span>UUID: {file.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
