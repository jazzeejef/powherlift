import React, { Component, ErrorInfo, ReactNode } from 'react';
import { storageService } from '../services/storageService';
import { AlertTriangle, RefreshCw, Download, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleExportBackup = async () => {
    try {
      await storageService.exportAllData();
    } catch (e) {
      alert('Could not export backup: ' + (e as Error).message);
    }
  };

  private handleResetApp = async () => {
    if (window.confirm('Are you sure you want to reset local storage cache? Your saved workouts in IndexedDB will be preserved where possible.')) {
      try {
        localStorage.clear();
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        }
        window.location.href = '/';
      } catch (e) {
        window.location.reload();
      }
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-800">Something went wrong</h2>
              <p className="text-slate-500 text-sm mt-2">
                PowHER Lifts encountered an unexpected interface issue. Your workout data is safely stored in IndexedDB.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left font-mono text-xs text-rose-600 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-pink-200 hover:opacity-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reload App
              </button>

              <button
                onClick={this.handleExportBackup}
                className="w-full flex items-center justify-center gap-2 bg-pink-50 text-pink-600 font-semibold py-3 px-6 rounded-2xl border border-pink-200 hover:bg-pink-100 transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                Download Data Backup (.json)
              </button>

              <button
                onClick={this.handleResetApp}
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 font-medium py-2 text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
