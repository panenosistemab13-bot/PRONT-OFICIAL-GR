import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  if (!destination) return null;

  // Limpa o nome para o formato do seu storage
  const nomeArquivo = `rota_${destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, '').replace(/\s+/g, '_')}.pdf`;

  const { data } = supabase.storage.from('MAPAS-ROTAS').getPublicUrl(nomeArquivo);

  return (
    <div style={{ width: '100%', marginTop: '20px' }}>
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`}
        style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
        title="Visualizador de Mapa"
      />
    </div>
  );
};

export default VisualizadorDeMapa;
