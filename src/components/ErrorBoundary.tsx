import React from "react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-red-500/50 p-8 rounded-xl max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Algo deu errado</h1>
        <p className="text-zinc-400 mb-6">
          Ocorreu um erro inesperado. Por favor, tente recarregar a página ou entre em contato com o suporte.
        </p>
        <div className="bg-black/50 p-4 rounded text-left mb-6 overflow-auto max-h-40">
          <code className="text-xs text-red-400">
            {error?.toString()}
          </code>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Recarregar Página
        </button>
      </div>
    </div>
  );
};

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
