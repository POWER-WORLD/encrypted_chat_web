import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Enterprise Cyberpunk ErrorBoundary
 * Catches render crashes gracefully and provides session recovery.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, error can be logged to a monitoring service
    console.error('[CRITICAL_SYSTEM_FAULT]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-black text-green-400 font-mono flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
          {/* Scanline background */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-70"></div>
          
          <div className="relative z-10 max-w-lg w-full bg-zinc-950 border border-red-500/80 p-8 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.25)] space-y-6">
            <div className="flex items-center gap-3 border-b border-red-900/60 pb-4 text-red-500">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
              <div>
                <h1 className="text-xl font-black tracking-widest uppercase">CRITICAL SYSTEM FAULT</h1>
                <p className="text-xs text-red-400/80 font-mono">CODE: EXECUTION_HALTED_0xDEAD</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              An unhandled exception interrupted subsystem operations. System telemetry has logged the anomaly.
            </p>

            {this.state.error && (
              <div className="bg-black/90 p-4 rounded border border-red-900/40 text-xs text-red-400 font-mono overflow-x-auto max-h-36 custom-scrollbar">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-bold text-xs uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                <RefreshCw size={14} /> Reboot Node
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all active:scale-95"
              >
                Return to Gateway
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
