import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface VisualizadorDeMapaProps {
  destination: string;
  itinerary?: string;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ destination, itinerary }) => {
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
        
        // Busca na tabela 'maps' pelo destino
        const { data, error: fetchError } = await supabase
          .from('maps')
          .select('image_data')
          .ilike('destination', `%${destination}%`)
          .limit(1)
          .single();

        if (fetchError || !data) {
          console.warn("Mapa não encontrado na tabela 'maps' para:", destination);
          setError(true);
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
  }, [destination]);

  // Processar o itinerário (assumindo que as cidades estão separadas por ; ou | ou quebra de linha)
  const cities = itinerary 
    ? itinerary.split(/[;|\n]+/).map(city => city.trim()).filter(city => city.length > 0)
    : [];

  return (
    <div className="w-full bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm font-sans">
      {/* Cabeçalho do Relatório */}
      <div className="bg-slate-100 p-3 border-b border-slate-300 flex justify-between items-center">
        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Plano de Rota: {destination}
        </h3>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Relatório Oficial GR</span>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Área do Mapa */}
        <div className="flex-1 p-1 bg-slate-50 border-r border-slate-200 min-h-[300px] flex items-center justify-center relative">
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
            <img 
              src={mapImage} 
              alt={`Mapa para ${destination}`}
              className="w-full h-auto block object-contain max-h-[600px]"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Lista de Itinerário */}
        <div className="w-full md:w-64 bg-white p-0 flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Cidades do Itinerário:</h4>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {cities.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {cities.map((city, idx) => (
                  <li key={idx} className="p-3 flex items-start gap-2 hover:bg-slate-50 transition-colors">
                    <span className="text-indigo-500 font-bold text-xs mt-0.5">»</span>
                    <span className="text-[11px] font-bold text-slate-700 uppercase leading-tight">{city}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-[10px] text-slate-400 font-medium italic">Itinerário não detalhado</p>
              </div>
            )}
            
            {/* Linhas vazias para parecer um formulário oficial se houver poucas cidades */}
            {cities.length < 10 && Array.from({ length: 10 - cities.length }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 border-b border-slate-50"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizadorDeMapa;
