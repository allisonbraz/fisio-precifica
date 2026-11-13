import { describe, expect, it } from 'vitest';
import * as motorDoApp from './calculations';
import * as motorCompartilhado from '@shared/pricing-engine';
import type { DadosPrecificacao } from './types';

const documento = {
  custosFixos: [
    { id: '1', nome: 'Aluguel', valor: 1500, frequencia: 'mensal', observacao: '', descricao: '' },
    { id: 'dep1', nome: 'Maca', valor: 120, frequencia: 'mensal', observacao: '', descricao: '', isDepreciacao: true, temParcelaAtiva: true },
  ],
  custosVariaveis: [
    { id: '1', nome: 'Descartável', valor: 4, frequencia: 'mensal', modo: 'por_sessao', observacao: '', descricao: '' },
    { id: '2', nome: 'Cartão', valor: 0, frequencia: 'mensal', modo: 'percentual_receita', percentual: 0.03, observacao: '', descricao: '' },
  ],
  reservasEstrategicas: [
    { id: 'r1', nome: 'Emergência', valor: 200, frequencia: 'mensal', descricao: '' },
  ],
  sessoesMeta: 60,
  margemLucro: 0.2,
  impostoPercentual: 0.06,
  precoDefinido: 140,
  tiposServico: [],
  planosTratamento: [],
  registrosMensais: [],
  horasTrabalho: 6,
  diasUteis: 20,
  sessoesporDia: 6,
  duracaoPadraoMinutos: 50,
  regimeTributario: 'simples',
} as DadosPrecificacao;

describe('o app e o módulo compartilhado', () => {
  it('devolvem os mesmos números para o mesmo documento', () => {
    expect(motorDoApp.calcularPrecoPisoOperacional(documento)).toBe(
      motorCompartilhado.calcularPrecoPisoOperacional(documento),
    );
    expect(motorDoApp.calcularPrecoSustentavel(documento)).toBe(
      motorCompartilhado.calcularPrecoSustentavel(documento),
    );
    expect(motorDoApp.calcularPrecoEstrategico(documento)).toBe(
      motorCompartilhado.calcularPrecoEstrategico(documento),
    );
    expect(motorDoApp.calcularPrecoMinimo(documento)).toBe(
      motorCompartilhado.calcularPrecoMinimo(documento),
    );
    expect(motorDoApp.simularPreco(documento, 140)).toEqual(
      motorCompartilhado.simularPreco(documento, 140),
    );
    expect(motorDoApp.calcularPontoEquilibrio(documento, 140)).toBe(
      motorCompartilhado.calcularPontoEquilibrio(documento, 140),
    );
    expect(motorDoApp.sugerirSessoesPorDia(6, 45)).toBe(
      motorCompartilhado.sugerirSessoesPorDia(6, 45),
    );
    expect(motorDoApp.calcularValorHora(documento, 140)).toBe(
      motorCompartilhado.calcularValorHora(documento, 140),
    );
  });
});
