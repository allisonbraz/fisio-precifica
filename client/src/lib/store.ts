/**
 * FisioPrecifica Data Store v2
 * Design: Warm Professional — Organic Modernism
 * Manages all pricing data with localStorage persistence
 * Includes: lead capture, professional profile, annual/monthly costs, treatment plans
 */

// ===== INTERFACES =====

export interface LeadData {
  nome: string;
  whatsapp: string;
  email: string;
  registeredAt: string;
}

export interface PerfilProfissional {
  nome: string;
  cidade: string;
  crefito: string;
  especialidades: string;
  logoUrl: string; // base64 data URL
}

export type FrequenciaCusto = 'mensal' | 'anual';

export interface CustoFixo {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  observacao: string;
  descricao: string; // brief description/example
}

export interface CustoVariavel {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  observacao: string;
  descricao: string;
}

export interface TipoServico {
  id: string;
  nome: string;
  duracaoMinutos: number;
  custoAdicional: number;
  multiplicadorPreco: number;
  descricao: string;
}

export interface PlanoTratamento {
  id: string;
  nome: string;
  tipoServicoId: string;
  quantidadeSessoes: number;
  descontoPercentual: number;
  validade: number; // dias
}

export interface RegistroMensal {
  id: string;
  mes: string; // YYYY-MM
  sessoesRealizadas: number;
  receitaTotal: number;
  custoFixoTotal: number;
  custoVariavelTotal: number;
  observacoes: string;
}

export interface DadosPrecificacao {
  custosFixos: CustoFixo[];
  custosVariaveis: CustoVariavel[];
  sessoesMeta: number;
  margemLucro: number;
  precoDefinido: number;
  tiposServico: TipoServico[];
  planosTratamento: PlanoTratamento[];
  registrosMensais: RegistroMensal[];
  horasTrabalho: number;
  diasUteis: number;
  sessoesporDia: number;
}

// ===== STORAGE KEYS =====

const STORAGE_KEY = 'fisioprecifica_data';
const LEAD_KEY = 'fisioprecifica_lead';
const PERFIL_KEY = 'fisioprecifica_perfil';
const LEADS_LIST_KEY = 'fisioprecifica_leads_list';

// ===== DEFAULT DATA =====

const defaultCustosFixos: CustoFixo[] = [
  { id: '1', nome: 'Aluguel do consultório/sala', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Valor mensal do aluguel do espaço onde você atende. Ex: R$ 1.500/mês por uma sala comercial.' },
  { id: '2', nome: 'CREFITO ou outro conselho de classe', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Anuidade do conselho profissional (CREFITO, CRM, etc). Ex: R$ 600/ano. Será dividido por 12 automaticamente.' },
  { id: '3', nome: 'Associação profissional', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Anuidade de associações como ABRAFITO, ABF, COFFITO ou sindicatos. Ex: R$ 360/ano.' },
  { id: '4', nome: 'Salários + Encargos', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Folha de pagamento de funcionários (recepcionista, auxiliar, etc). Ex: R$ 2.000/mês + encargos.' },
  { id: '5', nome: 'Pró-labore', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Sua retirada mensal como sócio/proprietário. Ex: R$ 5.000/mês é o mínimo que você precisa receber.' },
  { id: '6', nome: 'Contador/Contabilidade', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Honorários do escritório de contabilidade. Ex: R$ 300 a R$ 800/mês dependendo do porte.' },
  { id: '7', nome: 'Software de Gestão', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Assinatura de sistemas como ZenFisio, Fisioclin, etc. Ex: R$ 100 a R$ 300/mês.' },
  { id: '8', nome: 'Depreciação de equipamentos', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Reserva mensal para reposição de equipamentos. Ex: Maca de R$ 3.600 ÷ 60 meses = R$ 60/mês.' },
  { id: '9', nome: 'Internet/Telefone', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Plano de internet e telefone do consultório. Ex: R$ 150/mês para internet fibra + telefone.' },
  { id: '10', nome: 'Seguro', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Seguro de responsabilidade civil profissional. Ex: R$ 800 a R$ 2.000/ano.' },
  { id: '11', nome: 'Marketing fixo', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Investimento recorrente em marketing: site, redes sociais, Google Ads. Ex: R$ 500/mês.' },
  { id: '12', nome: 'Aquisição e Manutenção de Equipamentos', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Manutenção preventiva e compra de acessórios. Ex: R$ 2.400/ano para manutenção de aparelhos.' },
  { id: '13', nome: 'Combustível', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Gasto com deslocamento para atendimentos domiciliares ou entre unidades. Ex: R$ 400/mês.' },
  { id: '14', nome: 'Cursos e Capacitação', valor: 0, frequencia: 'anual', observacao: '', descricao: 'Investimento em cursos, congressos e especializações. Ex: R$ 3.000/ano em formação continuada.' },
  { id: '15', nome: 'Condomínio, IPTU e impostos prediais', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Taxas do imóvel comercial. Ex: Condomínio R$ 400 + IPTU R$ 100/mês.' },
  { id: '16', nome: 'Outros custos fixos', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Qualquer outro custo fixo não listado acima. Ex: estacionamento, uniformes, etc.' },
];

const defaultCustosVariaveis: CustoVariavel[] = [
  { id: '1', nome: 'Material de Consumo (gel, eletrodos, etc.)', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Materiais usados durante as sessões. Ex: gel condutor, eletrodos, faixas elásticas. R$ 200/mês.' },
  { id: '2', nome: 'Material descartável por sessão', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Lençol descartável, luvas, papel toalha. Ex: R$ 2 a R$ 5 por sessão × número de sessões.' },
  { id: '3', nome: 'Taxa de cartão de crédito/débito', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Taxas cobradas pela maquininha. Ex: 2% a 5% do faturamento mensal com cartão.' },
  { id: '4', nome: 'Água e esgoto', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Conta de água do consultório. Ex: R$ 80 a R$ 150/mês.' },
  { id: '5', nome: 'Energia Elétrica', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Conta de luz (ar-condicionado, equipamentos). Ex: R$ 200 a R$ 500/mês.' },
  { id: '6', nome: 'Material de Limpeza', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Produtos de limpeza e higienização. Ex: R$ 100 a R$ 200/mês.' },
  { id: '7', nome: 'Marketing variável', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Ações pontuais de marketing: impulsionamento, panfletos, eventos. Ex: R$ 300/mês.' },
  { id: '8', nome: 'Impostos da prefeitura (ISS, ECAD)', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'ISS (2% a 5% do faturamento) e outras taxas municipais. Ex: R$ 200/mês.' },
  { id: '9', nome: 'Impostos sobre faturamento/receita', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'DAS (Simples Nacional), IRPJ, etc. Conforme seu regime tributário. Ex: 6% a 15% do faturamento.' },
  { id: '10', nome: 'Comissão (se houver)', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Comissão paga a indicadores ou parceiros. Ex: 10% sobre sessões indicadas.' },
  { id: '11', nome: 'Outros custos variáveis', valor: 0, frequencia: 'mensal', observacao: '', descricao: 'Qualquer outro custo que varia conforme o volume de atendimentos.' },
];

const defaultTiposServico: TipoServico[] = [
  { id: '1', nome: 'Sessão Individual', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 1, descricao: 'Atendimento padrão em consultório' },
  { id: '2', nome: 'Avaliação Inicial', duracaoMinutos: 60, custoAdicional: 0, multiplicadorPreco: 1.5, descricao: 'Primeira consulta com avaliação completa' },
  { id: '3', nome: 'Atendimento Domiciliar', duracaoMinutos: 60, custoAdicional: 30, multiplicadorPreco: 1.8, descricao: 'Sessão na residência do paciente' },
  { id: '4', nome: 'Pilates Individual', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 1.3, descricao: 'Sessão de Pilates individual' },
  { id: '5', nome: 'Pilates em Grupo (por aluno)', duracaoMinutos: 50, custoAdicional: 0, multiplicadorPreco: 0.6, descricao: 'Sessão de Pilates em grupo' },
];

const defaultData: DadosPrecificacao = {
  custosFixos: defaultCustosFixos,
  custosVariaveis: defaultCustosVariaveis,
  sessoesMeta: 80,
  margemLucro: 0.30,
  precoDefinido: 0,
  tiposServico: defaultTiposServico,
  planosTratamento: [],
  registrosMensais: [],
  horasTrabalho: 8,
  diasUteis: 22,
  sessoesporDia: 8,
};

const defaultPerfil: PerfilProfissional = {
  nome: '',
  cidade: '',
  crefito: '',
  especialidades: '',
  logoUrl: '',
};

// ===== LOAD / SAVE =====

export function loadData(): DadosPrecificacao {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old "pacotes" to "planosTratamento"
      if (parsed.pacotes && !parsed.planosTratamento) {
        parsed.planosTratamento = parsed.pacotes;
        delete parsed.pacotes;
      }
      // Migrate old custos without frequencia/descricao
      if (parsed.custosFixos) {
        parsed.custosFixos = parsed.custosFixos.map((c: any, i: number) => ({
          ...c,
          frequencia: c.frequencia || (defaultCustosFixos[i]?.frequencia || 'mensal'),
          descricao: c.descricao || (defaultCustosFixos.find(d => d.id === c.id)?.descricao || ''),
        }));
      }
      if (parsed.custosVariaveis) {
        parsed.custosVariaveis = parsed.custosVariaveis.map((c: any, i: number) => ({
          ...c,
          frequencia: c.frequencia || 'mensal',
          descricao: c.descricao || (defaultCustosVariaveis.find(d => d.id === c.id)?.descricao || ''),
        }));
      }
      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }
  return { ...defaultData };
}

export function saveData(data: DadosPrecificacao): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar dados:', e);
  }
}

export function resetData(): DadosPrecificacao {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(defaultData));
}

// ===== LEAD FUNCTIONS =====

export function loadLead(): LeadData | null {
  try {
    const stored = localStorage.getItem(LEAD_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Erro ao carregar lead:', e);
  }
  return null;
}

export function saveLead(lead: LeadData): void {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify(lead));
    // Also add to leads list for export
    const list = loadLeadsList();
    const exists = list.find(l => l.email === lead.email);
    if (!exists) {
      list.push(lead);
      localStorage.setItem(LEADS_LIST_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error('Erro ao salvar lead:', e);
  }
}

export function loadLeadsList(): LeadData[] {
  try {
    const stored = localStorage.getItem(LEADS_LIST_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Erro ao carregar leads:', e);
  }
  return [];
}

// ===== PERFIL FUNCTIONS =====

export function loadPerfil(): PerfilProfissional {
  try {
    const stored = localStorage.getItem(PERFIL_KEY);
    if (stored) return { ...defaultPerfil, ...JSON.parse(stored) };
  } catch (e) {
    console.error('Erro ao carregar perfil:', e);
  }
  return { ...defaultPerfil };
}

export function savePerfil(perfil: PerfilProfissional): void {
  try {
    localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
  } catch (e) {
    console.error('Erro ao salvar perfil:', e);
  }
}

// ===== CALCULATION HELPERS =====

/** Get the effective monthly value of a cost (divides annual by 12) */
export function getValorMensal(custo: { valor: number; frequencia: FrequenciaCusto }): number {
  return custo.frequencia === 'anual' ? custo.valor / 12 : custo.valor;
}

export function calcularTotalCustosFixos(custos: CustoFixo[]): number {
  return custos.reduce((sum, c) => sum + getValorMensal(c), 0);
}

export function calcularTotalCustosVariaveis(custos: CustoVariavel[]): number {
  return custos.reduce((sum, c) => sum + getValorMensal(c), 0);
}

export function calcularCustoTotalMensal(data: DadosPrecificacao): number {
  return calcularTotalCustosFixos(data.custosFixos) + calcularTotalCustosVariaveis(data.custosVariaveis);
}

export function calcularCustoFixoPorSessao(data: DadosPrecificacao): number {
  if (data.sessoesMeta === 0) return 0;
  return calcularTotalCustosFixos(data.custosFixos) / data.sessoesMeta;
}

export function calcularCustoVariavelPorSessao(data: DadosPrecificacao): number {
  if (data.sessoesMeta === 0) return 0;
  return calcularTotalCustosVariaveis(data.custosVariaveis) / data.sessoesMeta;
}

export function calcularCustoTotalPorSessao(data: DadosPrecificacao): number {
  return calcularCustoFixoPorSessao(data) + calcularCustoVariavelPorSessao(data);
}

export function calcularPrecoMinimo(data: DadosPrecificacao): number {
  const custoTotal = calcularCustoTotalPorSessao(data);
  return custoTotal * (1 + data.margemLucro);
}

/** Calculate margin from a defined price */
export function calcularMargemDoPreco(data: DadosPrecificacao, preco: number): number {
  const custoTotal = calcularCustoTotalPorSessao(data);
  if (custoTotal === 0) return preco > 0 ? 1 : 0;
  return (preco - custoTotal) / custoTotal;
}

export function calcularPrecoServico(data: DadosPrecificacao, servico: TipoServico): number {
  const precoBase = calcularPrecoMinimo(data);
  return (precoBase * servico.multiplicadorPreco) + servico.custoAdicional;
}

export function calcularPrecoPlano(precoUnitario: number, plano: PlanoTratamento): number {
  const total = precoUnitario * plano.quantidadeSessoes;
  return total * (1 - plano.descontoPercentual / 100);
}

export function simularPreco(data: DadosPrecificacao, precoSessao: number): {
  receitaMensal: number;
  custoTotal: number;
  lucroBruto: number;
  margem: number;
  viavel: boolean;
} {
  const receitaMensal = precoSessao * data.sessoesMeta;
  const custoTotal = calcularCustoTotalMensal(data);
  const lucroBruto = receitaMensal - custoTotal;
  const margem = receitaMensal > 0 ? (lucroBruto / receitaMensal) * 100 : 0;
  return {
    receitaMensal,
    custoTotal,
    lucroBruto,
    margem,
    viavel: lucroBruto >= 0,
  };
}

export function calcularPontoEquilibrio(data: DadosPrecificacao, precoSessao: number): number {
  const custoFixoTotal = calcularTotalCustosFixos(data.custosFixos);
  const custoVarPorSessao = calcularCustoVariavelPorSessao(data);
  const contribuicao = precoSessao - custoVarPorSessao;
  if (contribuicao <= 0) return Infinity;
  return Math.ceil(custoFixoTotal / contribuicao);
}

export function calcularHorasTrabalhadas(data: DadosPrecificacao): number {
  return data.diasUteis * data.horasTrabalho;
}

export function calcularTaxaOcupacao(data: DadosPrecificacao): number {
  const capacidadeMaxima = data.diasUteis * data.sessoesporDia;
  if (capacidadeMaxima === 0) return 0;
  return (data.sessoesMeta / capacidadeMaxima) * 100;
}

export function calcularValorHora(data: DadosPrecificacao, precoSessao: number, duracaoMinutos: number = 50): number {
  return (precoSessao / duracaoMinutos) * 60;
}

// ===== FORMATTERS =====

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(valor / 100);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function exportarDados(data: DadosPrecificacao): string {
  return JSON.stringify(data, null, 2);
}

export function importarDados(json: string): DadosPrecificacao | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.custosFixos && parsed.custosVariaveis) {
      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.error('Erro ao importar dados:', e);
  }
  return null;
}
