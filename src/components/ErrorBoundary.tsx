import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;
  public setState: (state: Partial<State>) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
    this.setState = (newState) => {
      this.state = { ...this.state, ...newState };
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KRIVIO ErrorBoundary Caught]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F9F5] dark:bg-[#0B1911] text-stone-900 dark:text-white font-inter">
          <div className="max-w-md w-full bg-white dark:bg-[#13251B] p-8 rounded-3xl border border-[#0F5132]/20 dark:border-emerald-800/60 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-[#D4AF37]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold font-poppins text-stone-900 dark:text-white">
                Workspace Display Notice
              </h2>
              <p className="text-xs text-stone-500 dark:text-emerald-300/80 leading-relaxed font-inter">
                KRIVIO AI encountered a temporary display issue. Your data and account remain completely safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
                Reload Workspace
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-[#0E2016] text-stone-800 dark:text-emerald-200 font-bold text-xs rounded-xl border border-stone-200 dark:border-emerald-900/40 transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
