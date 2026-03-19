import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    const buscarMapa = async () => {
      if (!destination) return;

      // 1. Gera o nome do arquivo limpando tudo: "rota_gov_celso_ramos.pdf"
      const base = destination.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\./g, '')
        .trim()
        .replace(/\s+/g, '_');
      
      const nomeArquivo = `rota_${base}.pdf`;

      // 2. Tenta buscar a URL no bucket (testando os dois nomes possíveis)
      const { data } = supabase.storage
        .from('MAPAS-ROTAS') // Tenta o nome em maiúsculo primeiro
        .getPublicUrl(nomeArquivo);

      if (data?.publicUrl) {
        setPublicUrl(data.publicUrl);
      }
    };
    buscarMapa();
  }, [destination]);

  if (!publicUrl) return null;

  // 3. Link direto + Google Viewer como backup
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicUrl)}&embedded=true`;

  return (
    <div style={{ width: '100%', marginTop: '20px' }}>
      <div style={{ width: '100%', height: '600px', border: '2px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
        <iframe
          src={viewerUrl}
          style={{ width: '100%', height: '100%' }}
          frameBorder="0"
          title="Mapa de Rota"
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <a href={publicUrl} target="_blank" rel="noreferrer" style={{ color: '#007bff', fontSize: '12px' }}>
          Não carregou? Clique para abrir o PDF original
        </a>
      </div>
    </div>
  );
};

export default VisualizadorDeMapa;
