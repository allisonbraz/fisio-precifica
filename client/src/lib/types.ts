export interface LeadData {
  nome: string;
  whatsapp: string;
  email: string;
  registeredAt: string;
}

export interface PerfilProfissional {
  nome: string;
  cidade: string;
  endereco: string;
  crefito: string;
  especialidades: string;
  logoUrl: string;
  whatsapp: string;
  instagram: string;
  cpfCnpj: string;
  nomeEmpresa: string;
  site: string;
  outraRedeSocial: string;
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

export type ReservaModo = 'fixo' | 'percentual';

export interface ReservaEstrategica {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  descricao: string;
  modo?: ReservaModo;
  percentual?: number; // % sobre receita bruta estimada (ex: 0.05 = 5%)
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

export type RegimeTributario = 'mei' | 'simples' | 'presumido' | 'autonomo' | 'personalizado';

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
  duracaoPadraoMinutos: number;
  regimeTributario: RegimeTributario;
  impostoPercentual: number;
}
