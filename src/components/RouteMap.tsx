import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Map as MapIcon } from 'lucide-react';

interface RouteMapProps {
  origin: string;
  destination: string;
}

// Mapeamento das rotas para os nomes dos arquivos de imagem
// Adicione ou modifique os nomes conforme os arquivos exatos que você subiu na aba "Image"
const ROUTE_IMAGES: Record<string, string> = {
  "SANTA LUZIA x LONDRINA": "/SANTA LUZIA x LONDRINA.png",
  "SANTA LUZIA x GOV. CELSO RAMOS": "/SANTA LUZIA x GOV. CELSO RAMOS.png",
  "SANTA LUZIA x BEBEDOURO": "/SANTA LUZIA x BEBEDOURO.png",
  "SANTA LUZIA x RIO DE JANEIRO": "/SANTA LUZIA x RIO DE JANEIRO.png",
  "SANTA LUZIA x CURITIBA": "/SANTA LUZIA x CURITIBA.png",
  "SANTA LUZIA x NATAL": "/SANTA LUZIA x NATAL.png",
  "SANTA LUZIA x EUSEBIO": "/SANTA LUZIA x EUSEBIO.png",
  // Exemplo de como adicionar mais rotas:
  // "ORIGEM x DESTINO": "/nome-do-arquivo.png"
};

export const RouteMap: React.FC<RouteMapProps> = ({ origin, destination }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Normaliza os nomes para criar a chave de busca (ex: "SANTA LUZIA x LONDRINA")
  const cleanOrigin = origin.split('/')[0].trim().toUpperCase();
  const cleanDestination = destination.split('/')[0].trim().toUpperCase();
  const routeName = `${cleanOrigin} x ${cleanDestination}`;
  
  // Busca no mapeamento, ou tenta usar o nome da rota como fallback
  const imagePath = ROUTE_IMAGES[routeName] || `/${routeName}.png`;

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
  
  // Reseta o estado quando a rota muda
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [routeName]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 font-sans shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider block">Mapa de Trajeto</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{routeName}</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
      </div>
      
      <div className="relative w-full h-[300px] bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center overflow-hidden mb-6 group">
        
        {/* Imagem do Mapa */}
        {!imageError && (
          <img 
            src={imagePath} 
            alt={`Mapa da rota ${routeName}`}
            className={`absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-500 z-20 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Fallback de Luxo quando a imagem não existe ou está carregando */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center relative">
                {imageError ? (
                  <MapPin className="w-6 h-6 text-slate-300" />
                ) : (
                  <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-100 rounded-full border-2 border-white flex items-center justify-center">
                  <Navigation className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                  {imageError ? "Mapa em sincronização..." : "Carregando rota..."}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {imageError ? "Aguardando atualização do sistema de satélite" : "Estabelecendo conexão segura"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Itinerário de Referência</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {itinerary.map((city, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="text-[11px] font-bold text-slate-700">{city}</span>
                {i < itinerary.length - 1 && <span className="text-slate-300">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pontos de Parada Autorizados</span>
          <ul className="space-y-1.5 text-xs font-medium text-slate-600">
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full"/> Postos Rede Graal</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full"/> Postos Frango Assado</li>
            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full"/> Pontos de Apoio Transportadora</li>
          </ul>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Observações de Rota</span>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Siga rigorosamente o itinerário. Desvios não autorizados bloqueiam o veículo automaticamente via satélite.
          </p>
        </div>
      </div>
    </div>
  );
};
