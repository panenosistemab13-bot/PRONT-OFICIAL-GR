import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  // Se não tiver destino selecionado, não mostra nada
  if (!destination) return null;

  // 1. LIMPEZA TOTAL DO NOME (Igual ao que está no seu Storage)
  // Exemplo: "GOV. CELSO RAMOS | SC" vira "rota_gov_celso_ramos_sc.pdf"
  const nomeLimpo = destination
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Tira acentos
    .replace(/[.|/]/g, '')                          // Tira pontos e barras
    .trim()
    .replace(/\s+/g, '_');                          // Espaços viram _

  const nomeArquivo = `rota_${nomeLimpo}.pdf`;

  // 2. BUSCA A URL NO BUCKET (Certifique-se que o nome no Storage é MAPAS-ROTAS)
  const { data } = supabase.storage
    .from('MAPAS-ROTAS')
    .getPublicUrl(nomeArquivo);

  const urlFinal = data?.publicUrl;

  return (
    <div style={{ marginTop: '20px', border: '2px solid #333', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '10px' }}>Mapa de Rota: {destination}</h3>
      
      {/* O LINK QUE TINHA SUMIDO */}
      <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p style={{ fontSize: '14px', color: '#333' }}>O arquivo buscado é: <strong>{nomeArquivo}</strong></p>
        
        <a 
          href={urlFinal} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: 'inline-block', 
            marginTop: '10px', 
            padding: '12px 24px', 
            backgroundColor: '#007bff', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          CLIQUE AQUI PARA ABRIR O MAPA
        </a>
      </div>

      {/* TENTATIVA DE MOSTRAR NA TELA (Opcional) */}
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(urlFinal)}&embedded=true`}
        style={{ width: '100%', height: '400px', marginTop: '15px', border: '1px solid #ccc' }}
        frameBorder="0"
      />
    </div>
  );
};

export default VisualizadorDeMapa;
