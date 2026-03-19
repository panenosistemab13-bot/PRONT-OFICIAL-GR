import React from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination }) => {
  if (!destination) return null;

  // ESTA FUNÇÃO É A CHAVE: Ela limpa o nome para bater com o arquivo
  const formatarNomeArquivo = (nome: string) => {
    return nome
      .toLowerCase()                                  // Tudo minúsculo
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos (Á -> A)
      .replace(/\./g, '')                             // Remove pontos
      .trim()                                         // Tira espaços nas pontas
      .replace(/\s+/g, '_');                          // Troca espaços por _
  };

  const nomeLimpo = formatarNomeArquivo(destination);
  const nomeFinal = `rota_${nomeLimpo}.pdf`; // Garante que começa com rota_ e termina com .pdf único

  // Busca no bucket MAPAS-ROTAS (Maiúsculo conforme sua imagem b86d40)
  const { data } = supabase.storage
    .from('MAPAS-ROTAS')
    .getPublicUrl(nomeFinal);

  const urlVisualizacao = `https://docs.google.com/viewer?url=${encodeURIComponent(data.publicUrl)}&embedded=true`;

  return (
    <div style={{ width: '100%', marginTop: '20px' }}>
      <div style={{ width: '100%', height: '600px', border: '2px solid #000', borderRadius: '8px', overflow: 'hidden' }}>
        <iframe
          src={urlVisualizacao}
          style={{ width: '100%', height: '100%' }}
          frameBorder="0"
          title="Mapa da Rota"
        />
      </div>
      <p style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '5px' }}>
        Buscando arquivo: <strong>{nomeFinal}</strong>
      </p>
    </div>
  );
};

export default VisualizadorDeMapa;
