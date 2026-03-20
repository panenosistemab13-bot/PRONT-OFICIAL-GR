import React from 'react';
import { supabase } from '../services/supabase';

const VisualizadorDeMapa = ({ destination, filename }: { destination: string; filename?: string }) => {
  const [error, setError] = React.useState(false);
  if (!destination && !filename) return null;

  // Se o filename já foi calculado no AdminDashboard, usamos ele.
  // Caso contrário, ou se for o padrão, tentamos recalcular com base no destino.
  let nomeArquivo = filename;
  
  const MAPA_REFERENCIA_LOCAL = {
    "NATAL - VIA MONTES CLAROS": "NATAL_MONTES_CLAROS.png",
    "NATAL - VIA ANTONIO DIAS": "NATAL_ANTONIO_DIAS.png",
    "NATAL - EUSEBIO": "NATAL_EUSEBIO.png",
    "SALVADOR - VIA CURVELO": "SALVADOR_CURVELO.png",
    "SALVADOR - VIA ANTONIO DIAS": "SALVADOR_ANTONIO_DIAS.png",
    "SALVADOR/BA (VIA CURVELO)": "SALVADOR_CURVELO.png",
    "SALVADOR/BA (VIA ANTONIO DIAS)": "SALVADOR_ANTONIO_DIAS.png",
    "NATAL/RN (VIA MONTES CLAROS)": "NATAL_MONTES_CLAROS.png",
    "NATAL/RN (VIA ANTONIO DIAS)": "NATAL_ANTONIO_DIAS.png",
    "CURITIBA (DESTRO)": "CURITIBA.png",
    "CURITIBA (CONDOR)": "CURITIBA.png",
    "XAXIM": "XAXIM.png",
    "PORTO VELHO": "PORTO VELHO.png",
    "BEBEDOURO": "BEBEDOURO.png",
    "BRASILIA": "BRASILIA.png",
    "CAMBE": "CAMBE.png",
    "CAMPO GRANDE": "CAMPO GRANDE.png",
    "CASTRO": "CASTRO.png",
    "CUIABA": "CUIABA.png",
    "CURITIBA": "CURITIBA.png",
    "NATAL": "NATAL.png",
    "EUSEBIO": "EUSEBIO.png",
    "GOV. CELSO RAMOS": "GOV. CELSO RAMOS.png",
    "GRAVATAI": "GRAVATAI.png",
    "GUARULHOS": "GUARULHOS.png",
    "JUIZ DE FORA": "JUIZ DE FORA.png",
    "LINHARES": "LINHARES.png",
    "MONTES CLAROS": "MONTES CLAROS.png",
    "ANTONIO DIAS": "ANTONIO DIAS.png",
    "PIRACICABA": "PIRACICABA.png",
    "VITORIA": "VITORIA.png",
    "RIO DE JANEIRO": "RIO DE JANEIRO.png",
    "SALVADOR": "SALVADOR.png",
    "PAVUNA": "PAVUNA.png",
    "FRANCA": "FRANCA.png",
    "PINHAIS": "PINHAIS.png",
    "MARILIA": "MARILIA.png",
    "LONDRINA": "LONDRINA.png",
    "BELO HORIZONTE": "BELO HORIZONTE.png",
    "SANTA LUZIA": "SANTA LUZIA.png"
  };

  if (!nomeArquivo || nomeArquivo === "PADRAO.png") {
    const destinoInfo = (destination || "").toUpperCase();
    let searchString = destinoInfo;
    if (destinoInfo.includes(" X ")) {
      searchString = destinoInfo.split(" X ")[1] || destinoInfo;
    } else if (destinoInfo.includes("|")) {
      const parts = destinoInfo.split(" X ");
      if (parts.length > 1) searchString = parts[1];
    }

    const sortedKeys = Object.keys(MAPA_REFERENCIA_LOCAL).sort((a, b) => b.length - a.length);
    const nomeChave = sortedKeys.find(key => searchString.includes(key));
    nomeArquivo = nomeChave ? MAPA_REFERENCIA_LOCAL[nomeChave as keyof typeof MAPA_REFERENCIA_LOCAL] : "PADRAO.png";
  } else {
    // Se vier do AdminDashboard com .pdf, trocamos para .png para exibição direta
    nomeArquivo = nomeArquivo.replace('.pdf', '.png');
  }
  
  const { data } = supabase.storage.from('mapas-rotas').getPublicUrl(nomeArquivo);

  return (
    <div className="mt-5 p-2 border border-slate-200 rounded-2xl text-center bg-white shadow-sm overflow-hidden">
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Mapa de Rota: {destination}</p>
      
      <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 min-h-[100px] flex items-center justify-center">
        {!error ? (
          <img 
            src={data.publicUrl} 
            alt={`Mapa para ${destination}`}
            className="w-full h-auto block"
            referrerPolicy="no-referrer"
            onError={() => setError(true)}
          />
        ) : (
          <div className="p-4 text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium italic">Mapa não encontrado para esta rota.</p>
            <p className="text-[9px] text-slate-300 uppercase tracking-wider font-bold">Arquivo: {nomeArquivo}</p>
          </div>
        )}
      </div>
      
      {!error && (
        <a 
          href={data.publicUrl} 
          target="_blank" 
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700"
        >
          Ver em tela cheia
        </a>
      )}
    </div>
  );
};

export default VisualizadorDeMapa;
