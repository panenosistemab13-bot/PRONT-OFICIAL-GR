import { LOGO_3_CORACOES } from '../constants';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clipboard, 
  Link as LinkIcon, 
  CheckCircle, 
  Loader2, 
  Copy, 
  History, 
  LayoutDashboard, 
  Download,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Truck,
  User,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Coffee
} from 'lucide-react';
import { parseDriverLine } from '../services/geminiService';
import { supabase } from '../services/supabase';
import { DriverData, Contract } from '../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';

const CHECKLIST_ITEMS = [
  "O VEÍCULO APRESENTA-SE LIMPO E EM BOAS CONDIÇÕES DE ACESSO AO DEPÓSITO.",
  "AUSÊNCIA DE VESTÍGIOS DE QUE TRANSPORTOU PRODUTOS QUÍMICOS OU QUALQUER OUTRO ITEM QUE POSSA CONTAMINAR O PRODUTO? (PNEUS, OUTROS ALIMENTOS OU PRODUTOS COM ODORES FORTES)",
  "AUSÊNCIA DE VESTÍGIOS DE OUTROS ALIMENTOS NO COMPARTIMENTO ARMAZENADOR DA CARGA.",
  "AUSÊNCIA DE ANIMAIS DOMÉSTICOS, COMO: CACHORRO, GATO, PÁSSARO E OUTROS, NO VEÍCULO.",
  "AUSÊNCIA DE PRAGAS E INSETOS MORTOS E/OU VIVOS.",
  "CARROCERIA SEM PRESENÇA DE IMPERFEIÇÕES QUE POSSAM CAUSAR AVARIAS AO PRODUTO.",
  "ESTADO GERAL DE CONSERVAÇÃO DO VEÍCULO (CABINE, CARROCERIA, ASSOALHO, LONA DO SIDER, BAÚ, PARA BARRO, ETC.)",
  "FARÓIS, LANTERNAS, PISCAS, BUZINA E LIMPADOR DE PÁRA-BRISA",
  "PNEUS (INCLUSIVE ESTEPE)",
  "PÁRA-CHOQUE (CONSERVAÇÃO E FIXAÇÃO)",
  "PÁRA-BRISA, ESPELHOS RETROVISORES, VIDROS LATERAIS",
  "TANQUE DE COMBUSTÍVEL",
  "EQUIPAMENTOS OBRIGATÓRIOS (CINTO, EXTINTOR, MACACO, CHAVE DE RODAS, TRIANGULO, QUEBRA-SOL, ETC.)",
  "FAIXAS REFLETIVAS",
  "VAZAMENTOS (COMBUSTÍVEL / FREIO/ AR/ ETC.)",
  "TACÓGRAFO (EQUIPAMENTO E DISCO",
  "TRAVESSA SIDER",
  "MADERITE",
  "VESTIMENTAS DO MOTORISTA QUANTO Á: UNIFORME, CRACHÁ CALÇADO, ETC.",
  "VEÍCULO ABASTECIDO"
];

const SECURITY_PHRASES = [
  "Segurança é a nossa prioridade número um.",
  "Dirija com cuidado, sua família te espera.",
  "A carga é importante, mas sua vida é essencial.",
  "Cumprir as normas de GR salva vidas.",
  "Atenção total no trânsito, zero acidentes.",
  "Sua integridade física vale mais que qualquer prazo.",
  "O Gerenciamento de Risco é seu maior aliado na estrada."
];

export const AdminDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<DriverData | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'history' | 'idealizador'>('generate');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = contracts.filter(c => c.created_at.startsWith(date)).length;
      const [, month, day] = date.split('-');
      return { date: `${day}/${month}`, count };
    });
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/contracts');
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'dashboard') {
      fetchHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % SECURITY_PHRASES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      // Gera o ID único para o contrato
      const generatedId = Math.random().toString(36).substring(2, 10);
      
      const { error } = await supabase
        .from('Contratos') // Mude para 'Contratos' (com C maiúsculo)
        .insert([{ 
          id: generatedId, 
          dados: { texto: inputText, data: new Date().toISOString() }, // Use 'dados'
          onbase_status: false 
        }]);

      if (error) throw error;

      // 3. GERAR LINK
      const url = `${window.location.origin}/sign/${generatedId}`;
      setGeneratedLink(url);
      setParsedData({ texto: inputText, data: new Date().toISOString() } as any); // Keep this so the UI doesn't break if it relies on parsedData
      alert("Contrato gerado com sucesso!");

    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      alert(`Erro: ${err.message || "Verifique o console"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    try {
      const response = await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setContracts(contracts.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleOnbaseToggle = async (id: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/contracts/${id}/onbase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setContracts(contracts.map(c => 
          c.id === id ? { ...c, onbase_status: newStatus } : c
        ));
      }
    } catch (error) {
      console.error("Failed to update onbase status", error);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateTermContent = (doc: jsPDF, contract: Contract, startY: number, title: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = startY;

    // Header Section with Logo
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    
    // Logo Image
    try {
      doc.addImage(LOGO_3_CORACOES, 'PNG', 19, y + 1.5, 12, 12);
    } catch (e) {
      // Fallback if image fails
      doc.setFillColor(227, 38, 54);
      doc.circle(25, y + 7.5, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.text("3", 24, y + 7, { align: 'center' });
      doc.text("corações", 25, y + 10, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);

    y += 20;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TERMO DE RESPONSABILIDADE GR", pageWidth / 2, y, { align: 'center' });
    y += 8;
    
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    const introText = "Declaro para os devidos fins, que fui contratado(a) pela transportadora, cujos dados seguem abaixo, para efetuar o transporte de carga do embarcador TRÊS CORAÇÕES ALIMENTOS S.A., CAFÉ TRÊS CORAÇÕES S.A.\n\nEstou ciente quanto às normas e procedimentos descritos nos itens a seguir. Confirmo que li e compreendi todas as regras repassadas quanto ao Gerenciamento de Riscos e me comprometo a cumpri-las em sua totalidade.\nComprometo-me a entregar a carga ao destinatário, em iguais condições em que recebi. Além de, no decorrer do percurso, colher carimbo e assinatura em todos os Postos Fiscais.\n\nEstou ciente que, em caso de descumprimento das normas indicadas neste documento, poderei ser responsabilizado civil e criminalmente pelos danos causados à carga em caso de sinistro, estando eu em desacordo com as regras impostas a mim. Dessa forma, fica a critério do embarcador me bloquear ou não para carregamento através da Central de Gerenciamento de Riscos.\n\nTambém estou ciente de que o veículo não pode ser retirado do local de descarga e/ou estacionamento sem autorização da Logística da Filial.";
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, 20, y);
    y += (splitIntro.length * 3.2) + 6;

    // Data Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    // Draw underline for DADOS DA VIAGEM
    doc.text("DADOS DA VIAGEM:", 20, y);
    doc.line(20, y + 1, 52, y + 1);
    y += 5;
    
    doc.setFontSize(7.5);
    const col1 = 20;
    const col2 = 95;
    const col3 = 145;

    doc.setFont("helvetica", "bold");
    doc.text("Data:", col1, y);
    doc.setFont("helvetica", "bold");
    doc.text(new Date(contract.created_at).toLocaleDateString('pt-BR'), col1 + 10, y);

    doc.setFont("helvetica", "bold");
    doc.text("CPF:", col2, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.cpf || '-', col2 + 10, y);

    doc.setFont("helvetica", "bold");
    doc.text("Transportadora:", col3, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(contract.data.transportador || '-').substring(0, 25), col3 + 25, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Motorista:", col1, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(contract.data.motorista || '-').substring(0, 38), col1 + 16, y);

    doc.setFont("helvetica", "bold");
    doc.text("Vínculo:", col2, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.vinculo || '-', col2 + 14, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Placa Cavalo:", col1, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.cavalo || '-', col1 + 22, y);

    doc.setFont("helvetica", "bold");
    doc.text("Carreta I:", col2, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.carreta || '-', col2 + 16, y);

    doc.setFont("helvetica", "bold");
    doc.text("Carreta II:", col3, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.carreta2 || '-', col3 + 16, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Trajeto:", col1, y);
    doc.setFont("helvetica", "bold");
    const origem = contract.data.origem || 'SANTA LUZIA|MG';
    const destino = contract.data.destino || 'GOV. CELSO RAMOS';
    
    doc.text(origem, col1 + 13, y);
    const origemWidth = doc.getTextWidth(origem);
    
    doc.setDrawColor(0);
    doc.rect(col1 + 15 + origemWidth, y - 3.5, 4, 4);
    doc.setFont("helvetica", "bold");
    doc.text("X", col1 + 16 + origemWidth, y - 0.5);
    
    doc.setFont("helvetica", "bold");
    doc.text(destino, col1 + 21 + origemWidth, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Tecnologia:", col1, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.tecnologia || '-', col1 + 18, y);

    // Rules Section
    y += 8;    // Check if y is too close to bottom, add page if needed
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const rulesText = `Ao informar início de viagem, deverá aguardar a mensagem **“Ok, Liberado”** que será enviada pela Central de Monitoramento 3corações, autorizando o prosseguimento da viagem;
Informar todas as paradas e reinícios durante a viagem;
Ao chegar no local de descarga, enviar macro **“CHEGADA NO CLIENTE”**, e enviando a macro de **“FIM DE VIAGEM”**, somente quando a descarga for finalizada;
**É proibido parar antes dos 150 km iniciais**, exceto paradas obrigatórias ou problema mecânico/elétrico;
**É proibido pernoite em residência;**
Respeitar o horário de rodagem, no período de **05h00min às 22h00min**;
O veículo será desbloqueado após o pernoite, somente mediante confirmação de senha de segurança do motorista, via teclado;
Evitar pernoite sob cobertura, evitando perda de sinal da antena;
**Não conceder carona;**
Seguir o trajeto predeterminado;
Respeitar o limite de velocidade da via, não excedendo o limite de **80km/h**;
Manter a central informada de todas as anormalidades durante o percurso, mantendo a comunicação, via macro, como também pelos telefones: **Fixo (85) 4006.5522 (escolher a opção desejada); WhatsApp (85) 99198.2886 (apenas mensagem e áudio);**
Dirigir preventivamente, evitando acidentes, preservando sua própria vida, a vida de terceiros e também carga do embarcador;
Não oferecer, dar ou aceitar de quem quer que seja, tanto por conta própria ou através de terceiro, qualquer pagamento, doação, compensação, vantagens ou benefícios de qualquer natureza que constituam prática ilegal ou prática de corrupção sob as leis de qualquer país;
**(Proibido passagem por Sergipe);**
Destino Rio de Janeiro: Agendar escolta com 2 horas de antecedência do ponto de encontro, no pedágio desativado em Duque de Caxias/RJ, evitar rodar depois das 17 horas dentro da área urbana da cidade. Caso necessário, o pernoite acontecerá mais cedo na cidade de Três Rios/RJ (Posto Ipirangão);
Pernoite na BR-381 Rod. Fernão Dias, somente autorizado nos postos Rede Graal e Frango Assado;

**Caso tenha dúvidas, contate nossa central de monitoramento pelos telefones acima informados.**`;

    const renderRichText = (doc: jsPDF, text: string, startX: number, startY: number, maxWidth: number, lineHeight: number) => {
      let currentX = startX;
      let currentY = startY;
      
      const lines = text.split('\n');
      
      lines.forEach((line) => {
        if (line === '') {
          currentY += lineHeight;
          currentX = startX;
          return;
        }

        const parts = line.split(/(\*\*.*?\*\*)/g);
        
        for (const part of parts) {
          if (!part) continue;
          
          const isBold = part.startsWith('**') && part.endsWith('**');
          const content = isBold ? part.slice(2, -2) : part;
          
          doc.setFont("helvetica", isBold ? "bold" : "normal");
          
          const words = content.split(/(\s+)/);
          for (const word of words) {
            if (!word) continue;
            
            const wordWidth = doc.getTextWidth(word);
            
            if (word.trim() === '' && currentX === startX) {
              continue;
            }
            
            if (currentX + wordWidth > startX + maxWidth && word.trim() !== '') {
              currentX = startX;
              currentY += lineHeight;
            }
            
            doc.text(word, currentX, currentY);
            currentX += wordWidth;
          }
        }
        
        currentX = startX;
        currentY += lineHeight;
      });
      
      return currentY;
    };

    y = renderRichText(doc, rulesText, 20, y, 170, 3.2);
    doc.setFont("helvetica", "normal");

    // Footer & Signature
    y += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    // Check if y is too close to bottom, add page if needed
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    const currentDateStr = contract.signed_at 
      ? new Date(contract.signed_at).toLocaleString('pt-BR') 
      : new Date().toLocaleString('pt-BR');
    
    doc.text(`Santa Luzia, ${currentDateStr}`, pageWidth / 2, y, { align: 'center' });
    
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(contract.data.rg || '-', pageWidth / 2, y - 1, { align: 'center' });
    doc.line(60, y, 150, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("(RG do motorista)", pageWidth / 2, y, { align: 'center' });
    
    y += 15;
    if (contract.signature) {
      try {
        // Compact and centered signature
        doc.addImage(contract.signature, 'PNG', pageWidth / 2 - 20, y - 10.5, 40, 10);
      } catch (e) {
        console.error("Failed to add signature to PDF", e);
      }
    }
    doc.line(60, y, 150, y);
    y += 4;
    doc.text("(Assinatura do Motorista)", pageWidth / 2, y, { align: 'center' });
    
    y += 10;
    
    return y + 10;
  };

  const generateChecklistContent = (doc: jsPDF, contract: Contract) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header Table
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.setFillColor(224, 224, 224);

    // Outer border
    doc.rect(10, y, 190, 16);
    // Vertical lines
    doc.line(40, y, 40, y + 16);
    doc.line(140, y, 140, y + 16);
    // Horizontal line in middle and right cols
    doc.line(40, y + 8, 200, y + 8);

    // Fill middle column
    doc.rect(40, y, 100, 8, 'F');
    doc.rect(40, y + 8, 100, 8, 'F');
    // Re-draw lines over fill
    doc.rect(10, y, 190, 16);
    doc.line(40, y, 40, y + 16);
    doc.line(140, y, 140, y + 16);
    doc.line(40, y + 8, 200, y + 8);

    // Logo
    try {
      // Box is x=10 to 40 (width 30), y=y to y+16 (height 16)
      doc.addImage(LOGO_3_CORACOES, 'PNG', 15, y + 1, 20, 14);
    } catch (e) {
      doc.setFillColor(227, 38, 54);
      doc.circle(25, y + 8, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(4);
      doc.setFont("helvetica", "bold");
      doc.text("3", 24, y + 7.5, { align: 'center' });
      doc.text("corações", 25, y + 10.5, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      doc.text("3 Corações", 25, y + 14, { align: 'center' });
    }

    // Middle texts
    doc.setFontSize(9);
    doc.text("CHECK-LIST PRESENCIAL VEICULAR", 105, y + 5.5, { align: 'center' });
    doc.text("GERENCIAMENTO DE RISCOS E SEGUROS", 105, y + 13.5, { align: 'center' });

    // Right texts
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("IMPLANTAÇÃO:", 142, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.text("23/09/2015", 170, y + 5.5);

    doc.setFont("helvetica", "bold");
    doc.text("ATUALIZAÇÃO:", 142, y + 11.5);
    doc.setFont("helvetica", "normal");
    doc.text("01/01/2025", 170, y + 11.5);

    doc.setFont("helvetica", "bold");
    doc.text("VERSÃO 8.1", 142, y + 14.5);
    doc.setFont("helvetica", "normal");
    doc.text("STL", 195, y + 14.5, { align: 'right' });
    y += 16;

    // Section 1: DADOS DO MOTORISTA
    doc.setFillColor(183, 183, 183); // Darker gray header
    doc.rect(10, y, 190, 6, 'FD');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO MOTORISTA", 105, y + 4.5, { align: 'center' });
    y += 6;

    doc.rect(10, y, 190, 6);
    doc.text("MOTORISTA:", 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.motorista || '-', 35, y + 4.5);
    y += 6;

    doc.rect(10, y, 190, 6);
    doc.line(70, y, 70, y + 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text("CPF:", 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.cpf || '-', 22, y + 4.5);
    doc.setFont("helvetica", "bold");
    doc.text("RG:", 72, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.rg || '-', 80, y + 4.5);
    doc.setFont("helvetica", "bold");
    doc.text("CNH:", 132, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.cnh || '-', 142, y + 4.5);
    y += 6;

    doc.rect(10, y, 190, 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text("VÍNCULO:", 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.vinculo || '-', 30, y + 4.5);
    y += 6;

    // Section 2: DADOS DO VEÍCULO
    doc.setFillColor(183, 183, 183); // Darker gray header
    doc.rect(10, y, 190, 6, 'FD');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO VEÍCULO", 105, y + 4.5, { align: 'center' });
    y += 6;

    // Transportadora Row
    doc.rect(10, y, 190, 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text("Transportadora:", 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.transportador || '-', 35, y + 4.5);
    doc.setFont("helvetica", "bold");
    doc.text("UF DAS PLACAS :", 132, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.uf_placas || '-', 160, y + 4.5);
    y += 6;

    // Placa Cavalo Row
    doc.rect(10, y, 190, 6);
    doc.line(100, y, 100, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text("Placa do Cavalo", 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.cavalo || '-', 105, y + 4.5);
    y += 6;

    // Placa Carreta 1 Row
    doc.rect(10, y, 190, 6);
    doc.line(100, y, 100, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text("Placa Carreta 1", 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.carreta || '-', 105, y + 4.5);
    y += 6;

    // Placa Carreta 2 Row
    doc.rect(10, y, 190, 6);
    doc.line(100, y, 100, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text("Placa Carreta 2", 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.carreta2 || '-', 105, y + 4.5);
    y += 6;

    // Vehicle Details Row
    doc.rect(10, y, 190, 6);
    doc.line(75, y, 75, y + 6);
    doc.line(135, y, 135, y + 6);
    
    doc.setFont("helvetica", "bold");
    doc.text("Tipo de Carreta:", 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(String(contract.data.modelo_carreta || contract.data.tipo_carreta || '-').substring(0, 22), 35, y + 4.5);
    
    doc.setFont("helvetica", "bold");
    doc.text("Tipo de cavalo:", 77, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(String(contract.data.modelo_cavalo || contract.data.tipo_cavalo || '-').substring(0, 22), 100, y + 4.5);

    doc.setFont("helvetica", "bold");
    doc.text("Tecnologia do veículo:", 137, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(String(contract.data.tecnologia || '-').substring(0, 22), 168, y + 4.5);
    y += 6;

    // Section 3: ITENS A SEREM VISTORIADOS
    doc.setFillColor(183, 183, 183); // Darker gray header
    doc.rect(10, y, 190, 6, 'FD');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("ITENS A SEREM VISTORIADOS - SEGURANÇA PATRIMONIAL", 105, y + 4.5, { align: 'center' });
    y += 6;

    // Table Header
    doc.setFillColor(183, 183, 183);
    doc.rect(10, y, 190, 6, 'FD');
    doc.line(20, y, 20, y + 6);
    doc.line(130, y, 130, y + 6);
    doc.line(145, y, 145, y + 6);
    doc.line(160, y, 160, y + 6);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("ITEM", 15, y + 4.5, { align: 'center' });
    doc.text("DESCRIÇÃO", 75, y + 4.5, { align: 'center' });
    doc.text("CONF", 137.5, y + 4.5, { align: 'center' });
    doc.text("ÑCON", 152.5, y + 4.5, { align: 'center' });
    doc.text("OBSERVAÇÕES", 175, y + 4.5, { align: 'center' });
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    
    CHECKLIST_ITEMS.forEach((item, idx) => {
      const itemNum = (idx + 1).toString().padStart(2, '0');
      const splitText = doc.splitTextToSize(item, 106);
      const rowHeight = Math.max(splitText.length * 3 + 2, 6);
      
      if (y + rowHeight > 280) {
        doc.addPage();
        y = 15;
      }

      doc.rect(10, y, 190, rowHeight);
      doc.line(20, y, 20, y + rowHeight);
      doc.line(130, y, 130, y + rowHeight);
      doc.line(145, y, 145, y + rowHeight);
      doc.line(160, y, 160, y + rowHeight);
      
      doc.text(itemNum, 15, y + (rowHeight/2) + 1, { align: 'center' });
      doc.text(splitText, 22, y + 4);
      
      // Checkboxes
      doc.setFontSize(8);
      doc.text("[X]", 137.5, y + (rowHeight/2) + 1.5, { align: 'center' });
      doc.text("[  ]", 152.5, y + (rowHeight/2) + 1.5, { align: 'center' });
      doc.setFontSize(6);
      
      // Special observations for items 17 and 18
      if (idx === 16 || idx === 17) {
        doc.setFontSize(5);
        doc.text("ok, não se aplica a baú ou câmara fria", 162, y + (rowHeight/2) + 1);
        doc.setFontSize(6);
      }
      
      y += rowHeight;
    });

    // Bottom Checkboxes
    if (y + 25 > 280) {
      doc.addPage();
      y = 15;
    }

    doc.rect(10, y, 190, 18);
    doc.line(70, y, 70, y + 18);
    doc.line(130, y, 130, y + 18);
    doc.line(10, y + 6, 200, y + 6);
    doc.line(10, y + 12, 200, y + 12);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("[X] POSICIONAMENTO", 12, y + 4.5);
    doc.text("[X] TRAVA DE BAÚ", 72, y + 4.5);
    doc.text("[X] SENSORES PORTA MOTORISTA", 132, y + 4.5);
    
    doc.text("[X] CABO DE ENGATE", 12, y + 10.5);
    doc.text("[X] SIRENE", 72, y + 10.5);
    doc.text("[X] SENSORES PORTA CARONA", 132, y + 10.5);
    
    doc.text("[X] SISTEMA DE BLOQUEIO", 12, y + 16.5);
    doc.text("[X] TECLADO", 72, y + 16.5);
    doc.text("[X] SENSORES DE BAÚ", 132, y + 16.5);
    y += 18;

    // Approval Row
    doc.setFillColor(204, 204, 204);
    doc.rect(10, y, 190, 6);
    doc.rect(10, y, 40, 6, 'F'); // Fill Veiculo Aprovado
    doc.rect(110, y, 20, 6, 'F'); // Fill OBS
    
    doc.line(50, y, 50, y + 6);
    doc.line(80, y, 80, y + 6);
    doc.line(110, y, 110, y + 6);
    doc.line(130, y, 130, y + 6);
    
    doc.setFont("helvetica", "bold");
    doc.text("Veiculo Aprovado", 30, y + 4.5, { align: 'center' });
    doc.text("[X] SIM", 55, y + 4.5);
    doc.text("[ ] NÃO", 85, y + 4.5);
    doc.text("OBS:", 120, y + 4.5, { align: 'center' });
    
    doc.setTextColor(255, 0, 0); // Red text for date
    doc.setFontSize(6);
    doc.text(new Date(contract.signed_at || contract.created_at).toLocaleString('pt-BR'), 160, y + 4.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 6;

    // Date Row
    doc.rect(10, y, 190, 6);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bolditalic");
    doc.text(new Date(contract.created_at).toLocaleDateString('pt-BR'), 105, y + 4.5, { align: 'center' });
    y += 6;

    // Footer & Signature
    doc.rect(10, y, 190, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ASSINATURA DO MOTORISTA:", 15, y + 12);
    
    if (contract.signature) {
      try {
        // Compact and centered signature
        doc.addImage(contract.signature, 'PNG', 100, y + 2, 45, 15);
      } catch (e) {
        console.error("Failed to add signature to PDF", e);
      }
    }
  };

  const generatePlanoDeTrajetoContent = (doc: jsPDF, contract: Contract) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header Section
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(10, y, 190, 15);
    
    // Logo Image
    try {
      doc.addImage(LOGO_3_CORACOES, 'PNG', 19, y + 1.5, 12, 12);
    } catch (e) {
      doc.setFillColor(227, 38, 54);
      doc.circle(25, y + 7.5, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.text("3", 24, y + 7, { align: 'center' });
      doc.text("corações", 25, y + 10, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PLANO DE ROTA GERENCIAMENTO DE RISCOS - GR", pageWidth / 2 + 10, y + 8, { align: 'center' });
    y += 20;

    // Orientations
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Orientações sobre o PLANO DE ROTA", 10, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("a. É proibida parada nos primeiros 150 km iniciais, exceto problema mecânico/elétrico;", 10, y);
    y += 3.5;
    doc.text("b. Respeitar o horário de rodagem, no período de 05h00min às 22h00min para produto acabado e 05h00min às 19h00min para o transporte de grãos;", 10, y);
    y += 3.5;
    doc.text("c. Qualquer desvio de trajeto sem prévia autorização é uma falta grave, e poderá ser levada em consideração para futuros carregamentos com a carga da 3corações.", 10, y);
    y += 8;

    // Route Title
    const origem = contract.data.origem || 'Santa Luzia/MG';
    const destino = contract.data.destino || 'Gov. Celso Ramos/SC';
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(10, y, 190, 6, 'F');
    doc.rect(10, y, 190, 6);
    doc.text(`Plano de Rota (${origem} x ${destino})`, pageWidth / 2, y + 4.5, { align: 'center' });
    y += 6;

    // Map Placeholder & Itinerary Table
    doc.rect(10, y, 130, 80);
    doc.setFontSize(10);
    doc.text("MAPA DE TRAJETO", 75, y + 40, { align: 'center' });
    doc.setFontSize(7);
    doc.text("(Visualização do mapa indisponível)", 75, y + 45, { align: 'center' });

    // Itinerary Table (Right side)
    doc.rect(140, y, 60, 80);
    doc.setFillColor(240, 240, 240);
    doc.rect(140, y, 60, 6, 'F');
    doc.rect(140, y, 60, 6);
    doc.setFont("helvetica", "bold");
    doc.text("Cidades do Itinerário :", 170, y + 4.5, { align: 'center' });
    
    const itinerary = [
      `» ${origem}`,
      "» Carmópolis de Minas/MG",
      "» Pouso Alegre/MG",
      "» Bragança Paulista/SP",
      "» Jarinu/SP",
      "» Juquitiba/SP",
      "» São José dos Pinhais/PR",
      "» Joinville/SC",
      `» ${destino}`
    ];

    doc.setFont("helvetica", "normal");
    let itY = y + 10;
    itinerary.forEach(city => {
      doc.text(city, 142, itY);
      doc.line(140, itY + 1, 200, itY + 1);
      itY += 4.5;
    });
    y += 85;

    // Forbidden Stops Table
    doc.setFillColor(240, 240, 240);
    doc.rect(10, y, 190, 6, 'F');
    doc.rect(10, y, 190, 6);
    doc.setFont("helvetica", "bold");
    doc.text("PARADAS PROIBIDAS", pageWidth / 2, y + 4.5, { align: 'center' });
    y += 6;

    const forbiddenStops = [
      ["Cambuí/MG", "Campanha/MG", "Embu das Artes-SP"],
      ["Itatiaiuçu-MG", "Carmópolis de Minas-MG", "Guarulhos-SP (exceto P. Sakamoto)"],
      ["Itaquara-MG", "Igarapé-MG", "Itapecerica da Serra-SP"],
      ["Extrema-MG", "Itapeva-MG", "Miracatu-SP"],
      ["Pouso Alegre-MG", "Varginha-MG", ""]
    ];

    forbiddenStops.forEach(row => {
      doc.rect(10, y, 63.3, 6);
      doc.rect(73.3, y, 63.3, 6);
      doc.rect(136.6, y, 63.3, 6);
      doc.setFont("helvetica", "normal");
      doc.text(row[0], 12, y + 4.5);
      doc.text(row[1], 75.3, y + 4.5);
      doc.text(row[2], 138.6, y + 4.5);
      y += 6;
    });

    // Footer Warning
    doc.setFont("helvetica", "bold");
    doc.text("Proibido Parada entre as cidades de Joinville/SC até Palhoça/SC", pageWidth / 2, y + 6, { align: 'center' });
    doc.line(60, y + 7, 150, y + 7);
    y += 12;

    // Bottom Data Table
    doc.setFillColor(240, 240, 240);
    doc.rect(10, y, 190, 6, 'F');
    doc.rect(10, y, 190, 6);
    doc.text("DADOS DA VIAGEM", pageWidth / 2, y + 4.5, { align: 'center' });
    y += 6;

    doc.setFontSize(7);
    doc.rect(10, y, 30, 6); doc.text("Data:", 12, y + 4.5); doc.text(new Date(contract.created_at).toLocaleDateString('pt-BR'), 22, y + 4.5);
    doc.rect(40, y, 40, 6); doc.text("CPF:", 42, y + 4.5); doc.text(contract.data.cpf || '-', 50, y + 4.5);
    doc.rect(80, y, 40, 6); doc.text("Nome:", 82, y + 4.5); doc.setFontSize(6); doc.text(String(contract.data.motorista || '-').substring(0, 22), 92, y + 4.5); doc.setFontSize(7);
    doc.rect(120, y, 40, 6); doc.text("Carreta 1:", 122, y + 4.5); doc.text(contract.data.carreta || '-', 135, y + 4.5);
    doc.rect(160, y, 40, 6); doc.text("Carreta 2:", 162, y + 4.5); doc.text(contract.data.carreta2 || '-', 175, y + 4.5);
    y += 6;

    doc.rect(10, y, 50, 6); doc.text("Transp:", 12, y + 4.5); doc.setFontSize(6); doc.text(String(contract.data.transportador || '-').substring(0, 25), 22, y + 4.5); doc.setFontSize(7);
    doc.rect(60, y, 30, 6); doc.text("Cavalo:", 62, y + 4.5); doc.text(contract.data.cavalo || '-', 72, y + 4.5);
    doc.rect(90, y, 30, 6); doc.text("Destino:", 92, y + 4.5); doc.setFontSize(6); doc.text(String(destino).substring(0, 18), 102, y + 4.5); doc.setFontSize(7);
    doc.rect(120, y, 80, 12); 
    doc.text("Assinatura:", 122, y + 4);
    
    if (contract.signature) {
      try {
        doc.addImage(contract.signature, 'PNG', 135, y + 1, 50, 10);
      } catch (e) {
        console.error("Failed to add signature to Plano de Rota", e);
      }
    }
  };

  const downloadPDF = async (contract: Contract) => {
    const doc = new jsPDF();
    
    const transportadora = (contract.data.transportador || '').toUpperCase();
    
    const checklistOnlyTransportadoras = [
      'TOMASI',
      'TRANSMAGNA',
      'GOBOR',
      'APK',
      'GT MINAS',
      'UNITRADING LOG',
      'MODERN LOGISTICS',
      'RGS TRANSPORTES',
      'JRL TRANSPORTES',
      'JRL TRANSPORTES.'
    ];

    const allThreeTransportadoras = [
      'SRH SARAIVA',
      'MOEDENSE',
      'RNCGG',
      'FASI',
      'TRANSPORTES VIVAN',
      'COMBOIO',
      'LEDIFRAN',
      'TORNADO'
    ];

    const isChecklistOnly = checklistOnlyTransportadoras.some(t => transportadora.includes(t));
    const isAllThree = allThreeTransportadoras.some(t => transportadora.includes(t));

    if (isChecklistOnly && !isAllThree) {
      // Only Checklist
      generateChecklistContent(doc, contract);
    } else {
      // All three documents (default behavior or explicitly requested)
      // Page 1: Termo de Responsabilidade (Via Única)
      generateTermContent(doc, contract, 15, "VIA ÚNICA / ARQUIVO");

      // Page 2: Plano de Rota
      doc.addPage();
      generatePlanoDeTrajetoContent(doc, contract);

      // Page 3: Checklist
      doc.addPage();
      generateChecklistContent(doc, contract);
    }

    doc.save(`documentos_gr_${contract.data.motorista || contract.id}.pdf`);
  };

  const stats = [
    { name: 'Assinados', value: contracts.filter(c => c.signature).length, color: '#10b981' },
    { name: 'Pendentes', value: contracts.filter(c => !c.signature).length, color: '#f59e0b' },
  ];

  const filteredContracts = contracts.filter(c => 
    c.data.motorista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.data.cpf?.includes(searchTerm) ||
    c.data.cavalo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.data.carreta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500/30">
      {/* Modern Sidebar/Nav Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-white p-6 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 to-slate-900/90 z-0"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden border border-indigo-400/30">
                <img src={LOGO_3_CORACOES} alt="3 Corações" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AssinaGR</h1>
                <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">Assinatura Digital</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              <button 
                onClick={() => setActiveTab('generate')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Clipboard className="w-5 h-5" />
                Importar Dados
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <History className="w-5 h-5" />
                Histórico de Termos
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Painel de Controle
              </button>
              <button 
                onClick={() => setActiveTab('idealizador')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'idealizador' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Info className="w-5 h-5" />
                Idealizador
              </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase text-slate-300">Dica de Segurança</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={currentPhraseIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-xs text-slate-400 italic leading-relaxed"
                  >
                    "{SECURITY_PHRASES[currentPhraseIndex]}"
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 lg:p-8 overflow-y-auto bg-slate-50/50 relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
            <div>
              <h2 className="text-xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {activeTab === 'dashboard' ? 'Painel de Controle' : activeTab === 'generate' ? 'Importar Dados' : activeTab === 'idealizador' ? 'Idealizador' : 'Histórico de Termos'}
              </h2>
              <p className="text-slate-500 text-xs lg:text-sm mt-1">
                {activeTab === 'dashboard' ? 'Visão geral das assinaturas e operações.' : activeTab === 'generate' ? 'Processe os dados da planilha para criar um link de assinatura.' : activeTab === 'idealizador' ? 'Sobre a criação do aplicativo e nossa visão.' : 'Acompanhe e gerencie todos os termos emitidos.'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {contracts.slice(0, 3).map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {c.data.motorista?.[0] || 'M'}
                  </div>
                ))}
                {contracts.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">
                    +{contracts.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-slate-400">Motoristas ativos</span>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Total de Termos</p>
                      <p className="text-2xl font-bold text-slate-900">{contracts.length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Assinados</p>
                      <p className="text-2xl font-bold text-slate-900">{contracts.filter(c => c.signature).length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Pendentes</p>
                      <p className="text-2xl font-bold text-slate-900">{contracts.filter(c => !c.signature).length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">No OnBase</p>
                      <p className="text-2xl font-bold text-slate-900">{contracts.filter(c => c.onbase_status).length}</p>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Termos Gerados (Últimos 7 dias)</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Status das Assinaturas</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Assinados', value: contracts.filter(c => c.signature).length, color: '#10b981' },
                              { name: 'Pendentes', value: contracts.filter(c => !c.signature).length, color: '#f59e0b' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {
                              [
                                { name: 'Assinados', value: contracts.filter(c => c.signature).length, color: '#10b981' },
                                { name: 'Pendentes', value: contracts.filter(c => !c.signature).length, color: '#f59e0b' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))
                            }
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'generate' ? (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-8"
              >
                {/* Input Section */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Clipboard className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="font-bold text-slate-800">Importar Dados</h3>
                    </div>
                    
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Cole aqui a linha copiada da planilha (Motorista, CPF, Placa, Trajeto...)"
                      className="w-full h-32 lg:h-40 p-3 lg:p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none mb-4"
                    />
                    
                    <button
                      onClick={handleProcess}
                      disabled={loading || !inputText.trim()}
                      className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <Truck className="w-5 h-5" />
                          Processar e Gerar Link
                        </>
                      )}
                    </button>
                  </div>

                  {parsedData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h3 className="font-bold text-slate-800">Dados Extraídos</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Motorista</span>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-700">{parsedData.motorista || '-'}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF</span>
                          <p className="text-sm font-semibold text-slate-700">{parsedData.cpf || '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placa</span>
                          <div className="flex items-center gap-2">
                            <Truck className="w-3 h-3 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-700">{parsedData.cavalo || '-'}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transportadora</span>
                          <p className="text-sm font-semibold text-slate-700 truncate">{parsedData.transportador || '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trajeto</span>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-700 truncate">{parsedData.trajeto || parsedData.destino || '-'}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tecnologia</span>
                          <p className="text-sm font-semibold text-slate-700">{parsedData.tecnologia || '-'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {generatedLink && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <LinkIcon size={20} className="text-orange-500" /> Link de Assinatura
                    </h3>

                    <div className="flex items-center w-full border rounded p-2 bg-gray-50 mb-4">
                      <input 
                        className="bg-transparent flex-1 outline-none text-sm text-gray-500" 
                        value={generatedLink} 
                        readOnly 
                      />
                      <button onClick={copyToClipboard} className="p-1 hover:bg-gray-200 rounded">
                        {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <div className="flex justify-center p-4 bg-white border rounded-xl">
                      {/* Aqui usamos o componente que você já importou */}
                      <QRCodeSVG value={generatedLink} size={150} />
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-2 italic">Link pronto para envio.</p>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'idealizador' ? (
              <motion.div
                key="idealizador"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Hero Section */}
                  <div className="lg:col-span-12 bg-slate-900 rounded-3xl p-8 lg:p-12 relative overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
                          <ShieldCheck className="w-4 h-4" />
                          Inovação em Logística
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
                          A Revolução na <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Gestão de Riscos</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                          Nossa visão foi criar uma plataforma 100% digital, intuitiva e à prova de fraudes. Eliminando a burocracia e elevando o padrão de segurança da nossa logística.
                        </p>
                      </div>
                      <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl shrink-0 p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <img src={LOGO_3_CORACOES} alt="3 Corações" className="w-full h-full object-contain filter drop-shadow-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Content Bento Grid */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Info className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Nossa Missão</h3>
                    </div>
                    <div className="space-y-6 text-slate-600 leading-relaxed">
                      <p>
                        O <strong>AssinaGR</strong> nasceu da necessidade de transformar a maneira como lidamos com a segurança e a conformidade no transporte de cargas. Em um cenário logístico cada vez mais dinâmico e exigente, percebemos que os processos tradicionais em papel não apenas atrasavam as operações, mas também abriam margem para falhas de segurança e perda de informações críticas.
                      </p>
                      <p>
                        Com a implementação da assinatura digital criptografada e a geração automatizada de Termos de Responsabilidade e Planos de Trajeto, o AssinaGR garante que todas as normas de Gerenciamento de Risco sejam rigorosamente documentadas e arquivadas.
                      </p>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-indigo-500">
                        <p className="text-slate-700 font-medium italic">
                          "Isso não é apenas uma melhoria de processo; é uma mudança de paradigma. Estamos protegendo nossos colaboradores, nossas cargas e garantindo a excelência que a marca 3 Corações representa."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Credits Sidebar */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700 shadow-lg text-white flex-1 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <User className="w-32 h-32" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Criador e Idealizador</p>
                          <h3 className="text-2xl font-bold text-white mb-2">Jefferson Augusto</h3>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-start justify-end mt-8">
                          <div className="w-px h-16 bg-gradient-to-b from-indigo-500/50 to-transparent mb-4 ml-3"></div>
                          <div className="p-2 rounded-full bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm shadow-inner">
                            <Coffee className="w-5 h-5 text-amber-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <History className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data de Lançamento</p>
                          <p className="font-bold text-slate-700">13 de Março, 2026</p>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-indigo-50 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total de Termos', value: contracts.length, icon: FileText, color: 'indigo' },
                    { label: 'Assinados', value: contracts.filter(c => c.signature).length, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Pendentes', value: contracts.filter(c => !c.signature).length, icon: Clock, color: 'amber' },
                    { label: 'Taxa de Sucesso', value: `${contracts.length ? Math.round((contracts.filter(c => c.signature).length / contracts.length) * 100) : 0}%`, icon: ShieldCheck, color: 'indigo' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                      <div className={`p-3 bg-${stat.color}-50 rounded-xl`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Search className="w-5 h-5 text-slate-500" />
                      </div>
                      <h3 className="font-bold text-slate-800">Filtrar Registros</h3>
                    </div>
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Buscar por Motorista, Placa ou CPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <th className="px-6 py-4">Motorista / ID</th>
                            <th className="px-6 py-4">CPF / Placa</th>
                            <th className="px-6 py-4">Data de Emissão</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {historyLoading ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-200" />
                              </td>
                            </tr>
                          ) : filteredContracts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                Nenhum registro encontrado para sua busca.
                              </td>
                            </tr>
                          ) : (
                            filteredContracts.map((contract) => (
                              <React.Fragment key={contract.id}>
                                <tr className="group hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === contract.id ? null : contract.id)}>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {contract.data.motorista?.[0] || 'M'}
                                      </div>
                                      <div>
                                        <div className="font-bold text-sm text-slate-700">{contract.data.motorista || 'N/A'}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{contract.id}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-600">{contract.data.cpf || '-'}</div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Truck className="w-3 h-3" />
                                      {contract.data.cavalo || '-'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <Calendar className="w-4 h-4 text-slate-300" />
                                      {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {contract.signature ? (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Assinado
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase">
                                        <Clock className="w-3 h-3" />
                                        Pendente
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                      <button 
                                        onClick={() => {
                                          const link = `${window.location.origin}/sign/${contract.id}`;
                                          navigator.clipboard.writeText(link);
                                          alert("Link copiado!");
                                        }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        title="Copiar Link"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => downloadPDF(contract)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        title="Baixar PDF Duplo"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(contract.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Excluir Registro"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setExpandedRow(expandedRow === contract.id ? null : contract.id)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                      >
                                        {expandedRow === contract.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {expandedRow === contract.id && (
                                  <tr className="bg-slate-50 border-b border-slate-100">
                                    <td colSpan={5} className="px-6 py-6">
                                      <div className="flex flex-col md:flex-row gap-8">
                                        {/* Link & QR Code Section */}
                                        <div className="flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" />
                                            Acesso do Motorista
                                          </h4>
                                          <div className="flex flex-col sm:flex-row items-center gap-6">
                                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                              <QRCodeSVG value={`${window.location.origin}/sign/${contract.id}`} size={100} level="H" />
                                            </div>
                                            <div className="flex-1 w-full">
                                              <p className="text-xs text-slate-500 mb-2">Link direto para assinatura:</p>
                                              <div className="flex items-center gap-2">
                                                <input 
                                                  type="text" 
                                                  readOnly 
                                                  value={`${window.location.origin}/sign/${contract.id}`}
                                                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
                                                />
                                                <button 
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/sign/${contract.id}`);
                                                    alert("Link copiado!");
                                                  }}
                                                  className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                                >
                                                  <Copy className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Onbase Toggle Section */}
                                        <div className="flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Clipboard className="w-4 h-4" />
                                            Controle Interno
                                          </h4>
                                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                              <p className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-1">Baixa no Onbase?</p>
                                              <p className="text-[10px] text-slate-500">O documento foi processado no sistema?</p>
                                            </div>
                                            <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                              <button
                                                onClick={() => handleOnbaseToggle(contract.id, false)}
                                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${!contract.onbase_status ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                                              >
                                                NÃO
                                              </button>
                                              <button
                                                onClick={() => handleOnbaseToggle(contract.id, true)}
                                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${contract.onbase_status ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                                              >
                                                SIM
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden flex flex-col gap-4">
                      {historyLoading ? (
                        <div className="py-12 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-200" />
                        </div>
                      ) : filteredContracts.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 italic text-sm">
                          Nenhum registro encontrado para sua busca.
                        </div>
                      ) : (
                        filteredContracts.map((contract) => (
                          <div key={contract.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div 
                              className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => setExpandedRow(expandedRow === contract.id ? null : contract.id)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px] shrink-0">
                                    {contract.data.motorista?.[0] || 'M'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-slate-700 truncate">{contract.data.motorista || 'N/A'}</div>
                                    <div className="text-[9px] text-slate-400 font-mono truncate">{contract.id}</div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {contract.signature ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-bold uppercase">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      Assinado
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] font-bold uppercase">
                                      <Clock className="w-2.5 h-2.5" />
                                      Pendente
                                    </span>
                                  )}
                                  {contract.onbase_status && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-bold uppercase">
                                      Onbase OK
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">CPF</div>
                                  <div className="text-[10px] font-medium text-slate-600 truncate">{contract.data.cpf || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">Placa</div>
                                  <div className="text-[10px] font-medium text-slate-600 truncate flex items-center gap-1">
                                    <Truck className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{contract.data.cavalo || '-'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="flex items-center gap-0.5 text-indigo-600 font-medium">
                                  {expandedRow === contract.id ? 'Menos' : 'Mais'}
                                  {expandedRow === contract.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Expanded Content */}
                            {expandedRow === contract.id && (
                              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const link = `${window.location.origin}/sign/${contract.id}`;
                                      navigator.clipboard.writeText(link);
                                      alert("Link copiado!");
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copiar
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadPDF(contract);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100"
                                  >
                                    <Download className="w-4 h-4" />
                                    PDF
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(contract.id);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                  </button>
                                </div>

                                {/* Link & QR Code Section */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    Acesso do Motorista
                                  </h4>
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                      <QRCodeSVG value={`${window.location.origin}/sign/${contract.id}`} size={120} level="H" />
                                    </div>
                                    <div className="w-full">
                                      <p className="text-[10px] text-slate-500 mb-1.5">Link direto:</p>
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="text" 
                                          readOnly 
                                          value={`${window.location.origin}/sign/${contract.id}`}
                                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Onbase Toggle Section */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clipboard className="w-4 h-4" />
                                    Controle Interno
                                  </h4>
                                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                      <p className="font-bold text-[10px] text-slate-700 uppercase tracking-wider">Baixa no Onbase?</p>
                                    </div>
                                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOnbaseToggle(contract.id, false);
                                        }}
                                        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${!contract.onbase_status ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400'}`}
                                      >
                                        NÃO
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOnbaseToggle(contract.id, true);
                                        }}
                                        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${contract.onbase_status ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400'}`}
                                      >
                                        SIM
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
