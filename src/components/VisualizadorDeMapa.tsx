import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  if (!destination) return null;

  // 1. Gera o nome do arquivo (ex: "rota_sumare.pdf")
  const nomeLimpo = destination.toLowerCase().trim().replace(/\s+/g, '_');
  const nomeArquivo = `rota_${nomeLimpo}.pdf`;

  // 2. Pega a URL do bucket 'mapas-rotas'
  const { data } = supabase.storage
    .from('mapas-rotas')
    .getPublicUrl(nomeArquivo);

  // 3. O SEGREDO: Se a tela continuar cinza, teste este link em uma aba separada
  const urlFinal = `https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`;

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      <iframe
        src={urlFinal}
        style={{ width: '100%', height: '100%' }}
        frameBorder="0"
        title="Mapa da Rota"
      />
    </div>
  );
};

export default VisualizadorDeMapa;
