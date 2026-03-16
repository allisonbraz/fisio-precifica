import type { DadosPrecificacao } from './types';

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(valor / 100);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function exportarDados(data: DadosPrecificacao): string {
  return JSON.stringify(data, null, 2);
}

export function importarDados(json: string): DadosPrecificacao | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed.custosFixos && parsed.custosVariaveis) {
      return parsed as DadosPrecificacao;
    }
  } catch (e) {
    console.error('Erro ao importar dados:', e);
  }
  return null;
}
