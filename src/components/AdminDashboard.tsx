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
  Coffee,
  Printer
} from 'lucide-react';
import { parseDriverLine } from '../services/geminiService';
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
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';

// --- CONSTANTS ---
const CHECKLIST_ITEMS = [
  "O VEÍCULO APRESENTA-SE LIMPO E EM BOAS CONDIÇÕES DE ACESSO AO DEPÓSITO.",
  "AUSÊNCIA DE VESTÍGIOS DE QUE TRANSPORTOU PRODUTOS QUÍMICOS OU QUALQUER OUTRO ITEM QUE POSSA CONTAMINAR O PRODUTO?",
  "AUSÊNCIA DE VESTÍGIOS DE OUTROS ALIMENTOS NO COMPARTIMENTO ARMAZENADOR DA CARGA.",
  "AUSÊNCIA DE ANIMAIS DOMÉSTICOS NO VEÍCULO.",
  "AUSÊNCIA DE PRAGAS E INSETOS MORTOS E/OU VIVOS.",
  "CARROCERIA SEM PRESENÇA DE IMPERFEIÇÕES QUE POSSAM CAUSAR AVARIAS AO PRODUTO.",
  "ESTADO GERAL DE CONSERVAÇÃO DO VEÍCULO (CABINE, CARROCERIA, ASSOALHO, LONA, ETC.)",
  "FARÓIS, LANTERNAS, PISCAS, BUZINA E LIMPADOR DE PÁRA-BRISA",
  "PNEUS (INCLUSIVE ESTEPE)",
  "PÁRA-CHOQUE (CONSERVAÇÃO E FIXAÇÃO)",
  "PÁRA-BRISA, ESPELHOS RETROVISORES, VIDROS LATERAIS",
  "TANQUE DE COMBUSTÍVEL",
  "EQUIPAMENTOS OBRIGATÓRIOS (CINTO, EXTINTOR, MACACO, ETC.)",
  "FAIXAS REFLETIVAS",
  "VAZAMENTOS (COMBUSTÍVEL / FREIO / AR)",
  "TACÓGRAFO (EQUIPAMENTO E DISCO)",
  "TRAVESSA SIDER",
  "MADERITE",
  "VESTIMENTAS DO MOTORISTA (UNIFORME, CRACHÁ, CALÇADO)",
  "VEÍCULO ABASTECIDO"
];

const SECURITY_PHRASES = [
  "Segurança é a nossa prioridade número um.",
  "Dirija com cuidado, sua família te espera.",
  "A carga é importante, mas sua vida é essencial.",
  "Cumprir as normas de GR salva vidas.",
  "Atenção total no trânsito, zero acidentes."
];

export const AdminDashboard: React.FC = () => {
  // --- STATES ---
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<DriverData | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'history'>('generate');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // --- EFFECTS ---
  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'dashboard') fetchHistory();
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % SECURITY_PHRASES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- API ACTIONS ---
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/contracts');
      if (response.ok) setContracts(await response.json());
    } catch (error) {
      console.error("Erro ao carregar histórico", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const data = await parseDriverLine(inputText);
      setParsedData(data);
      
      const id = Math.random().toString(36).substring(2, 15);
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data })
      });

      if (response.ok) {
        setGeneratedLink(`${window.location.origin}/sign/${id}`);
      }
    } catch (error) {
      alert('Erro ao processar dados. Verifique a API.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este registro?')) return;
    try {
      const response = await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
      if (response.ok) setContracts(contracts.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // --- PDF GENERATION LOGIC ---
  const downloadFullPDF = (contract: Contract) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Página 1: Termo de Responsabilidade
    generateTermContent(doc, contract, 15);
    
    // Página 2: Checklist
    doc.addPage();
    generateChecklistContent(doc, contract);
    
    // Página 3: Plano de Trajeto
    doc.addPage();
    generatePlanoDeTrajetoContent(doc, contract);

    doc.save(`Documentacao_GR_${contract.data.motorista || 'Motorista'}.pdf`);
  };

  // Helper de Renderização de Texto Rico (Bold)
  const renderRichText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number) => {
    const lines = text.split('\n');
    let currentY = y;
    lines.forEach(line => {
      doc.setFont("helvetica", "normal");
      doc.text(line, x, currentY, { maxWidth });
      currentY += (doc.splitTextToSize(line, maxWidth).length * 5);
    });
    return currentY;
  };

  const generateTermContent = (doc: jsPDF, contract: Contract, yStart: number) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TERMO DE RESPONSABILIDADE GERENCIAMENTO DE RISCO", 105, yStart, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const intro = `Eu, ${contract.data.motorista || '__________'}, portador do CPF ${contract.data.cpf || '__________'}, declaro estar ciente das normas de segurança da Três Corações...`;
    renderRichText(doc, intro, 20, yStart + 10, 170);
  };

  const generateChecklistContent = (doc: jsPDF, contract: Contract) => {
    doc.setFontSize(10);
    doc.text("CHECKLIST VEICULAR - SEGURANÇA PATRIMONIAL", 105, 15, { align: 'center' });
    let y = 25;
    CHECKLIST_ITEMS.forEach((item, i) => {
      doc.rect(10, y, 190, 7);
      doc.text(`${i + 1}. ${item.substring(0, 80)}`, 12, y + 5);
      doc.text("[ X ] OK", 170, y + 5);
      y += 7;
    });
  };

  const generatePlanoDeTrajetoContent = (doc: jsPDF, contract: Contract) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PLANO DE ROTA E VIAGEM", 105, 15, { align: 'center' });
    
    let y = 25;
    doc.rect(10, y, 190, 20);
    doc.text(`ORIGEM: ${contract.data.origem || 'SANTA LUZIA/MG'}`, 15, y + 8);
    doc.text(`DESTINO: ${contract.data.destino || 'NÃO INFORMADO'}`, 15, y + 15);
    
    y += 30;
    doc.text("INSTRUÇÕES DE ROTA:", 10, y);
    doc.setFont("helvetica", "normal");
    const instrucoes = "- Proibido paradas fora de postos credenciados.\n- Velocidade máxima: 80km/h.\n- Reportar paradas via teclado.";
    doc.text(instrucoes, 10, y + 7);
    
    if (contract.signature) {
        doc.line(60, 250, 150, 250);
        doc.addImage(contract.signature, 'PNG', 80, 235, 40, 15);
        doc.text("Assinatura do Motorista", 105, 255, { align: 'center' });
    }
  };

  // --- RENDER ---
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-2 rounded-lg">
            <Coffee className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Portal Transportador - 3 Corações</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'generate' ? 'bg-red-600 text-white' : 'text-gray-600'}`}
          >
            <LinkIcon size={18} /> Gerar Termo
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'history' ? 'bg-red-600 text-white' : 'text-gray-600'}`}
          >
            <History size={18} /> Histórico
          </button>
        </div>
      </div>

      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
              <FileText size={20} className="text-red-500" /> Colar Dados do Sistema
            </h2>
            <textarea
              className="w-full h-64 p-4 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono bg-gray-50"
              placeholder="Cole a linha de dados aqui..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleProcess}
              disabled={loading || !inputText}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
              PROCESSAR E GERAR LINK
            </button>
          </div>

          {/* Result Section */}
          <AnimatePresence>
            {generatedLink && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-red-600"
              >
                <div className="text-center mb-6">
                  <div className="bg-green-100 text-green-700 p-3 rounded-full w-fit mx-auto mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Link Gerado com Sucesso!</h3>
                  <p className="text-gray-500 text-sm">Envie para o motorista realizar a assinatura digital.</p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border mb-6">
                  <code className="text-xs flex-1 truncate">{generatedLink}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="flex justify-center bg-white p-4 rounded-xl border border-dashed border-gray-300">
                  <QRCodeSVG value={generatedLink} size={150} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por motorista ou CPF..." 
                className="pl-10 pr-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-red-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Motorista</th>
                <th className="px-6 py-4">Placa</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contracts.filter(c => 
                c.data.motorista?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(contract => (
                <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm">{new Date(contract.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{contract.data.motorista}</td>
                  <td className="px-6 py-4 text-sm">{contract.data.cavalo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${contract.signed_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {contract.signed_at ? 'Assinado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      onClick={() => downloadFullPDF(contract)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Baixar Documentação"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(contract.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};