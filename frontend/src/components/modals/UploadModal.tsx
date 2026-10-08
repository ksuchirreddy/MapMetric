import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { Upload, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newFileId: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const name = file.name.toLowerCase();
    if (name.endsWith('.kml') || name.endsWith('.zip')) {
      setSelectedFile(file);
      setErrorMsg(null);
    } else {
      setSelectedFile(null);
      setErrorMsg('Invalid file format. Please upload a .kml file or a Shapefile archive (.zip).');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await api.uploadFile(selectedFile);
      setIsUploading(false);
      setSelectedFile(null);
      onUploadSuccess(res.id);
      onClose();
    } catch (err: any) {
      console.error('File upload failed:', err);
      setIsUploading(false);
      setErrorMsg(err.message || 'Failed to upload and process spatial file.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Spatial Dataset"
      subtitle="Support for Keyhole Markup Language (.kml) and Shapefile zip archives (.zip)"
    >
      <div className="space-y-5 font-sans">
        {/* Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-950/20'
              : selectedFile
              ? 'border-emerald-500/50 bg-slate-900'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
          }`}
        >
          <input
            type="file"
            accept=".kml,.zip"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-950/40">
              {selectedFile ? <FileCode className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <span className="text-sm font-semibold font-mono text-emerald-400 block">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Drag and drop your spatial file here, or{' '}
                  <span className="text-emerald-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Supports KML (.kml) and Shapefile archives (.zip containing .shp, .shx, .dbf, .prj)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            isLoading={isUploading}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isUploading ? 'Ingesting File...' : 'Upload & Compute UTM'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
