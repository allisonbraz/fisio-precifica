import type { DadosPrecificacao } from './types';
import { calcularCustoTotalPorSessao, calcularLucroOperacional, calcularTotalReservas } from './calculations';
import { formatarMoeda } from './formatters';

export interface AlertaFinanceiro {
  tipo: 'warning' | 'info' | 'danger';
  mensagem: string;
  detalhe: string;
}

export function gerarAlertas(data: DadosPrecificacao, precoSessao: number): AlertaFinanceiro[] {
  const alertas: AlertaFinanceiro[] = [];

  const depComParcela = data.custosFixos.filter(c => c.isDepreciacao && c.temParcelaAtiva && c.valor > 0);
  if (depComParcela.length > 0) {
    alertas.push({
      tipo: 'danger',
      mensagem: 'Equipamento com parcela ativa não pode ter depreciação',
      detalhe: `${depComParcela.map(c => c.nome).join(', ')} — enquanto houver parcela ativa, a depreciação é bloqueada automaticamente.`,
    });
  }

  const lucroOp = calcularLucroOperacional(data, precoSessao);
  const totalReservas = calcularTotalReservas(data.reservasEstrategicas);
  if (lucroOp > 0 && totalReservas === 0) {
    alertas.push({
      tipo: 'warning',
      mensagem: 'Seu lucro é positivo, mas você não está formando reservas',
      detalhe: 'Recomendamos destinar pelo menos 10% a 20% do lucro operacional para reservas estratégicas (emergência, férias, expansão).',
    });
  }

  if (lucroOp > 0 && totalReservas > lucroOp) {
    alertas.push({
      tipo: 'danger',
      mensagem: 'Suas reservas excedem o lucro operacional',
      detalhe: `Lucro operacional: ${formatarMoeda(lucroOp)} | Reservas: ${formatarMoeda(totalReservas)}. Reduza as reservas ou aumente o preço.`,
    });
  }

  const custoSessao = calcularCustoTotalPorSessao(data);
  if (custoSessao > 0 && precoSessao > 0) {
    const margem = ((precoSessao - custoSessao) / custoSessao) * 100;
    if (margem < 15) {
      alertas.push({
        tipo: 'danger',
        mensagem: 'Margem de lucro arriscada (abaixo de 15%)',
        detalhe: `Sua margem atual é de ${margem.toFixed(1)}%. Abaixo de 15% qualquer imprevisto pode gerar prejuízo.`,
      });
    }
  }

  if (precoSessao > 0 && precoSessao < custoSessao) {
    alertas.push({
      tipo: 'danger',
      mensagem: 'Preço abaixo do custo por sessão',
      detalhe: `Você está cobrando ${formatarMoeda(precoSessao)} mas seu custo é ${formatarMoeda(custoSessao)}. Cada sessão gera prejuízo.`,
    });
  }

  return alertas;
}
