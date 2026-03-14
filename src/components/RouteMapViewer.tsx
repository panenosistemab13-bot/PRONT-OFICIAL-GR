import React, { useState } from 'react';
import { Map, Image as ImageIcon, AlertCircle } from 'lucide-react';

// Mapeamento das rotas para as URLs das imagens
// As imagens devem estar na pasta public/maps/ ou em um bucket do Supabase
export const routeMaps: Record<string, string> = {
  'SANTA_LUZIA_PORTO_VELHO': '/maps/santa_luzia_porto_velho.png',
  'SANTA_LUZIA_XAXIM': '/maps/santa_luzia_xaxim.png',
  'SANTA_LUZIA_BEBEDOURO': '/maps/santa_luzia_bebedouro.png',
  'SANTA_LUZIA_CAMBE': '/maps/santa_luzia_cambe.png',
  'SANTA_LUZIA_CAMPO_GRANDE': '/maps/santa_luzia_campo_grande.png',
  'SANTA_LUZIA_CURITIBA': '/maps/santa_luzia_curitiba.png',
  'SANTA_LUZIA_NATAL': '/maps/santa_luzia_natal.png',
  'SANTA_LUZIA_EUSEBIO': '/maps/santa_luzia_eusebio.png',
  'SANTA_LUZIA_GOV_CELSO_RAMOS': '/maps/santa_luzia_gov_celso_ramos.png',
  'SANTA_LUZIA_GRAVATAI': '/maps/santa_luzia_gravatai.png',
  'SANTA_LUZIA_GUARULHOS': '/maps/santa_luzia_guarulhos.png',
  'SANTA_LUZIA_JUIZ_DE_FORA': '/maps/santa_luzia_juiz_de_fora.png',
  'SANTA_LUZIA_LINHARES': '/maps/santa_luzia_linhares.png',
  'SANTA_LUZIA_PINHAIS': '/maps/santa_luzia_pinhais.png',
  'SANTA_LUZIA_RIO_DE_JANEIRO': '/maps/santa_luzia_rio_de_janeiro.png',
};

// Função auxiliar para normalizar o nome da rota e encontrar a chave correta
export const getRouteImageKey = (origem: string, destino: string): string => {
  if (!origem || !destino) return '';
  
  const normalize = (str: string) => 
    str.toUpperCase()
       .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
       .replace(/[^A-Z0-9]/g, "_") // Substitui caracteres especiais por _
       .replace(/_+/g, "_") // Remove múltiplos _
       .replace(/^_|_$/g, ""); // Remove _ no início e no fim

  const key = `${normalize(origem)}_${normalize(destino)}`;
  
  // Tenta encontrar a chave exata ou uma que contenha as cidades principais
  if (routeMaps[key]) return key;
  
  const possibleKey = Object.keys(routeMaps).find(k => 
    k.includes(normalize(origem.split('/')[0])) && 
    k.includes(normalize(destino.split('/')[0]))
  );
  
  return possibleKey || '';
};

interface RouteMapViewerProps {
  origem: string;
  destino: string;
  className?: string;
}

export const RouteMapViewer: React.FC<RouteMapViewerProps> = ({ origem, destino, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const routeKey = getRouteImageKey(origem, destino);
  const imageUrl = routeKey ? routeMaps[routeKey] : null;

  return (
    <div className={`flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-white ${className}`}>
      <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-2">
        <Map className="w-4 h-4 text-slate-500" />
        <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          Visualização do Mapa de Rota
        </h4>
      </div>
      
      <div className="relative w-full h-64 bg-slate-100 flex items-center justify-center">
        {isLoading && imageUrl && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
            <span className="text-xs font-medium text-slate-500">Carregando mapa...</span>
          </div>
        )}

        {imageUrl && !hasError ? (
          <img
            src={imageUrl}
            alt={`Mapa da rota ${origem} para ${destino}`}
            className="w-full h-full object-contain p-2"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            {hasError ? (
              <>
                <AlertCircle className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Erro ao carregar o mapa</p>
                <p className="text-xs mt-1">A imagem para esta rota não foi encontrada.</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Mapa indisponível</p>
                <p className="text-xs mt-1">Não há mapa cadastrado para a rota:<br/><strong>{origem} x {destino}</strong></p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
