import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface RouteMapProps {
  origin: string;
  destination: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({ origin, destination }) => {
  const getItinerary = (dest: string) => {
    const d = dest.toLowerCase();
    if (d.includes('celso ramos')) {
      return ["Santa Luzia/MG", "Carmópolis de Minas/MG", "Pouso Alegre/MG", "Bragança Paulista/SP", "Jarinu/SP", "Juquitiba/SP", "São José dos Pinhais/PR", "Joinville/SC", "Gov. Celso Ramos/SC"];
    }
    if (d.includes('bebedouro')) {
      return ["Santa Luzia/MG", "Betim/MG", "Oliveira/MG", "Lavras/MG", "Pouso Alegre/MG", "Ribeirão Preto/SP", "Bebedouro/SP"];
    }
    if (d.includes('rio de janeiro')) {
      return ["Santa Luzia/MG", "Belo Horizonte/MG", "Conselheiro Lafaiete/MG", "Juiz de Fora/MG", "Três Rios/RJ", "Duque de Caxias/RJ", "Rio de Janeiro/RJ"];
    }
    if (d.includes('curitiba')) {
      return ["Santa Luzia/MG", "Belo Horizonte/MG", "Betim/MG", "Pouso Alegre/MG", "Atibaia/SP", "São Paulo/SP", "Registro/SP", "Curitiba/PR"];
    }
    if (d.includes('natal') || d.includes('eusebio')) {
      return ["Santa Luzia/MG", "Curvelo/MG", "Montes Claros/MG", "Vitória da Conquista/BA", "Feira de Santana/BA", "Maceió/AL", "Recife/PE", "João Pessoa/PB", "Natal/RN"];
    }
    return [origin || 'Santa Luzia/MG', "...", destination || 'Não Informado'];
  };

  const itinerary = getItinerary(destination);
  
  return (
    <div className="w-full bg-white border border-black p-4 font-sans">
      <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-black" />
          <span className="text-xs font-bold uppercase tracking-tighter">Mapa de Trajeto Oficial</span>
        </div>
        <div className="text-[10px] font-mono">ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
      </div>
      
      <div className="relative min-h-[200px] bg-slate-50 border border-black p-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Stylized Route Visualization */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        
        <div className="relative z-10 w-full space-y-6">
          <div className="flex items-center gap-3 w-full">
            <div className="w-3 h-3 rounded-full border-2 border-black bg-white shrink-0" />
            <div className="flex-1 h-px bg-black border-t border-dashed border-black" />
            <div className="w-3 h-3 bg-black shrink-0 rotate-45" />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Itinerário de Referência</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {itinerary.map((city, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-black" />
                  <span className="text-[10px] font-bold text-black uppercase">{city}</span>
                  {i < itinerary.length - 1 && <span className="text-slate-300">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 text-[8px] font-bold text-slate-400 uppercase">
          Gerenciamento de Risco • 3 Corações
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-[9px]">
        <div className="border border-black p-2">
          <span className="block font-bold mb-1 uppercase">Pontos de Parada Autorizados</span>
          <ul className="list-disc list-inside space-y-0.5 font-medium">
            <li>Postos Rede Graal</li>
            <li>Postos Frango Assado</li>
            <li>Pontos de Apoio Transportadora</li>
          </ul>
        </div>
        <div className="border border-black p-2">
          <span className="block font-bold mb-1 uppercase">Observações de Rota</span>
          <p className="font-medium">Siga rigorosamente o itinerário. Desvios não autorizados bloqueiam o veículo automaticamente via satélite.</p>
        </div>
      </div>
    </div>
  );
};
