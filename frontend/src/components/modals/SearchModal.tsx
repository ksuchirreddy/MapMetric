import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FileRecordItem } from '../../services/api';
import { SearchInput } from '../ui/SearchInput';
import { FileCode, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileRecordItem[];
  onSelectFile: (fileId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
}) => {
  const [query, setQuery] = useState('');

  const filtered = files.filter(
    (f) =>
      f.filename.toLowerCase().includes(query.toLowerCase()) ||
      f.id.toLowerCase().includes(query.toLowerCase()) ||
      (f.crs || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          placeholder="Global Search: Type filename, UUID, projection EPSG code..."
          className="py-3 text-sm"
          autoFocus
        />

        <div className="max-h-80 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
          {filtered.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No matching datasets or spatial features found.
            </p>
          ) : (
            filtered.map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  onSelectFile(file.id);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/30 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-100 block">{file.filename}</span>
                    <span className="text-[10px] text-slate-500">
                      {file.feature_count} features • {file.crs || 'Auto-UTM'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-400 transition-colors">
                  <span className="text-[10px] uppercase">Inspect Layer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
