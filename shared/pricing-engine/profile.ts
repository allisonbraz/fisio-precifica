import type { CustoFixo, CustoVariavel, DadosPrecificacao, RegimeTributario, ReservaEstrategica, TipoServico } from './types';

export type ProfissaoId =
  | 'fisioterapia'
  | 'fonoaudiologia'
  | 'terapia-ocupacional'
  | 'nutricao'
  | 'psicologia'
  | 'educacao-fisica';

/** Número que o código já usa hoje. */
export type ParametroConfirmado = {
  status: 'confirmado';
  valor: number;
};

/**
 * Dado que o repositório não tem. `valor` fica null de propósito:
 * não se copia o número da fisioterapia para outra profissão.
 */
export type ParametroLacuna = {
  status: 'lacuna';
  marcador: '🔴 LACUNA';
  valor: null;
  motivo: string;
};

export type ParametroNumerico = ParametroConfirmado | ParametroLacuna;

export interface RegimeSugerido {
  value: Exclude<RegimeTributario, 'mei'>;
  label: string;
  /** Fração da receita. 0.06 = 6%. */
  imposto: number;
  desc: string;
}

export interface RotulosPrecificacao {
  custoTotalMensal: string;
  custoOperacionalMensal: string;
  custoPorSessao: string;
  precoPorSessao: string;
  receitaBruta: string;
  receitaLiquida: string;
  impostos: string;
  lucroOperacional: string;
  lucroDisponivel: string;
  sessoesMeta: string;
  sessoesRealizadas: string;
  taxaOcupacao: string;
  pontoEquilibrio: string;
  valorHora: string;
  margemLucro: string;
  reservasEstrategicas: string;
  custoFixo: string;
  custoVariavel: string;
  depreciacao: string;
}

export interface PricingProfile {
  id: ProfissaoId;
  nome: string;
  /** Como a pessoa da profissão é chamada na interface. */
  nomeProfissional: string;
  /** Outros nomes do dia a dia, sem número de preço. */
  apelidos: readonly string[];
  /**
   * true só quando catálogo e parâmetros numéricos bastam para abrir o app
   * sem inventar dado. Os demais perfis ficam false até alguém preencher as lacunas.
   */
  catalogoCompleto: boolean;
  conselho: {
    sigla: string;
    /** Nome da linha de custo, quando já existe no produto. */
    nomeLinhaCusto: string | null;
  };
  parametros: {
    sessoesMeta: ParametroNumerico;
    margemLucro: ParametroNumerico;
    impostoPercentual: ParametroNumerico;
    horasTrabalho: ParametroNumerico;
    diasUteis: ParametroNumerico;
    sessoesporDia: ParametroNumerico;
    duracaoPadraoMinutos: ParametroNumerico;
  };
  regimeSugerido: Exclude<RegimeTributario, 'mei'> | null;
  regimes: readonly RegimeSugerido[];
  rotulos: RotulosPrecificacao;
  custosFixos: readonly CustoFixo[];
  depreciacao: readonly CustoFixo[];
  custosVariaveis: readonly CustoVariavel[];
  reservas: readonly ReservaEstrategica[];
  tiposServico: readonly TipoServico[];
  /** Textos 🔴 para o que ainda não pode virar número. */
  lacunas: readonly string[];
}

function numeroConfirmado(parametro: ParametroNumerico, perfil: ProfissaoId, campo: string): number {
  if (parametro.status !== 'confirmado') {
    throw new Error(`${perfil}.${campo} é 🔴 LACUNA: ${parametro.motivo}`);
  }
  return parametro.valor;
}

/** Cópia independente do documento inicial. Não altera o catálogo do perfil. */
export function criarDocumentoInicial(perfil: PricingProfile): DadosPrecificacao {
  if (!perfil.catalogoCompleto) {
    throw new Error(
      `Perfil ${perfil.id} não tem catálogo completo. Lacunas: ${perfil.lacunas.join(' | ')}`,
    );
  }
  const p = perfil.parametros;
  return {
    custosFixos: [...perfil.custosFixos, ...perfil.depreciacao].map(item => ({ ...item })),
    custosVariaveis: perfil.custosVariaveis.map(item => ({ ...item })),
    reservasEstrategicas: perfil.reservas.map(item => ({ ...item })),
    tiposServico: perfil.tiposServico.map(item => ({ ...item })),
    planosTratamento: [],
    registrosMensais: [],
    sessoesMeta: numeroConfirmado(p.sessoesMeta, perfil.id, 'sessoesMeta'),
    margemLucro: numeroConfirmado(p.margemLucro, perfil.id, 'margemLucro'),
    precoDefinido: 0,
    horasTrabalho: numeroConfirmado(p.horasTrabalho, perfil.id, 'horasTrabalho'),
    diasUteis: numeroConfirmado(p.diasUteis, perfil.id, 'diasUteis'),
    sessoesporDia: numeroConfirmado(p.sessoesporDia, perfil.id, 'sessoesporDia'),
    duracaoPadraoMinutos: numeroConfirmado(p.duracaoPadraoMinutos, perfil.id, 'duracaoPadraoMinutos'),
    regimeTributario: perfil.regimeSugerido ?? 'personalizado',
    impostoPercentual: numeroConfirmado(p.impostoPercentual, perfil.id, 'impostoPercentual'),
    etapasConcluidas: {},
  };
}
