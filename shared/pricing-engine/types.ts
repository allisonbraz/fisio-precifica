/**
 * Tipos do documento de precificação.
 * Puros: não incluem perfil da clínica, sessão Supabase nem React.
 */

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
  modo?: 'mensal' | 'por_sessao' | 'percentual_receita';
  percentual?: number;
}

export type ReservaModo = 'fixo' | 'percentual';

export interface ReservaEstrategica {
  id: string;
  nome: string;
  valor: number;
  frequencia: FrequenciaCusto;
  descricao: string;
  modo?: ReservaModo;
  /** Fração da receita bruta (0.05 = 5%). */
  percentual?: number;
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

export interface ServicoVendido {
  tipoServicoId: string;
  quantidade: number;
  receitaGerada: number;
}

export interface PlanoVendido {
  planoTratamentoId: string;
  quantidade: number;
  receitaGerada: number;
}

export interface RegistroMensal {
  id: string;
  mes: string;
  sessoesRealizadas: number;
  receitaTotal: number;
  custoFixoTotal: number;
  custoVariavelTotal: number;
  observacoes: string;
  /** Registros antigos, sem este campo, continuam valendo como resumo simples. */
  tipo?: 'simples' | 'completo';
  servicosVendidos?: ServicoVendido[];
  planosVendidos?: PlanoVendido[];
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
  etapasConcluidas?: {
    custos?: boolean;
    precificacao?: boolean;
    servicos?: boolean;
  };
}
