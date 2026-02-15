"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-sm text-white/60 max-w-md mb-6">
            An error occurred while rendering this component.
          </p>
          
          {this.state.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 max-w-md">
              <p className="text-sm text-red-300 font-mono text-left break-words">
                {this.state.error.message}
              </p>
            </div>
          )}
          
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
