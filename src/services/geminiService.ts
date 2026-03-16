import { GoogleGenAI, Type } from "@google/genai";
import { DriverData } from "../types";

// CORREÇÃO AQUI: Mudamos de process.env para import.meta.env
// E usamos o nome exato que está nos seus Secrets: VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

export async function parseDriverLine(text: string): Promise<DriverData> {
  // Verificação de segurança para te avisar no console se a chave sumir de novo
  if (!apiKey) {
    console.error("ERRO: A variável VITE_GEMINI_API_KEY não foi encontrada!");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extraia as informações desta linha de planilha de transporte para um objeto JSON. 
    A linha contém dados como: Mês, Origem, Dia, Data, Contato Whats, Hora Liberado, Status, Modelo Carreta, Modelo Cavalo, Fez Contato?, Destino, Transportador, Cavalo, Carreta, Motorista, CPF, RG, CNH, Telefone, Vigência do Cadastro, Vínculo, UF Placas, Tecnologia.
    
    Mapeie também campos implícitos ou relacionados:
    - Destino -> Trajeto
    - Modelo Carreta -> Tipo Carreta
    - Modelo Cavalo -> Tipo Cavalo
    - Transportador -> Transportadora
    - Tecnologia -> Tecnologia
    
    Texto da linha:
    "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mes: { type: Type.STRING },
          origem: { type: Type.STRING },
          dia: { type: Type.STRING },
          data: { type: Type.STRING },
          contato_whats: { type: Type.STRING },
          hora_liberado: { type: Type.STRING },
          status: { type: Type.STRING },
          modelo_carreta: { type: Type.STRING },
          modelo_cavalo: { type: Type.STRING },
          fez_contato: { type: Type.STRING },
          destino: { type: Type.STRING },
          transportador: { type: Type.STRING },
          cavalo: { type: Type.STRING },
          carreta: { type: Type.STRING },
          carreta2: { type: Type.STRING },
          motorista: { type: Type.STRING },
          cpf: { type: Type.STRING },
          rg: { type: Type.STRING },
          cnh: { type: Type.STRING },
          telefone: { type: Type.STRING },
          vigencia_cadastro: { type: Type.STRING },
          vinculo: { type: Type.STRING },
          uf_placas: { type: Type.STRING },
          tipo_carreta: { type: Type.STRING },
          tipo_cavalo: { type: Type.STRING },
          tecnologia: { type: Type.STRING },
          trajeto: { type: Type.STRING },
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {} as DriverData;
  }
}