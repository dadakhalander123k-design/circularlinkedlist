import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/overview';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/30 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              An unexpected issue occurred while rendering this section. You can return to the overview page safely.
            </p>
            {this.state.error && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs font-mono text-slate-500 dark:text-slate-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="btn-modern-primary px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Home className="w-4 h-4" />
                <span>Return to Overview</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
