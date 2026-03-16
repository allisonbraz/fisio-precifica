import type { CustoFixo, CustoVariavel, DadosPrecificacao, FrequenciaCusto, PlanoTratamento, ReservaEstrategica, TipoServico } from './types';

export function getValorMensal(custo: { valor: number; frequencia: FrequenciaCusto }): number {
  return custo.frequencia === 'anual' ? custo.valor / 12 : custo.valor;
}

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

export function calcularTotalReservas(reservas: ReservaEstrategica[]): number {
  return reservas.reduce((sum, r) => sum + getValorMensal(r), 0);
}

export function calcularTotalCustosFixos(custos: CustoFixo[]): number {
  return calcularTotalCustosOperacionais(custos) + calcularTotalDepreciacao(custos);
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

export function calcularMargemDoPreco(data: DadosPrecificacao, preco: number): number {
  const custoTotal = calcularCustoTotalPorSessao(data);
  if (custoTotal === 0) return preco > 0 ? 1 : 0;
  return (preco - custoTotal) / custoTotal;
}

export function calcularLucroOperacional(data: DadosPrecificacao, precoSessao: number): number {
  const receita = precoSessao * data.sessoesMeta;
  const custoTotal = calcularCustoTotalMensal(data);
  return receita - custoTotal;
}

export function calcularLucroDisponivel(data: DadosPrecificacao, precoSessao: number): number {
  const lucroOp = calcularLucroOperacional(data, precoSessao);
  const reservas = calcularTotalReservas(data.reservasEstrategicas);
  return lucroOp - reservas;
}

export function calcularPercentualReservas(data: DadosPrecificacao, precoSessao: number): number {
  const lucroOp = calcularLucroOperacional(data, precoSessao);
  if (lucroOp <= 0) return 0;
  const reservas = calcularTotalReservas(data.reservasEstrategicas);
  return (reservas / lucroOp) * 100;
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
  lucroOperacional: number;
  reservas: number;
  lucroDisponivel: number;
  margem: number;
  viavel: boolean;
} {
  const receitaMensal = precoSessao * data.sessoesMeta;
  const custoTotal = calcularCustoTotalMensal(data);
  const lucroOperacional = receitaMensal - custoTotal;
  const reservas = calcularTotalReservas(data.reservasEstrategicas);
  const lucroDisponivel = lucroOperacional - reservas;
  const margem = receitaMensal > 0 ? (lucroOperacional / receitaMensal) * 100 : 0;
  return { receitaMensal, custoTotal, lucroOperacional, reservas, lucroDisponivel, margem, viavel: lucroOperacional >= 0 };
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
