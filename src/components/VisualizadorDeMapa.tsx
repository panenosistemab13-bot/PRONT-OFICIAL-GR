import React from 'react';
import { supabase } from '../services/supabase';

const VisualizadorDeMapa = ({ destination }) => {
  if (!destination) return null;

  // Limpa o nome para bater com o que você subiu (ex: rota_sao_paulo.pdf)
  const nomeLimpo = destination.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.|/]/g, '').replace(/\s+/g, '_');
  
  const nomeArquivo = `rota_${nomeLimpo}.pdf`;

  // Gera a URL pública direto do seu bucket
  const { data } = supabase.storage.from('MAPAS-ROTAS').getPublicUrl(nomeArquivo);

  return (
    <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
      <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Mapa: {destination}</p>
      
      {/* O LINK SEGURO (Caso o quadro cinza falhe) */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <a 
          href={data.publicUrl} 
          target="_blank" 
          rel="noreferrer"
          style={{ padding: '8px 16px', background: '#007bff', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}
        >
          ABRIR PDF ORIGINAL
        </a>
      </div>

      {/* TENTATIVA DE VISUALIZAÇÃO NO QUADRO */}
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`}
        style={{ width: '100%', height: '500px', backgroundColor: '#f9f9f9' }}
        frameBorder="0"
      />
    </div>
  );
};

export default VisualizadorDeMapa;