/**
 * FisioPrecifica Data Store
 * Design: Warm Professional — Organic Modernism
 * Manages all pricing data with localStorage persistence
 */

export interface CustoFixo {
  id: string;
  nome: string;
  valor: number;
  observacao: string;
}

export interface CustoVariavel {
  id: string;
  nome: string;
  valor: number;
  observacao: string;
}

export interface TipoServico {
  id: string;
  nome: string;
  duracaoMinutos: number;
  custoAdicional: number;
  multiplicadorPreco: number;
  descricao: string;
}

export interface Pacote {
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
  tiposServico: TipoServico[];
  pacotes: Pacote[];
  registrosMensais: RegistroMensal[];
  horasTrabalho: number;
  diasUteis: number;
  sessoesporDia: number;
}

const STORAGE_KEY = 'fisioprecifica_data';

const defaultCustosFixos: CustoFixo[] = [
  { id: '1', nome: 'Aluguel do consultório/sala', valor: 0, observacao: '' },
  { id: '2', nome: 'CREFITO (anuidade ÷ 12)', valor: 0, observacao: 'Anuidade ÷ 12 meses' },
  { id: '3', nome: 'Salários + Encargos', valor: 0, observacao: '' },
  { id: '4', nome: 'Pró-labore', valor: 0, observacao: 'Sua retirada mensal' },
  { id: '5', nome: 'Contador/Contabilidade', valor: 0, observacao: '' },
  { id: '6', nome: 'Software de Gestão', valor: 0, observacao: '' },
  { id: '7', nome: 'Depreciação de equipamentos', valor: 0, observacao: '' },
  { id: '8', nome: 'Internet/Telefone', valor: 0, observacao: '' },
  { id: '9', nome: 'Seguro', valor: 0, observacao: '' },
  { id: '10', nome: 'Marketing fixo', valor: 0, observacao: 'Site, redes sociais' },
  { id: '11', nome: 'Aquisição e Manutenção de Equipamentos', valor: 0, observacao: '' },
  { id: '12', nome: 'Combustível', valor: 0, observacao: 'Atendimento domiciliar' },
  { id: '13', nome: 'Cursos e Capacitação', valor: 0, observacao: '' },
  { id: '14', nome: 'Condomínio, IPTU e impostos prediais', valor: 0, observacao: '' },
  { id: '15', nome: 'Outros custos fixos', valor: 0, observacao: '' },
];

const defaultCustosVariaveis: CustoVariavel[] = [
  { id: '1', nome: 'Material de Consumo (gel, eletrodos, etc.)', valor: 0, observacao: '' },
  { id: '2', nome: 'Material descartável por sessão', valor: 0, observacao: '' },
  { id: '3', nome: 'Taxa de cartão de crédito/débito', valor: 0, observacao: '' },
  { id: '4', nome: 'Água e esgoto', valor: 0, observacao: '' },
  { id: '5', nome: 'Energia Elétrica', valor: 0, observacao: '' },
  { id: '6', nome: 'Material de Limpeza', valor: 0, observacao: '' },
  { id: '7', nome: 'Marketing variável', valor: 0, observacao: 'Ações isoladas do mês' },
  { id: '8', nome: 'Impostos da prefeitura (ISS, ECAD)', valor: 0, observacao: '' },
  { id: '9', nome: 'Impostos sobre faturamento/receita', valor: 0, observacao: 'Conforme regime tributário' },
  { id: '10', nome: 'Comissão (se houver)', valor: 0, observacao: '' },
  { id: '11', nome: 'Outros custos variáveis', valor: 0, observacao: '' },
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
  tiposServico: defaultTiposServico,
  pacotes: [],
  registrosMensais: [],
  horasTrabalho: 8,
  diasUteis: 22,
  sessoesporDia: 8,
};

export function loadData(): DadosPrecificacao {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
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
  return { ...defaultData };
}

// Calculation helpers
export function calcularTotalCustosFixos(custos: CustoFixo[]): number {
  return custos.reduce((sum, c) => sum + c.valor, 0);
}

export function calcularTotalCustosVariaveis(custos: CustoVariavel[]): number {
  return custos.reduce((sum, c) => sum + c.valor, 0);
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

export function calcularPrecoServico(data: DadosPrecificacao, servico: TipoServico): number {
  const precoBase = calcularPrecoMinimo(data);
  return (precoBase * servico.multiplicadorPreco) + servico.custoAdicional;
}

export function calcularPrecoPacote(precoUnitario: number, pacote: Pacote): number {
  const total = precoUnitario * pacote.quantidadeSessoes;
  return total * (1 - pacote.descontoPercentual / 100);
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
