import React from 'react';
import { supabase } from '../services/supabase';

const VisualizadorDeMapa = ({ destination }) => {
  if (!destination) return null;

  // Gera o nome do arquivo na mão para não dar erro
  const base = destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.|/]/g, '').replace(/\s+/g, '_');
  
  const nomeArquivo = `rota_${base}.pdf`;

  // Tenta pegar a URL do bucket MAPAS-ROTAS
  const { data } = supabase.storage.from('MAPAS-ROTAS').getPublicUrl(nomeArquivo);

  return (
    <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc' }}>
      <p style={{ fontSize: '12px' }}>Mapa: {destination}</p>
      
      {/* Botão direto (Mais seguro quando a IA ou o Iframe falham) */}
      <a 
        href={data.publicUrl} 
        target="_blank" 
        rel="noreferrer"
        style={{ 
          display: 'block', 
          textAlign: 'center', 
          padding: '10px', 
          background: '#007bff', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        ABRIR MAPA AGORA
      </a>

      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`}
        style={{ width: '100%', height: '400px', marginTop: '10px' }}
        frameBorder="0"
      />
    </div>
  );
};

export default VisualizadorDeMapa;