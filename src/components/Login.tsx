import React, { useState } from 'react';
import { Fingerprint, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('assinagr3c');
  const [password, setPassword] = useState('agentesderisco3c');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simula um pequeno delay para um feedback mais "inteligente" e suave
    setTimeout(() => {
      if (username === 'assinagr3c' && password === 'agentesderisco3c') {
        onLogin();
      } else {
        setError('Acesso negado');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-200">
      {/* Elementos de fundo "Smart" */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/60 rounded-full blur-[80px] mix-blend-overlay pointer-events-none" />

      <div className="w-full max-w-[320px] bg-white/80 backdrop-blur-xl rounded-[28px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white p-8 relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgb(37,99,235,0.3)] mb-4">
            <Fingerprint className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AssinaGR</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Sistema Seguro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative group">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl px-4 py-3.5 pl-11 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                placeholder="Identificação"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>

            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-2xl px-4 py-3.5 pl-11 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                placeholder="Código de acesso"
                required
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock className="w-[18px] h-[18px]" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold bg-red-50/80 p-3 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl py-3.5 text-sm font-bold transition-all shadow-[0_8px_20px_rgb(37,99,235,0.25)] hover:shadow-[0_12px_25px_rgb(37,99,235,0.35)] flex items-center justify-center gap-2 mt-2 disabled:opacity-80 disabled:cursor-wait"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Conectar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
