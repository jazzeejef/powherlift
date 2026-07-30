import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { Download, Upload, X, CheckCircle, Database, Smartphone, RefreshCw, Info, Wifi, WifiOff, Layers, Clock } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  workoutCount: number;
  lastHydratedAt: string | null;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  workoutCount,
  lastHydratedAt
}) => {
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const isPwa = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(Boolean(isPwa));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      await storageService.exportAllData();
      setStatusMessage({ text: 'Backup downloaded successfully!' });
    } catch (e) {
      setStatusMessage({ text: 'Export failed: ' + (e as Error).message, isError: true });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const success = await storageService.importAllData(content);
        if (success) {
          setStatusMessage({ text: 'Data imported successfully! Reloading...' });
          setTimeout(() => {
            onDataRestored();
            onClose();
          }, 1200);
        } else {
          setStatusMessage({ text: 'Failed to import. File format invalid.', isError: true });
        }
      } catch (err) {
        setStatusMessage({ text: 'Import error: ' + (err as Error).message, isError: true });
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      setStatusMessage({ text: 'Failed to read backup file.', isError: true });
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-pink-100 relative space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">App Settings & Backup</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">App Version v1.2.2 (Build 2026.07.30-v122)</p>
          </div>
        </div>

        {/* System Diagnostics & Status Summary */}
        <div className="bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-white border border-pink-100 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="text-[11px] font-black text-pink-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-pink-500" /> Active System Diagnostics
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Displayed App Version:
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono font-black border border-emerald-200">
              v1.2.2
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Layers className="w-4 h-4 text-purple-500" /> Active Service Worker:
            </span>
            <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-mono font-black border border-purple-200">
              v1.2.2
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Database className="w-4 h-4 text-pink-500" /> Active Cache Name:
            </span>
            <span className="text-pink-700 font-mono text-[11px] bg-pink-50 px-2 py-0.5 rounded-md font-bold border border-pink-200">
              powerherlift-app-shell-v1.2.2
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-rose-500" />} Network Connection:
            </span>
            <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
              isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {isOnline ? 'Online 🟢' : 'Offline 🔴'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Smartphone className="w-4 h-4 text-indigo-500" /> Application Mode:
            </span>
            <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-indigo-200">
              {isStandalone ? 'Standalone PWA (Home Screen)' : 'Browser Mode'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Database className="w-4 h-4 text-amber-500" /> Stored Workouts:
            </span>
            <span className="text-slate-800 font-black">{workoutCount} workouts saved</span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" /> Last Storage Hydration:
            </span>
            <span className="text-slate-600 font-mono text-[11px]">
              {lastHydratedAt || 'Just now'}
            </span>
          </div>
        </div>

        {/* Feedback message */}
        {statusMessage && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            statusMessage.isError ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-pink-200 hover:opacity-95 transition-all"
          >
            <Download className="w-5 h-5" />
            Export Backup File (.json)
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-50 text-slate-700 font-bold py-3.5 px-5 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            {isImporting ? (
              <RefreshCw className="w-5 h-5 animate-spin text-pink-500" />
            ) : (
              <Upload className="w-5 h-5 text-slate-500" />
            )}
            Import Backup File (.json)
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Tip: Your workout history is automatically saved to IndexedDB after every set or change. Downloading a backup allows you to transfer data across browsers or devices seamlessly.
        </p>
      </div>
    </div>
  );
};
