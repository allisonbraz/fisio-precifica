import type { CustoFixo, CustoVariavel, DadosPrecificacao, FrequenciaCusto, PlanoTratamento, ReservaEstrategica, TipoServico } from './types';

export function getValorMensal(custo: { valor: number; frequencia: FrequenciaCusto }): number {
  return custo.frequencia === 'anual' ? custo.valor / 12 : custo.valor;
}

export function calcularTotalCustosOperacionais(custos: CustoFixo[]): number {
  return custos.filter(c => !c.isDepreciacao).reduce((sum, c) => sum + getValorMensal(c), 0);
}

export function calcularTotalDepreciacao(custos: CustoFixo[]): number {
  return custos.filter(c => c.isDepreciacao && !c.temParcelaAtiva).reduce((sum, c) => sum + getValorMensal(c), 0);
}

export function calcularTotalCustosFixos(custos: CustoFixo[]): number {
  return calcularTotalCustosOperacionais(custos) + calcularTotalDepreciacao(custos);
}

export function calcularTotalReservas(reservas: ReservaEstrategica[], receita = 0): number {
  return reservas.reduce((sum, r) => r.modo === 'percentual'
    ? sum + receita * (r.percentual || 0)
    : sum + getValorMensal(r), 0);
}

export function calcularTotalReservasFixas(reservas: ReservaEstrategica[]): number {
  return reservas.filter(r => r.modo !== 'percentual').reduce((sum, r) => sum + getValorMensal(r), 0);
}

export function calcularPercentualReservasReceita(reservas: ReservaEstrategica[]): number {
  return reservas.filter(r => r.modo === 'percentual').reduce((sum, r) => sum + (r.percentual || 0), 0);
}

export function calcularCustosVariaveisMensais(custos: CustoVariavel[]): number {
  return custos.filter(c => !c.modo || c.modo === 'mensal').reduce((sum, c) => sum + getValorMensal(c), 0);
}

export function calcularCustosVariaveisPorSessao(custos: CustoVariavel[]): number {
  return custos.filter(c => c.modo === 'por_sessao').reduce((sum, c) => sum + c.valor, 0);
}

export function calcularPercentualCustosVariaveis(custos: CustoVariavel[]): number {
  return custos.filter(c => c.modo === 'percentual_receita').reduce((sum, c) => sum + (c.percentual || 0), 0);
}

export function calcularTotalCustosVariaveis(custos: CustoVariavel[], sessoes = 0, receita = 0): number {
  return calcularCustosVariaveisMensais(custos)
    + calcularCustosVariaveisPorSessao(custos) * sessoes
    + calcularPercentualCustosVariaveis(custos) * receita;
}

export function calcularCustoOperacionalMensal(data: DadosPrecificacao, precoSessao = 0, sessoes = data.sessoesMeta): number {
  return calcularTotalCustosFixos(data.custosFixos)
    + calcularTotalCustosVariaveis(data.custosVariaveis, sessoes, precoSessao * sessoes);
}

export function calcularCustoTotalMensal(data: DadosPrecificacao, precoSessao = data.precoDefinido): number {
  const receita = precoSessao * data.sessoesMeta;
  return calcularCustoOperacionalMensal(data, precoSessao) + calcularTotalReservas(data.reservasEstrategicas, receita);
}

function componentes(data: DadosPrecificacao) {
  const sessoes = Math.max(data.sessoesMeta, 0);
  const fixos = calcularTotalCustosFixos(data.custosFixos);
  const variaveisMensais = calcularCustosVariaveisMensais(data.custosVariaveis);
  const variavelUnitario = calcularCustosVariaveisPorSessao(data.custosVariaveis);
  const variavelPercentual = calcularPercentualCustosVariaveis(data.custosVariaveis);
  const reservasFixas = calcularTotalReservasFixas(data.reservasEstrategicas);
  const reservasPercentuais = calcularPercentualReservasReceita(data.reservasEstrategicas);
  return { sessoes, fixos, variaveisMensais, variavelUnitario, variavelPercentual, reservasFixas, reservasPercentuais };
}

function dividirComProtecao(base: number, percentuais: number): number {
  const divisor = 1 - percentuais;
  return divisor > 0.05 ? base / divisor : base * 10;
}

export function calcularCustoFixoPorSessao(data: DadosPrecificacao): number {
  return data.sessoesMeta > 0 ? calcularTotalCustosFixos(data.custosFixos) / data.sessoesMeta : 0;
}

export function calcularCustoVariavelPorSessao(data: DadosPrecificacao, precoSessao = data.precoDefinido): number {
  if (data.sessoesMeta <= 0) return calcularCustosVariaveisPorSessao(data.custosVariaveis);
  return calcularTotalCustosVariaveis(data.custosVariaveis, data.sessoesMeta, precoSessao * data.sessoesMeta) / data.sessoesMeta;
}

export function calcularReservaPorSessao(data: DadosPrecificacao, precoSessao = data.precoDefinido): number {
  if (data.sessoesMeta <= 0) return 0;
  return calcularTotalReservas(data.reservasEstrategicas, precoSessao * data.sessoesMeta) / data.sessoesMeta;
}

export function calcularCustoTotalPorSessao(data: DadosPrecificacao, precoSessao = data.precoDefinido): number {
  return calcularCustoFixoPorSessao(data) + calcularCustoVariavelPorSessao(data, precoSessao) + calcularReservaPorSessao(data, precoSessao);
}

export function calcularCustoOperacionalPorSessao(data: DadosPrecificacao, precoSessao = data.precoDefinido): number {
  return calcularCustoFixoPorSessao(data) + calcularCustoVariavelPorSessao(data, precoSessao);
}

/** Cobre custos obrigatórios e tributos, sem reservas ou lucro. */
export function calcularPrecoPisoOperacional(data: DadosPrecificacao): number {
  const c = componentes(data);
  if (c.sessoes <= 0) return 0;
  const base = (c.fixos + c.variaveisMensais) / c.sessoes + c.variavelUnitario;
  return dividirComProtecao(base, data.impostoPercentual + c.variavelPercentual);
}

/** Cobre operação e reservas planejadas, ainda sem margem de lucro. */
export function calcularPrecoSustentavel(data: DadosPrecificacao): number {
  const c = componentes(data);
  if (c.sessoes <= 0) return 0;
  const base = (c.fixos + c.variaveisMensais + c.reservasFixas) / c.sessoes + c.variavelUnitario;
  return dividirComProtecao(base, data.impostoPercentual + c.variavelPercentual + c.reservasPercentuais);
}

/** Preço sustentável acrescido da margem desejada sobre a receita. */
export function calcularPrecoEstrategico(data: DadosPrecificacao): number {
  const c = componentes(data);
  if (c.sessoes <= 0) return 0;
  const base = (c.fixos + c.variaveisMensais + c.reservasFixas) / c.sessoes + c.variavelUnitario;
  return dividirComProtecao(base, data.impostoPercentual + c.variavelPercentual + c.reservasPercentuais + data.margemLucro);
}

/** Mantido por compatibilidade: o antigo preço mínimo agora é o preço estratégico. */
export function calcularPrecoMinimo(data: DadosPrecificacao): number {
  return calcularPrecoEstrategico(data);
}

export function calcularMargemDoPreco(data: DadosPrecificacao, preco: number): number {
  if (preco <= 0 || data.sessoesMeta <= 0) return 0;
  return simularPreco(data, preco).lucroDisponivel / (preco * data.sessoesMeta);
}

export function calcularLucroOperacional(data: DadosPrecificacao, precoSessao: number): number {
  const receita = precoSessao * data.sessoesMeta;
  return receita - receita * data.impostoPercentual - calcularCustoOperacionalMensal(data, precoSessao);
}

export function calcularLucroDisponivel(data: DadosPrecificacao, precoSessao: number): number {
  const receita = precoSessao * data.sessoesMeta;
  return calcularLucroOperacional(data, precoSessao) - calcularTotalReservas(data.reservasEstrategicas, receita);
}

export function calcularPercentualReservas(data: DadosPrecificacao, precoSessao: number): number {
  const lucro = calcularLucroOperacional(data, precoSessao);
  if (lucro <= 0) return 0;
  return calcularTotalReservas(data.reservasEstrategicas, precoSessao * data.sessoesMeta) / lucro * 100;
}

export function calcularPrecoServico(data: DadosPrecificacao, servico: TipoServico): number {
  return calcularPrecoEstrategico(data) * servico.multiplicadorPreco + servico.custoAdicional;
}

export function calcularPrecoPlano(precoUnitario: number, plano: PlanoTratamento): number {
  return precoUnitario * plano.quantidadeSessoes * (1 - plano.descontoPercentual / 100);
}

export function simularPreco(data: DadosPrecificacao, precoSessao: number) {
  const receitaMensal = precoSessao * data.sessoesMeta;
  const impostos = receitaMensal * data.impostoPercentual;
  const custoOperacional = calcularCustoOperacionalMensal(data, precoSessao);
  const reservas = calcularTotalReservas(data.reservasEstrategicas, receitaMensal);
  const custoTotal = custoOperacional + reservas;
  const lucroOperacional = receitaMensal - impostos - custoOperacional;
  const lucroDisponivel = lucroOperacional - reservas;
  const margem = receitaMensal > 0 ? lucroDisponivel / receitaMensal * 100 : 0;
  return { receitaMensal, impostos, custoOperacional, custoTotal, lucroOperacional, reservas, lucroDisponivel, margem, viavel: lucroDisponivel >= 0 };
}

export function calcularPontoEquilibrio(data: DadosPrecificacao, precoSessao: number): number {
  const c = componentes(data);
  const fixos = c.fixos + c.variaveisMensais + c.reservasFixas;
  const contribuicao = precoSessao * (1 - data.impostoPercentual - c.variavelPercentual - c.reservasPercentuais) - c.variavelUnitario;
  return contribuicao > 0 ? Math.ceil(fixos / contribuicao) : Infinity;
}

export function calcularHorasTrabalhadas(data: DadosPrecificacao): number { return data.diasUteis * data.horasTrabalho; }
export function calcularTaxaOcupacao(data: DadosPrecificacao): number {
  const capacidade = data.diasUteis * data.sessoesporDia;
  return capacidade > 0 ? data.sessoesMeta / capacidade * 100 : 0;
}
export function calcularValorHora(data: DadosPrecificacao, precoSessao: number, duracaoMinutos?: number): number {
  const duracao = duracaoMinutos ?? data.duracaoPadraoMinutos ?? 50;
  return duracao > 0 ? precoSessao / duracao * 60 : 0;
}
export function calcularCapacidadeMaxima(data: DadosPrecificacao): number { return data.diasUteis * data.sessoesporDia; }
export function sugerirSessoesPorDia(horasTrabalho: number, duracaoMinutos: number): number {
  return Math.floor(horasTrabalho * 60 / (duracaoMinutos + 10));
}
