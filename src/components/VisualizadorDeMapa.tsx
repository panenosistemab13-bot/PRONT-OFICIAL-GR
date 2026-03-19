import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  if (!destination) return null;

  // Esta função garante que o nome do arquivo fique igual ao do Storage
  const formatarNome = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/\./g, "")                             // Remove pontos (Gov. -> Gov)
      .trim()
      .replace(/\s+/g, '_');                          // Espaço vira underline
  };

  const arquivo = `rota_${formatarNome(destination)}.pdf`;

  // Busca no bucket MAPAS-ROTAS (Maiúsculo)
  const { data } = supabase.storage
    .from('MAPAS-ROTAS')
    .getPublicUrl(arquivo);

  const urlFinal = `https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`;

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <iframe
        src={urlFinal}
        style={{ width: '100%', height: '100%' }}
        frameBorder="0"
        title="Mapa da Rota"
      />
      <p style={{ fontSize: '10px', textAlign: 'center' }}>Buscando: {arquivo}</p>
    </div>
  );
};

export default VisualizadorDeMapa;
