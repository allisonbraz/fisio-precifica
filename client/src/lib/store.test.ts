import { describe, it, expect } from 'vitest';
import {
  DadosPrecificacao,
  CustoFixo,
  ReservaEstrategica,
  getValorMensal,
  calcularTotalCustosOperacionais,
  calcularTotalDepreciacao,
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
  calcularTotalReservas,
  calcularCustoTotalMensal,
  calcularCustoTotalPorSessao,
  calcularPrecoMinimo,
  calcularMargemDoPreco,
  calcularLucroOperacional,
  calcularLucroDisponivel,
  calcularPontoEquilibrio,
  calcularTaxaOcupacao,
  calcularValorHora,
  calcularPercentualReservas,
  simularPreco,
  gerarAlertas,
  formatarMoeda,
  formatarPercentual,
} from './store';

// Helper to build minimal test data
function makeData(overrides: Partial<DadosPrecificacao> = {}): DadosPrecificacao {
  return {
    custosFixos: [],
    custosVariaveis: [],
    reservasEstrategicas: [],
    sessoesMeta: 80,
    margemLucro: 0.3,
    precoDefinido: 0,
    tiposServico: [],
    planosTratamento: [],
    registrosMensais: [],
    horasTrabalho: 8,
    diasUteis: 22,
    sessoesporDia: 8,
    duracaoPadraoMinutos: 50,
    regimeTributario: 'simples',
    impostoPercentual: 0.06,
    ...overrides,
  };
}

function makeCustoFixo(overrides: Partial<CustoFixo> = {}): CustoFixo {
  return { id: '1', nome: 'Test', valor: 1000, frequencia: 'mensal', observacao: '', descricao: '', ...overrides };
}

// ===== TESTS =====

describe('getValorMensal', () => {
  it('returns monthly value as-is', () => {
    expect(getValorMensal({ valor: 1200, frequencia: 'mensal' })).toBe(1200);
  });

  it('divides annual value by 12', () => {
    expect(getValorMensal({ valor: 1200, frequencia: 'anual' })).toBe(100);
  });
});

describe('calcularTotalCustosOperacionais', () => {
  it('excludes depreciation items', () => {
    const custos: CustoFixo[] = [
      makeCustoFixo({ id: '1', valor: 1000 }),
      makeCustoFixo({ id: '2', valor: 500, isDepreciacao: true }),
    ];
    expect(calcularTotalCustosOperacionais(custos)).toBe(1000);
  });
});

describe('calcularTotalDepreciacao', () => {
  it('includes only depreciation without active installments', () => {
    const custos: CustoFixo[] = [
      makeCustoFixo({ id: '1', valor: 500, isDepreciacao: true, temParcelaAtiva: false }),
      makeCustoFixo({ id: '2', valor: 300, isDepreciacao: true, temParcelaAtiva: true }),
      makeCustoFixo({ id: '3', valor: 1000 }),
    ];
    expect(calcularTotalDepreciacao(custos)).toBe(500);
  });
});

describe('calcularTotalCustosFixos', () => {
  it('sums operational + depreciation', () => {
    const custos: CustoFixo[] = [
      makeCustoFixo({ id: '1', valor: 1000 }),
      makeCustoFixo({ id: '2', valor: 200, isDepreciacao: true }),
    ];
    expect(calcularTotalCustosFixos(custos)).toBe(1200);
  });
});

describe('calcularCustoTotalMensal', () => {
  it('sums fixed + variable costs', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 2000 })],
      custosVariaveis: [{ id: '1', nome: 'Var', valor: 500, frequencia: 'mensal', observacao: '', descricao: '' }],
    });
    expect(calcularCustoTotalMensal(data)).toBe(2500);
  });
});

describe('calcularCustoTotalPorSessao', () => {
  it('divides total cost by sessions', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 8000 })],
      sessoesMeta: 80,
    });
    expect(calcularCustoTotalPorSessao(data)).toBe(100);
  });

  it('returns 0 when sessions is 0', () => {
    const data = makeData({ sessoesMeta: 0 });
    expect(calcularCustoTotalPorSessao(data)).toBe(0);
  });
});

describe('calcularPrecoMinimo', () => {
  it('applies margin-over-revenue formula to cost per session', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 8000 })],
      sessoesMeta: 80,
      margemLucro: 0.3,
      impostoPercentual: 0,
    });
    // Cost/session = 8000/80 = 100
    // Price = cost / (1 - margem - imposto) = 100 / (1 - 0.3 - 0) = 142.86
    expect(calcularPrecoMinimo(data)).toBeCloseTo(142.86, 1);
  });
});

describe('calcularMargemDoPreco', () => {
  it('calculates margin from price', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 8000 })],
      sessoesMeta: 80,
      impostoPercentual: 0,
    });
    // Margem sobre receita: (preco - custo - impostos) / preco
    // Cost/session = 100, impostos = 0, margin = (150 - 100 - 0) / 150 = 0.333...
    expect(calcularMargemDoPreco(data, 150)).toBeCloseTo(0.3333, 3);
  });

  it('handles zero cost', () => {
    const data = makeData({ sessoesMeta: 80, impostoPercentual: 0 });
    // margin = (100 - 0 - 0) / 100 = 1
    expect(calcularMargemDoPreco(data, 100)).toBe(1);
    expect(calcularMargemDoPreco(data, 0)).toBe(0);
  });
});

describe('calcularLucroOperacional', () => {
  it('calculates revenue minus impostos minus costs', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 5000 })],
      custosVariaveis: [{ id: '1', nome: 'V', valor: 1000, frequencia: 'mensal', observacao: '', descricao: '' }],
      sessoesMeta: 100,
      impostoPercentual: 0,
    });
    // Revenue = 150 * 100 = 15000, Impostos = 0, Cost = 6000
    // LucroOp = 15000 - 0 - 6000 = 9000
    expect(calcularLucroOperacional(data, 150)).toBe(9000);
  });
});

describe('calcularLucroDisponivel', () => {
  it('subtracts reserves from operational profit', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 5000 })],
      sessoesMeta: 100,
      impostoPercentual: 0,
      reservasEstrategicas: [{ id: 'r1', nome: 'Reserva', valor: 2000, frequencia: 'mensal', descricao: '' }],
    });
    // Revenue = 150 * 100 = 15000, Impostos = 0, Cost = 5000
    // LucroOp = 15000 - 0 - 5000 = 10000
    // LucroDisponivel = 10000 - 2000 = 8000
    expect(calcularLucroDisponivel(data, 150)).toBe(8000);
  });
});

describe('calcularPontoEquilibrio', () => {
  it('calculates break-even sessions', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 4000 })],
      sessoesMeta: 80,
      impostoPercentual: 0,
    });
    // Fixed cost = 4000, reservas = 0, variable/session = 0
    // Contribuição = preço - imposto - custoVar = 100 - 0 - 0 = 100
    // Break-even = ceil(4000 / 100) = 40
    expect(calcularPontoEquilibrio(data, 100)).toBe(40);
  });

  it('returns Infinity when contribution is zero', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 4000 })],
      sessoesMeta: 80,
      impostoPercentual: 0,
    });
    expect(calcularPontoEquilibrio(data, 0)).toBe(Infinity);
  });
});

describe('calcularTaxaOcupacao', () => {
  it('calculates session utilization', () => {
    const data = makeData({ sessoesMeta: 88, diasUteis: 22, sessoesporDia: 8 });
    // 88 / (22 * 8) = 88/176 = 50%
    expect(calcularTaxaOcupacao(data)).toBe(50);
  });
});

describe('calcularValorHora', () => {
  it('calculates hourly rate from session price', () => {
    // 150 per 50min session → (150/50)*60 = 180/hour
    expect(calcularValorHora(makeData(), 150, 50)).toBe(180);
  });
});

describe('simularPreco', () => {
  it('returns complete simulation', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 4000 })],
      sessoesMeta: 80,
      impostoPercentual: 0,
      reservasEstrategicas: [{ id: 'r1', nome: 'R', valor: 500, frequencia: 'mensal', descricao: '' }],
    });
    const result = simularPreco(data, 100);
    // Receita = 100 * 80 = 8000, Impostos = 0
    // CustoOp = 4000, Reservas = 500, CustoTotal = 4500
    // LucroOp = 8000 - 0 - 4000 = 4000
    // LucroDisp = 4000 - 500 = 3500
    // Margem = 3500 / 8000 * 100 = 43.75
    expect(result.receitaMensal).toBe(8000);
    expect(result.custoTotal).toBe(4500);
    expect(result.lucroOperacional).toBe(4000);
    expect(result.reservas).toBe(500);
    expect(result.lucroDisponivel).toBe(3500);
    expect(result.viavel).toBe(true);
    expect(result.margem).toBe(43.75);
  });

  it('marks as inviable when revenue < cost', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 10000 })],
      sessoesMeta: 80,
    });
    const result = simularPreco(data, 50);
    expect(result.viavel).toBe(false);
  });
});

describe('gerarAlertas', () => {
  it('alerts when depreciation has active installment', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 200, isDepreciacao: true, temParcelaAtiva: true })],
    });
    const alertas = gerarAlertas(data, 100);
    expect(alertas.some(a => a.tipo === 'danger' && a.mensagem.includes('parcela ativa'))).toBe(true);
  });

  it('alerts when profit positive but no reserves', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 2000 })],
      sessoesMeta: 80,
    });
    const alertas = gerarAlertas(data, 100);
    expect(alertas.some(a => a.tipo === 'warning' && a.mensagem.includes('reservas'))).toBe(true);
  });

  it('alerts when price below cost', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 8000 })],
      sessoesMeta: 80,
    });
    // Cost/session = 100, price = 50
    const alertas = gerarAlertas(data, 50);
    expect(alertas.some(a => a.tipo === 'danger' && a.mensagem.includes('abaixo do custo'))).toBe(true);
  });

  it('alerts when margin below 15%', () => {
    const data = makeData({
      custosFixos: [makeCustoFixo({ valor: 8000 })],
      sessoesMeta: 80,
    });
    // Cost/session = 100, price = 110 → margin = 10%
    const alertas = gerarAlertas(data, 110);
    expect(alertas.some(a => a.mensagem.includes('Margem de lucro arriscada'))).toBe(true);
  });
});

describe('formatarMoeda', () => {
  it('formats as BRL currency', () => {
    const result = formatarMoeda(1234.56);
    expect(result).toContain('1.234,56');
  });
});

describe('formatarPercentual', () => {
  it('formats percentage', () => {
    const result = formatarPercentual(50);
    expect(result).toContain('50');
  });
});
