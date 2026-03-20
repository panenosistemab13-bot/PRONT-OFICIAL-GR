import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
  itinerary?: string;
  mapa_arquivo?: string;
  driverName?: string;
  driverCpf?: string;
  showWatermark?: boolean;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ 
  destination, 
  itinerary, 
  mapa_arquivo,
  driverName,
  driverCpf,
  showWatermark = false
}) => {
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMap = async () => {
      if (!destination) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        
        // 1. Busca na tabela 'maps' pelo destino
        const { data, error: fetchError } = await supabase
          .from('maps')
          .select('image_data')
          .ilike('destination', `%${destination}%`)
          .limit(1)
          .single();

        if (fetchError || !data || !data.image_data) {
          console.warn("Mapa não encontrado na tabela 'maps' para:", destination);
          
          // 2. Fallback para o storage se não encontrar na tabela maps
          if (mapa_arquivo) {
            const { data: { publicUrl } } = supabase.storage.from('mapas-rotas').getPublicUrl(mapa_arquivo);
            setMapImage(publicUrl);
          } else {
            setError(true);
          }
        } else {
          setMapImage(data.image_data);
        }
      } catch (err) {
        console.error("Erro ao buscar mapa:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [destination, mapa_arquivo]);

  const handleImageError = () => {
    console.warn("Erro ao carregar imagem do mapa, tentando fallback...");
    if (mapa_arquivo && !mapImage?.includes('supabase.co')) {
      const { data: { publicUrl } } = supabase.storage.from('mapas-rotas').getPublicUrl(mapa_arquivo);
      setMapImage(publicUrl);
    } else {
      setError(true);
    }
  };

  // Componente de Marca d'Água Repetida
  const WatermarkOverlay = () => {
    if (!showWatermark) return null;

    const watermarkText = `CONFIDENCIAL - LOGÍSTICA 3CORAÇÕES | ${driverName || 'MOTORISTA'} | ${driverCpf || 'CPF'}`;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.12] select-none z-10">
        <div 
          className="w-[200%] h-[200%] -top-1/2 -left-1/2 flex flex-wrap content-start justify-center gap-x-24 gap-y-32 rotate-[-25deg]"
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="whitespace-nowrap text-slate-900 font-black text-sm tracking-widest uppercase">
              {watermarkText}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm font-sans relative">
      {/* Cabeçalho do Relatório */}
      <div className="bg-slate-100 p-3 border-b border-slate-300 flex justify-between items-center relative z-20">
        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Plano de Rota: {destination}
        </h3>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Relatório Oficial GR</span>
      </div>

      <div className="flex flex-col relative">
        {/* Área do Mapa - Agora ocupando largura total */}
        <div className="w-full p-1 bg-slate-50 min-h-[300px] flex items-center justify-center relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Carregando Mapa...</p>
            </div>
          ) : error || !mapImage ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium italic">Visualização do mapa indisponível</p>
              <p className="text-[9px] text-slate-300 uppercase tracking-wider font-bold">Destino: {destination}</p>
            </div>
          ) : (
            <>
              <img 
                src={mapImage} 
                alt={`Mapa para ${destination}`}
                className="w-full h-auto block object-contain max-h-[800px] relative z-0"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <WatermarkOverlay />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizadorDeMapa;
