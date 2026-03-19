import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  if (!destination) return null;

  // Limpa o nome para o formato: rota_cidade_uf.pdf
  const nomeArquivo = `rota_${destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, '').replace(/\s+/g, '_')}.pdf`;

  // Apenas busca a URL (não faz escrita no banco)
  const { data } = supabase.storage
    .from('MAPAS-ROTAS')
    .getPublicUrl(nomeArquivo);

  return (
    <div style={{ width: '100%', height: '500px', marginTop: '10px' }}>
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`}
        style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}
        frameBorder="0"
      />
    </div>
  );
};

export default VisualizadorDeMapa;
