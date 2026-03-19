import React from 'react';
import { supabase } from '../services/supabase';

const VisualizadorDeMapa = ({ destination }) => {
  if (!destination) return null;

  // Transforma "SANTA LUZIA|MG" em "rota_santa_luzia_mg.pdf"
  const nomeLimpo = destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.|/]/g, '').replace(/\s+/g, '_');
  
  const nomeArquivo = `rota_${nomeLimpo}.pdf`;
  
  // Pega o link direto do bucket MAPAS-ROTAS
  const { data } = supabase.storage.from('MAPAS-ROTAS').getPublicUrl(nomeArquivo);

  return (
    <div style={{ marginTop: '20px', textAlign: 'center', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
      <p style={{ marginBottom: '10px' }}><strong>Destino:</strong> {destination}</p>
      
      <a 
        href={data.publicUrl} 
        target="_blank" 
        rel="noreferrer"
        style={{ 
          display: 'inline-block', 
          padding: '12px 20px', 
          backgroundColor: '#007bff', 
          color: '#fff', 
          textDecoration: 'none', 
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        ABRIR MAPA PDF
      </a>
      
      <p style={{ fontSize: '10px', color: '#999', marginTop: '10px' }}>Arquivo: {nomeArquivo}</p>
    </div>
  );
};

export default VisualizadorDeMapa;