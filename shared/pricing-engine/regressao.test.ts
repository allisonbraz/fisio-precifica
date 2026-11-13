import { describe, expect, it } from 'vitest';
import {
  calcularPontoEquilibrio,
  calcularPrecoMinimo,
  calcularPrecoPisoOperacional,
  calcularPrecoPlano,
  calcularPrecoServico,
  calcularPrecoSustentavel,
  calcularTaxaOcupacao,
  metaDeSessoesEhViavel,
  simularPreco,
  sugerirSessoesPorDia,
} from './calculate';
import type { DadosPrecificacao } from './types';

/**
 * Números congelados do motor que estava em client/src/lib/calculations.ts
 * antes da extração (sha b6fae7d). Se a fórmula mudar, este teste quebra.
 */
const casoBase = {
  custosFixos: [
    { id: '1', nome: 'Aluguel', valor: 2000, frequencia: 'mensal', observacao: '', descricao: '', isDepreciacao: false },
    { id: '2', nome: 'CREFITO', valor: 1200, frequencia: 'anual', observacao: '', descricao: '', isDepreciacao: false },
    { id: '3', nome: 'Equipamento', valor: 600, frequencia: 'mensal', observacao: '', descricao: '', isDepreciacao: true, temParcelaAtiva: false },
  ],
  custosVariaveis: [
    { id: '1', nome: 'Material', valor: 300, frequencia: 'mensal', observacao: '', descricao: '' },
    { id: '2', nome: 'Energia', valor: 1200, frequencia: 'anual', observacao: '', descricao: '' },
  ],
  reservasEstrategicas: [
    { id: '1', nome: 'Emergência', valor: 500, frequencia: 'mensal', descricao: '' },
    { id: '2', nome: 'Férias', valor: 6000, frequencia: 'anual', descricao: '' },
  ],
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
} as DadosPrecificacao;

const casoCircular = {
  ...casoBase,
  custosFixos: [{ id: 'f', nome: 'Fixo', valor: 1000, frequencia: 'mensal', observacao: '', descricao: '' }],
  custosVariaveis: [],
  reservasEstrategicas: [{ id: 'r', nome: 'Reserva', valor: 0, frequencia: 'mensal', modo: 'percentual', percentual: 0.10, descricao: '' }],
  sessoesMeta: 10,
  impostoPercentual: 0.10,
  margemLucro: 0.20,
  sessoesporDia: 8,
} as DadosPrecificacao;

describe('regressão do motor extraído', () => {
  it('repete o piso, o sustentável e o estratégico do caso base', () => {
    expect(calcularPrecoPisoOperacional(casoBase)).toBeCloseTo(41.22340425531915, 8);
    expect(calcularPrecoSustentavel(casoBase)).toBeCloseTo(54.52127659574468, 8);
    expect(calcularPrecoMinimo(casoBase)).toBeCloseTo(64.87341772151899, 8);
  });

  it('repete equilíbrio, ocupação, intervalo de 10 min e simulação', () => {
    const estrategico = calcularPrecoMinimo(casoBase);
    expect(calcularPontoEquilibrio(casoBase, estrategico)).toBe(68);
    expect(calcularTaxaOcupacao(casoBase)).toBeCloseTo(72.72727272727273, 8);
    expect(sugerirSessoesPorDia(8, 50)).toBe(8);
    expect(simularPreco(casoBase, 100).margem).toBeCloseTo(42.75, 8);
    expect(metaDeSessoesEhViavel(casoBase)).toBe(true);
  });

  it('repete o denominador sem circularidade, o teto e a meta inviável', () => {
    expect(calcularPrecoMinimo(casoCircular)).toBeCloseTo(166.66666666666669, 8);
    expect(calcularPrecoMinimo({ ...casoBase, margemLucro: 0.50, impostoPercentual: 0.50 })).toBeCloseTo(512.5, 8);
    expect(calcularPrecoMinimo({ ...casoBase, sessoesMeta: 999 })).toBe(0);
  });

  it('repete preço de serviço e de plano', () => {
    expect(calcularPrecoServico(casoBase, {
      id: '1',
      nome: 'Domiciliar',
      duracaoMinutos: 60,
      custoAdicional: 30,
      multiplicadorPreco: 1.8,
      descricao: '',
    })).toBeCloseTo(146.7721518987342, 8);
    expect(calcularPrecoPlano(100, {
      id: 'p',
      nome: 'Pacote',
      tipoServicoId: '1',
      quantidadeSessoes: 10,
      descontoPercentual: 10,
      validade: 3,
    })).toBe(900);
  });
});
