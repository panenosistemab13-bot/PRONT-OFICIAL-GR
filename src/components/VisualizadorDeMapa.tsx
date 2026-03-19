import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  if (!destination) return null;

  // 1. Gera o nome do arquivo exatamente como está no bucket
  const nomeArquivo = `rota_${destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, '').replace(/\s+/g, '_')}.pdf`;

  // 2. Apenas gera a URL (não faz chamada de 'save' no banco)
  const { data } = supabase.storage
    .from('MAPAS-ROTAS')
    .getPublicUrl(nomeArquivo);

  return (
    <div style={{ width: '100%', height: '500px', marginTop: '10px', border: '1px solid #ccc' }}>
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`}
        style={{ width: '100%', height: '100%' }}
        frameBorder="0"
      />
    </div>
  );
};

export default VisualizadorDeMapa;
