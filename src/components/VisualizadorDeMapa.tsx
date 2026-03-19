import React from 'react';
import { supabase } from '../services/supabase'; // Verifique se o caminho está certo

const VisualizadorDeMapa = ({ destination }) => {
  if (!destination) return null;

  // Lógica manual: transforma "GOV. CELSO RAMOS" em "rota_gov_celso_ramos.pdf"
  const base = destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.|/]/g, '').replace(/\s+/g, '_');
  
  const nomeArquivo = `rota_${base}.pdf`;
  
  // Gera o link direto do Supabase
  const { data } = supabase.storage.from('MAPAS-ROTAS').getPublicUrl(nomeArquivo);

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold' }}>Mapa para: {destination}</p>
      
      <a 
        href={data.publicUrl} 
        target="_blank" 
        rel="noreferrer"
        style={{ 
          display: 'block', 
          padding: '12px', 
          background: '#007bff', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold',
          marginTop: '10px'
        }}
      >
        ABRIR MAPA (PDF)
      </a>
    </div>
  );
};

export default VisualizadorDeMapa;