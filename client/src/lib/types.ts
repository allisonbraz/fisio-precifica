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
  logoUrl: string;
}

export type FrequenciaCusto = 'mensal' | 'anual';

export interface CustoFixo {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  observacao: string;
  descricao: string;
  temParcelaAtiva?: boolean;
  isDepreciacao?: boolean;
}

export interface CustoVariavel {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  observacao: string;
  descricao: string;
}

export interface ReservaEstrategica {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
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
  validade: number;
}

export interface RegistroMensal {
  id: string;
  mes: string;
  sessoesRealizadas: number;
  receitaTotal: number;
  custoFixoTotal: number;
  custoVariavelTotal: number;
  observacoes: string;
}

export interface DadosPrecificacao {
  custosFixos: CustoFixo[];
  custosVariaveis: CustoVariavel[];
  reservasEstrategicas: ReservaEstrategica[];
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
