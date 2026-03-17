import { useMemo } from 'react';
import type { DadosPrecificacao } from './types';
import {
  calcularTotalCustosOperacionais,
  calcularTotalDepreciacao,
  calcularTotalCustosVariaveis,
  calcularTotalReservas,
  calcularCustoOperacionalMensal,
  calcularCustoTotalMensal,
  calcularCustoFixoPorSessao,
  calcularCustoVariavelPorSessao,
  calcularReservaPorSessao,
  calcularCustoTotalPorSessao,
  calcularCustoOperacionalPorSessao,
  calcularPrecoMinimo,
  calcularMargemDoPreco,
  calcularLucroOperacional,
  calcularLucroDisponivel,
  calcularPontoEquilibrio,
  calcularValorHora,
  calcularTaxaOcupacao,
  calcularCapacidadeMaxima,
} from './calculations';

export interface Metrics {
  // Monthly totals
  custoOperacional: number;
  custoDepreciacao: number;
  custoVarTotal: number;
  totalReservas: number;
  custoFixoTotal: number;
  custoOperacionalMensal: number;
  custoTotalMensal: number;

  // Per session
  custoFixoSessao: number;
  custoVarSessao: number;
  reservaSessao: number;
  custoTotalSessao: number;
  custoOperacionalSessao: number;

  // Pricing
  precoPorSessao: number;
  impostoPorSessao: number;
  lucroPorSessao: number;

  // Monthly results
  receitaBruta: number;
  impostosMensal: number;
  lucroOperacional: number;
  lucroDisponivel: number;

  // Business metrics
  taxaOcupacao: number;
  pontoEquilibrio: number;
  valorHora: number;
  capacidadeMaxima: number;
  margemPercent: number;
}

export function useMetrics(data: DadosPrecificacao): Metrics {
  return useMemo(() => {
    const custoOperacional = calcularTotalCustosOperacionais(data.custosFixos);
    const custoDepreciacao = calcularTotalDepreciacao(data.custosFixos);
    const custoVarTotal = calcularTotalCustosVariaveis(data.custosVariaveis);
    // Para totalReservas no hook, usamos a receita estimada baseada no preço calculado
    // Calculamos preço primeiro, depois usamos receita para reservas percentuais
    const precoTemp = calcularPrecoMinimo(data);
    const receitaEst = precoTemp * data.sessoesMeta;
    const totalReservas = calcularTotalReservas(data.reservasEstrategicas, receitaEst);
    const custoFixoTotal = custoOperacional + custoDepreciacao;
    const custoOperacionalMensal = calcularCustoOperacionalMensal(data);
    const custoTotalMensal = calcularCustoTotalMensal(data);

    const custoFixoSessao = calcularCustoFixoPorSessao(data);
    const custoVarSessao = calcularCustoVariavelPorSessao(data);
    const reservaSessao = calcularReservaPorSessao(data);
    const custoTotalSessao = calcularCustoTotalPorSessao(data);
    const custoOperacionalSessao = calcularCustoOperacionalPorSessao(data);

    const precoPorSessao = calcularPrecoMinimo(data);
    const impostoPorSessao = precoPorSessao * data.impostoPercentual;
    const lucroPorSessao = precoPorSessao - custoTotalSessao - impostoPorSessao;

    const receitaBruta = precoPorSessao * data.sessoesMeta;
    const impostosMensal = receitaBruta * data.impostoPercentual;
    const lucroOperacional = calcularLucroOperacional(data, precoPorSessao);
    const lucroDisponivel = calcularLucroDisponivel(data, precoPorSessao);

    const taxaOcupacao = calcularTaxaOcupacao(data);
    const pontoEquilibrio = calcularPontoEquilibrio(data, precoPorSessao);
    const valorHora = calcularValorHora(data, precoPorSessao);
    const capacidadeMaxima = calcularCapacidadeMaxima(data);
    const margemPercent = data.margemLucro * 100;

    return {
      custoOperacional, custoDepreciacao, custoVarTotal, totalReservas,
      custoFixoTotal, custoOperacionalMensal, custoTotalMensal,
      custoFixoSessao, custoVarSessao, reservaSessao, custoTotalSessao, custoOperacionalSessao,
      precoPorSessao, impostoPorSessao, lucroPorSessao,
      receitaBruta, impostosMensal, lucroOperacional, lucroDisponivel,
      taxaOcupacao, pontoEquilibrio, valorHora, capacidadeMaxima, margemPercent,
    };
  }, [data]);
}
