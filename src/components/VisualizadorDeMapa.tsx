import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!destination) return;

    // 1. Limpeza rigorosa do nome do arquivo
    const nomeLimpo = destination
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Tira acento
      .replace(/\./g, '')                             // Tira ponto do "Gov."
      .trim()
      .replace(/\s+/g, '_');                          // Espaço vira _

    const nomeArquivo = `rota_${nomeLimpo}.pdf`;

    // 2. Busca a URL pública no bucket MAPAS-ROTAS
    const { data } = supabase.storage
      .from('MAPAS-ROTAS')
      .getPublicUrl(nomeArquivo);

    if (data?.publicUrl) {
      setUrl(data.publicUrl);
    }
  }, [destination]);

  if (!url) return <div style={{ textAlign: 'center', padding: '20px' }}>Carregando mapa...</div>;

  return (
    <div style={{ width: '100%', marginTop: '20px' }}>
      <div style={{ 
        width: '100%', 
        height: '600px', 
        border: '2px solid #333', 
        borderRadius: '8px', 
        overflow: 'hidden',
        backgroundColor: '#f5f5f5' 
      }}>
        {/* Usando object em vez de iframe do Google para carregar o PDF real */}
        <object
          data={url}
          type="application/pdf"
          width="100%"
          height="100%"
        >
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Seu navegador não consegue exibir o PDF aqui.</p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ padding: '10px 20px', background: '#007bff', color: '#fff', borderRadius: '5px', textDecoration: 'none' }}
            >
              Clique aqui para abrir o mapa em tela cheia
            </a>
          </div>
        </object>
      </div>
      <p style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
        Arquivo: <strong>rota_{destination.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "").replace(/\s+/g, '_')}.pdf</strong>
      </p>
    </div>
  );
};

export default VisualizadorDeMapa;
