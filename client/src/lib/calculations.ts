import type { CustoFixo, CustoVariavel, DadosPrecificacao, FrequenciaCusto, PlanoTratamento, ReservaEstrategica, TipoServico } from './types';

// ===== HELPERS =====

export function getValorMensal(custo: { valor: number; frequencia: FrequenciaCusto }): number {
  return custo.frequencia === 'anual' ? custo.valor / 12 : custo.valor;
}

// ===== COST AGGREGATIONS =====

export function calcularTotalCustosOperacionais(custos: CustoFixo[]): number {
  return custos
    .filter(c => !c.isDepreciacao)
    .reduce((sum, c) => sum + getValorMensal(c), 0);
}

export function calcularTotalDepreciacao(custos: CustoFixo[]): number {
  return custos
    .filter(c => c.isDepreciacao && !c.temParcelaAtiva)
    .reduce((sum, c) => sum + getValorMensal(c), 0);
}

/**
 * Calcula total de reservas. Reservas no modo 'percentual' usam receitaEstimada como base.
 * Se receitaEstimada não for informada, usa apenas o valor fixo.
 */
export function calcularTotalReservas(reservas: ReservaEstrategica[], receitaEstimada?: number): number {
  return reservas.reduce((sum, r) => {
    if (r.modo === 'percentual' && r.percentual && receitaEstimada) {
      return sum + receitaEstimada * r.percentual;
    }
    return sum + getValorMensal(r);
  }, 0);
}

export function calcularTotalCustosFixos(custos: CustoFixo[]): number {
  return calcularTotalCustosOperacionais(custos) + calcularTotalDepreciacao(custos);
}

export function calcularTotalCustosVariaveis(custos: CustoVariavel[]): number {
  return custos.reduce((sum, c) => sum + getValorMensal(c), 0);
}

/** Custo total mensal SEM reservas (para cálculos de lucro operacional / DRE) */
export function calcularCustoOperacionalMensal(data: DadosPrecificacao): number {
  return calcularTotalCustosFixos(data.custosFixos) + calcularTotalCustosVariaveis(data.custosVariaveis);
}

/** Custo total mensal COM reservas (base para precificação).
 *  Reservas percentuais usam precoDefinido × sessoesMeta como base de receita.
 *  Se precoDefinido = 0, calcula preço somente com reservas fixas primeiro. */
export function calcularCustoTotalMensal(data: DadosPrecificacao): number {
  const receitaBase = _estimarReceitaParaReservas(data);
  return calcularTotalCustosFixos(data.custosFixos)
    + calcularTotalCustosVariaveis(data.custosVariaveis)
    + calcularTotalReservas(data.reservasEstrategicas, receitaBase);
}

/** Estima receita para cálculo de reservas percentuais */
function _estimarReceitaParaReservas(data: DadosPrecificacao): number {
  if (data.precoDefinido > 0) return data.precoDefinido * data.sessoesMeta;
  // Calcula preço só com reservas fixas para evitar circularidade
  const custoFixo = calcularTotalCustosFixos(data.custosFixos);
  const custoVar = calcularTotalCustosVariaveis(data.custosVariaveis);
  const reservasFixas = data.reservasEstrategicas
    .filter(r => r.modo !== 'percentual')
    .reduce((sum, r) => sum + getValorMensal(r), 0);
  const custoBase = data.sessoesMeta > 0
    ? (custoFixo + custoVar + reservasFixas) / data.sessoesMeta
    : 0;
  const divisor = 1 - data.margemLucro - data.impostoPercentual;
  const precoEstimado = divisor > 0.05 ? custoBase / divisor : custoBase * 10;
  return precoEstimado * data.sessoesMeta;
}

// ===== PER-SESSION COSTS =====

export function calcularCustoFixoPorSessao(data: DadosPrecificacao): number {
  if (data.sessoesMeta === 0) return 0;
  return calcularTotalCustosFixos(data.custosFixos) / data.sessoesMeta;
}

export function calcularCustoVariavelPorSessao(data: DadosPrecificacao): number {
  if (data.sessoesMeta === 0) return 0;
  return calcularTotalCustosVariaveis(data.custosVariaveis) / data.sessoesMeta;
}

export function calcularReservaPorSessao(data: DadosPrecificacao): number {
  if (data.sessoesMeta === 0) return 0;
  const receitaBase = _estimarReceitaParaReservas(data);
  return calcularTotalReservas(data.reservasEstrategicas, receitaBase) / data.sessoesMeta;
}

/** Custo total por sessão COM reservas (base para preço) */
export function calcularCustoTotalPorSessao(data: DadosPrecificacao): number {
  return calcularCustoFixoPorSessao(data) + calcularCustoVariavelPorSessao(data) + calcularReservaPorSessao(data);
}

/** Custo operacional por sessão SEM reservas */
export function calcularCustoOperacionalPorSessao(data: DadosPrecificacao): number {
  return calcularCustoFixoPorSessao(data) + calcularCustoVariavelPorSessao(data);
}

// ===== PRICING (MARGEM SOBRE RECEITA) =====

/**
 * Preço mínimo por sessão usando MARGEM SOBRE RECEITA:
 *   Preço = CustoTotal / (1 - margem% - imposto%)
 *
 * Onde margem e imposto são frações da receita (ex: 0.15 = 15%).
 * Reservas já estão incluídas no CustoTotal.
 */
export function calcularPrecoMinimo(data: DadosPrecificacao): number {
  const custoPorSessao = calcularCustoTotalPorSessao(data);
  const divisor = 1 - data.margemLucro - data.impostoPercentual;
  if (divisor <= 0.05) return custoPorSessao * 10; // safety cap
  return custoPorSessao / divisor;
}

/**
 * Calcula a margem sobre a RECEITA dado um preço:
 *   Margem = (Preço - CustoTotal - Impostos) / Preço
 */
export function calcularMargemDoPreco(data: DadosPrecificacao, preco: number): number {
  if (preco <= 0) return 0;
  const custoPorSessao = calcularCustoTotalPorSessao(data);
  const impostos = preco * data.impostoPercentual;
  return (preco - custoPorSessao - impostos) / preco;
}

// ===== PROFIT METRICS =====

/**
 * Lucro Operacional = Receita - Impostos - Custos Fixos - Custos Variáveis
 * NÃO desconta reservas (coerente com DRE).
 */
export function calcularLucroOperacional(data: DadosPrecificacao, precoSessao: number): number {
  const receita = precoSessao * data.sessoesMeta;
  const impostos = receita * data.impostoPercentual;
  const custoOperacional = calcularCustoOperacionalMensal(data);
  return receita - impostos - custoOperacional;
}

/**
 * Lucro Disponível = Lucro Operacional - Reservas
 * É o que realmente sobra para o profissional.
 */
export function calcularLucroDisponivel(data: DadosPrecificacao, precoSessao: number): number {
  const receitaEst = precoSessao * data.sessoesMeta;
  return calcularLucroOperacional(data, precoSessao) - calcularTotalReservas(data.reservasEstrategicas, receitaEst);
}

/** % das reservas sobre o lucro operacional */
export function calcularPercentualReservas(data: DadosPrecificacao, precoSessao: number): number {
  const lucroOp = calcularLucroOperacional(data, precoSessao);
  if (lucroOp <= 0) return 0;
  const receitaEst = precoSessao * data.sessoesMeta;
  return (calcularTotalReservas(data.reservasEstrategicas, receitaEst) / lucroOp) * 100;
}

// ===== SERVICES & PLANS =====

export function calcularPrecoServico(data: DadosPrecificacao, servico: TipoServico): number {
  const precoBase = calcularPrecoMinimo(data);
  return (precoBase * servico.multiplicadorPreco) + servico.custoAdicional;
}

export function calcularPrecoPlano(precoUnitario: number, plano: PlanoTratamento): number {
  const total = precoUnitario * plano.quantidadeSessoes;
  return total * (1 - plano.descontoPercentual / 100);
}

// ===== SIMULATION =====

export function simularPreco(data: DadosPrecificacao, precoSessao: number): {
  receitaMensal: number;
  impostos: number;
  custoOperacional: number;
  custoTotal: number;
  lucroOperacional: number;
  reservas: number;
  lucroDisponivel: number;
  margem: number;
  viavel: boolean;
} {
  const receitaMensal = precoSessao * data.sessoesMeta;
  const impostos = receitaMensal * data.impostoPercentual;
  const custoOperacional = calcularCustoOperacionalMensal(data);
  const reservas = calcularTotalReservas(data.reservasEstrategicas, receitaMensal);
  const custoTotal = custoOperacional + reservas;
  const lucroOperacional = receitaMensal - impostos - custoOperacional;
  const lucroDisponivel = lucroOperacional - reservas;
  const margem = receitaMensal > 0 ? (lucroDisponivel / receitaMensal) * 100 : 0;
  return { receitaMensal, impostos, custoOperacional, custoTotal, lucroOperacional, reservas, lucroDisponivel, margem, viavel: lucroDisponivel >= 0 };
}

// ===== BUSINESS METRICS =====

/**
 * Ponto de Equilíbrio: inclui reservas no custo fixo para o cálculo.
 * PE = (Custos Fixos + Reservas) / (Preço - Impostos unitários - Custo Variável por Sessão)
 */
export function calcularPontoEquilibrio(data: DadosPrecificacao, precoSessao: number): number {
  const receitaEst = precoSessao * data.sessoesMeta;
  const custoFixoTotal = calcularTotalCustosFixos(data.custosFixos) + calcularTotalReservas(data.reservasEstrategicas, receitaEst);
  const impostoPorSessao = precoSessao * data.impostoPercentual;
  const custoVarPorSessao = calcularCustoVariavelPorSessao(data);
  const contribuicao = precoSessao - impostoPorSessao - custoVarPorSessao;
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

/** Valor por hora usando duração configurável (default do data) */
export function calcularValorHora(data: DadosPrecificacao, precoSessao: number, duracaoMinutos?: number): number {
  const duracao = duracaoMinutos ?? data.duracaoPadraoMinutos ?? 50;
  if (duracao <= 0) return 0;
  return (precoSessao / duracao) * 60;
}

export function calcularCapacidadeMaxima(data: DadosPrecificacao): number {
  return data.diasUteis * data.sessoesporDia;
}

/** Sugere sessões por dia com base na duração + 10min transição */
export function sugerirSessoesPorDia(horasTrabalho: number, duracaoMinutos: number): number {
  const minutosDisponiveis = horasTrabalho * 60;
  const minutosSlot = duracaoMinutos + 10; // 10 min transição
  return Math.floor(minutosDisponiveis / minutosSlot);
}
