import { describe, it, expect } from 'vitest';
import {
  getValorMensal,
  calcularTotalCustosOperacionais,
  calcularTotalDepreciacao,
  calcularTotalReservas,
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
  calcularCustoOperacionalMensal,
  calcularCustoTotalMensal,
  calcularCustoFixoPorSessao,
  calcularCustoVariavelPorSessao,
  calcularReservaPorSessao,
  calcularCustoTotalPorSessao,
  calcularPrecoMinimo,
  calcularMargemDoPreco,
  calcularLucroOperacional,
  calcularLucroDisponivel,
  calcularPontoEquilibrio,
  calcularPrecoServico,
  calcularPrecoPlano,
  simularPreco,
  calcularHorasTrabalhadas,
  calcularTaxaOcupacao,
  calcularValorHora,
  calcularCapacidadeMaxima,
  sugerirSessoesPorDia,
} from './calculations';
import type { DadosPrecificacao, CustoFixo, CustoVariavel, ReservaEstrategica, TipoServico, PlanoTratamento } from './types';

const mockCustosFixos: CustoFixo[] = [
  { id: '1', nome: 'Aluguel', valor: 2000, frequencia: 'mensal', observacao: '', descricao: '', isDepreciacao: false },
  { id: '2', nome: 'CREFITO', valor: 1200, frequencia: 'anual', observacao: '', descricao: '', isDepreciacao: false },
  { id: '3', nome: 'Equipamento', valor: 600, frequencia: 'mensal', observacao: '', descricao: '', isDepreciacao: true, temParcelaAtiva: false },
];

const mockCustosVariaveis: CustoVariavel[] = [
  { id: '1', nome: 'Material', valor: 300, frequencia: 'mensal', observacao: '', descricao: '' },
  { id: '2', nome: 'Energia', valor: 1200, frequencia: 'anual', observacao: '', descricao: '' },
];

const mockReservas: ReservaEstrategica[] = [
  { id: '1', nome: 'Emergência', valor: 500, frequencia: 'mensal', descricao: '' },
  { id: '2', nome: 'Férias', valor: 6000, frequencia: 'anual', descricao: '' },
];

const mockData: DadosPrecificacao = {
  custosFixos: mockCustosFixos,
  custosVariaveis: mockCustosVariaveis,
  reservasEstrategicas: mockReservas,
  sessoesMeta: 80,
  margemLucro: 0.15,
  impostoPercentual: 0.06,
  precoDefinido: 0,
  tiposServico: [],
  planosTratamento: [],
  registrosMensais: [],
  horasTrabalho: 8,
  diasUteis: 22,
  sessoesporDia: 5,
  duracaoPadraoMinutos: 50,
  regimeTributario: 'simples',
};

describe('getValorMensal', () => {
  it('retorna valor direto para frequência mensal', () => {
    expect(getValorMensal({ valor: 1000, frequencia: 'mensal' })).toBe(1000);
  });

  it('divide por 12 para frequência anual', () => {
    expect(getValorMensal({ valor: 1200, frequencia: 'anual' })).toBe(100);
  });

  it('retorna 0 para valor zero', () => {
    expect(getValorMensal({ valor: 0, frequencia: 'mensal' })).toBe(0);
  });
});

describe('calcularTotalCustosOperacionais', () => {
  it('soma apenas custos não-depreciação', () => {
    const total = calcularTotalCustosOperacionais(mockCustosFixos);
    // Aluguel 2000 + CREFITO 1200/12=100 = 2100
    expect(total).toBe(2100);
  });

  it('retorna 0 para array vazio', () => {
    expect(calcularTotalCustosOperacionais([])).toBe(0);
  });
});

describe('calcularTotalDepreciacao', () => {
  it('soma apenas custos de depreciação sem parcela ativa', () => {
    const total = calcularTotalDepreciacao(mockCustosFixos);
    expect(total).toBe(600);
  });

  it('ignora depreciação com parcela ativa', () => {
    const custos: CustoFixo[] = [
      { id: '1', nome: 'Equip', valor: 500, frequencia: 'mensal', observacao: '', descricao: '', isDepreciacao: true, temParcelaAtiva: true },
    ];
    expect(calcularTotalDepreciacao(custos)).toBe(0);
  });
});

describe('calcularTotalReservas', () => {
  it('soma reservas mensais e anuais convertidas', () => {
    const total = calcularTotalReservas(mockReservas);
    // Emergência 500 + Férias 6000/12=500 = 1000
    expect(total).toBe(1000);
  });

  it('calcula reserva percentual quando receita estimada fornecida', () => {
    const reservas: ReservaEstrategica[] = [
      { id: '1', nome: 'Investimento', valor: 0, frequencia: 'mensal', descricao: '', modo: 'percentual', percentual: 0.10 },
    ];
    const total = calcularTotalReservas(reservas, 10000);
    expect(total).toBe(1000);
  });
});

describe('calcularTotalCustosFixos', () => {
  it('soma operacionais + depreciação', () => {
    const total = calcularTotalCustosFixos(mockCustosFixos);
    // 2100 (operacionais) + 600 (depreciação) = 2700
    expect(total).toBe(2700);
  });
});

describe('calcularTotalCustosVariaveis', () => {
  it('converte e soma custos variáveis', () => {
    const total = calcularTotalCustosVariaveis(mockCustosVariaveis);
    // Material 300 + Energia 1200/12=100 = 400
    expect(total).toBe(400);
  });
});

describe('calcularPrecoMinimo', () => {
  it('calcula preço positivo para dados válidos', () => {
    const preco = calcularPrecoMinimo(mockData);
    expect(preco).toBeGreaterThan(0);
  });

  it('retorna 0 quando sessoesMeta é 0', () => {
    const data = { ...mockData, sessoesMeta: 0 };
    const preco = calcularPrecoMinimo(data);
    expect(preco).toBe(0);
  });

  it('aplica safety cap quando divisor é muito baixo', () => {
    const data = { ...mockData, margemLucro: 0.50, impostoPercentual: 0.50 };
    const preco = calcularPrecoMinimo(data);
    const custoPorSessao = calcularCustoTotalPorSessao(data);
    expect(preco).toBe(custoPorSessao * 10);
  });
});

describe('calcularMargemDoPreco', () => {
  it('retorna margem correta para preço dado', () => {
    const margem = calcularMargemDoPreco(mockData, 100);
    expect(margem).toBeGreaterThan(0);
    expect(margem).toBeLessThan(1);
  });

  it('retorna 0 para preço zero', () => {
    expect(calcularMargemDoPreco(mockData, 0)).toBe(0);
  });

  it('retorna 0 para preço negativo', () => {
    expect(calcularMargemDoPreco(mockData, -50)).toBe(0);
  });
});

describe('calcularLucroOperacional', () => {
  it('calcula lucro = receita - impostos - custos operacionais', () => {
    const lucro = calcularLucroOperacional(mockData, 100);
    const receita = 100 * 80;
    const impostos = receita * 0.06;
    const custoOp = calcularCustoOperacionalMensal(mockData);
    expect(lucro).toBeCloseTo(receita - impostos - custoOp, 2);
  });
});

describe('calcularPontoEquilibrio', () => {
  it('retorna número inteiro de sessões', () => {
    const pe = calcularPontoEquilibrio(mockData, 100);
    expect(pe).toBe(Math.ceil(pe));
    expect(pe).toBeGreaterThan(0);
  });

  it('retorna Infinity quando contribuição é zero ou negativa', () => {
    const pe = calcularPontoEquilibrio(mockData, 0);
    expect(pe).toBe(Infinity);
  });
});

describe('simularPreco', () => {
  it('retorna viavel=true quando preço cobre custos', () => {
    const result = simularPreco(mockData, 200);
    expect(result.viavel).toBe(true);
    expect(result.receitaMensal).toBe(200 * 80);
    expect(result.lucroDisponivel).toBeGreaterThan(0);
  });

  it('retorna viavel=false quando preço é muito baixo', () => {
    const result = simularPreco(mockData, 5);
    expect(result.viavel).toBe(false);
    expect(result.lucroDisponivel).toBeLessThan(0);
  });

  it('calcula impostos corretamente', () => {
    const result = simularPreco(mockData, 100);
    expect(result.impostos).toBeCloseTo(100 * 80 * 0.06, 2);
  });
});

describe('calcularPrecoServico', () => {
  it('aplica multiplicador e custo adicional', () => {
    const servico: TipoServico = {
      id: '1', nome: 'RPG', duracaoMinutos: 60,
      custoAdicional: 20, multiplicadorPreco: 1.5, descricao: '',
    };
    const precoBase = calcularPrecoMinimo(mockData);
    const preco = calcularPrecoServico(mockData, servico);
    expect(preco).toBeCloseTo(precoBase * 1.5 + 20, 2);
  });
});

describe('calcularPrecoPlano', () => {
  it('aplica desconto percentual sobre total', () => {
    const plano: PlanoTratamento = {
      id: '1', nome: 'Pacote 10', tipoServicoId: '1',
      quantidadeSessoes: 10, descontoPercentual: 10, validade: 30,
    };
    const preco = calcularPrecoPlano(100, plano);
    expect(preco).toBe(100 * 10 * 0.9);
  });

  it('sem desconto retorna total cheio', () => {
    const plano: PlanoTratamento = {
      id: '1', nome: 'Avulso', tipoServicoId: '1',
      quantidadeSessoes: 5, descontoPercentual: 0, validade: 30,
    };
    expect(calcularPrecoPlano(80, plano)).toBe(400);
  });
});

describe('métricas de trabalho', () => {
  it('calcularHorasTrabalhadas = dias × horas', () => {
    expect(calcularHorasTrabalhadas(mockData)).toBe(22 * 8);
  });

  it('calcularTaxaOcupacao baseada na capacidade', () => {
    const taxa = calcularTaxaOcupacao(mockData);
    expect(taxa).toBeCloseTo((80 / 110) * 100, 2);
  });

  it('calcularCapacidadeMaxima = dias × sessões/dia', () => {
    expect(calcularCapacidadeMaxima(mockData)).toBe(22 * 5);
  });

  it('calcularValorHora converte preço/sessão para preço/hora', () => {
    expect(calcularValorHora(mockData, 100)).toBeCloseTo(120, 2);
  });

  it('calcularValorHora retorna 0 para duração 0', () => {
    expect(calcularValorHora(mockData, 100, 0)).toBe(0);
  });

  it('sugerirSessoesPorDia calcula slots disponíveis', () => {
    expect(sugerirSessoesPorDia(8, 50)).toBe(8);
  });
});
