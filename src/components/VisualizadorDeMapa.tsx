import React from 'react';
import { supabase } from '../services/supabase';

const VisualizadorDeMapa = ({ destination }) => {
  if (!destination) return null;

  // Formata o nome exatamente como o computador entende
  const base = destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.|/]/g, '').replace(/\s+/g, '_');
  
  const nomeArquivo = `rota_${base}.pdf`;
  const { data } = supabase.storage.from('MAPAS-ROTAS').getPublicUrl(nomeArquivo);

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff' }}>
      <p style={{ color: '#333', marginBottom: '10px' }}>Mapa para: <strong>{destination}</strong></p>
      
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
          fontWeight: 'bold'
        }}
      >
        ABRIR MAPA (PDF ORIGINAL)
      </a>

      <p style={{ fontSize: '10px', color: '#999', marginTop: '10px' }}>
        Buscando no Storage por: {nomeArquivo}
      </p>
    </div>
  );
};

export default VisualizadorDeMapa;
