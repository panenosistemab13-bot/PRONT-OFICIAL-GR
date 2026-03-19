import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    const carregarMapa = async () => {
      if (!destination) return;

      // Limpa o nome: "GOV. CELSO RAMOS" -> "rota_gov_celso_ramos"
      const base = destination.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\./g, '').replace(/\s+/g, '_');

      // Tentamos as duas variações de bucket que apareceram nos seus prints
      const buckets = ['MAPAS-ROTAS', 'mapas-rotas'];
      
      // Nota: getPublicUrl apenas gera a string da URL. 
      // Assumimos o primeiro bucket e o formato padrão 'rota_nome.pdf'
      for (const b of buckets) {
        const { data } = supabase.storage.from(b).getPublicUrl(`rota_${base}.pdf`);
        
        if (data?.publicUrl) {
          setMapUrl(data.publicUrl);
          break; 
        }
      }
    };
    carregarMapa();
  }, [destination]);

  if (!mapUrl) return null;

  return (
    <div style={{ width: '100%', height: '600px', border: '2px solid #000', marginTop: '20px' }}>
      <iframe 
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(mapUrl)}&embedded=true`}
        style={{ width: '100%', height: '100%' }}
        title="Mapa da Rota"
      />
    </div>
  );
};

export default VisualizadorDeMapa;
