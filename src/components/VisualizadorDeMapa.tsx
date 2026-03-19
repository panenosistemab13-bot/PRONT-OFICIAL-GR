import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  if (!destination) return null;

  // 1. Limpa o nome para bater com o Storage: "rota_gov_celso_ramos.pdf"
  const nomeArquivo = `rota_${destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, '').replace(/\s+/g, '_')}.pdf`;

  // 2. Gera a URL pública do arquivo
  const { data } = supabase.storage
    .from('MAPAS-ROTAS')
    .getPublicUrl(nomeArquivo);

  const urlFinal = data?.publicUrl;

  return (
    <div style={{ width: '100%', marginTop: '20px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
      <p style={{ fontWeight: 'bold', textAlign: 'center' }}>Mapa: {destination}</p>
      
      {/* Visualizador do Google */}
      <div style={{ width: '100%', height: '500px', backgroundColor: '#eee' }}>
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(urlFinal)}&embedded=true`}
          style={{ width: '100%', height: '100%' }}
          frameBorder="0"
        />
      </div>

      {/* Botão de Emergência se o quadro acima falhar */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <a 
          href={urlFinal} 
          target="_blank" 
          rel="noreferrer" 
          style={{ color: '#007bff', textDecoration: 'underline', fontSize: '14px' }}
        >
          Clique aqui para abrir o PDF original (Caso não carregue acima)
        </a>
      </div>
    </div>
  );
};

export default VisualizadorDeMapa;
