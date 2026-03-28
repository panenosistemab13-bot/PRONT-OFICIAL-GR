import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Ops! Algo deu errado.</h1>
            <p className="text-slate-500 max-w-xs mx-auto">
              Ocorreu um erro inesperado na aplicação. Por favor, tente recarregar a página.
            </p>
            {this.state.error && (
              <p className="text-[10px] text-slate-400 font-mono mt-4 p-2 bg-slate-100 rounded border border-slate-200 overflow-auto max-w-md">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
