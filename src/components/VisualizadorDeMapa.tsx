import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  if (!destination) return null;

  const arquivo = `rota_${destination.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "").replace(/\s+/g, '_')}.pdf`;

  // 2. Busca no bucket com o nome EXATO: 'MAPAS-ROTAS'
  const { data } = supabase.storage
    .from('MAPAS-ROTAS')
    .getPublicUrl(arquivo);

  // 3. Google Viewer para visualização
  const urlFinal = `https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`;

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <iframe
        src={urlFinal}
        style={{ width: '100%', height: '100%' }}
        frameBorder="0"
        title="Mapa da Rota"
      />
      <p style={{ fontSize: '10px', textAlign: 'center' }}>Buscando: {arquivo}</p>
    </div>
  );
};

export default VisualizadorDeMapa;
