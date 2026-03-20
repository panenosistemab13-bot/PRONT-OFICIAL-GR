import React from 'react';
import { supabase } from '../services/supabase';

const VisualizadorDeMapa = ({ destination }: { destination: string }) => {
  if (!destination) return null;

  // Formata o nome exatamente como o computador entende
  const base = destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.|/]/g, '').replace(/\s+/g, '_');
  
  const nomeArquivo = `rota_${base}.pdf`;
  const { data } = supabase.storage.from('MAPAS-ROTAS').getPublicUrl(nomeArquivo);

  return (
    <div className="mt-5 p-4 border border-slate-200 rounded-2xl text-center bg-white shadow-sm">
      <p className="text-slate-600 text-sm mb-3">Mapa para: <strong className="text-slate-900">{destination}</strong></p>
      
      <a 
        href={data.publicUrl} 
        target="_blank" 
        rel="noreferrer"
        className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
      >
        ABRIR MAPA PDF
      </a>
      
      <p className="text-[10px] text-slate-400 mt-3 font-mono uppercase tracking-wider">Arquivo: {nomeArquivo}</p>
    </div>
  );
};

export default VisualizadorDeMapa;
