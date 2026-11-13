import { perfilFisioterapia } from '@shared/pricing-engine';

/** Terminologia padronizada — vem do perfil de fisioterapia, sem mudar o texto. */
export const LABELS = perfilFisioterapia.rotulos;

export const REGIMES_TRIBUTARIOS = perfilFisioterapia.regimes;

export const MARGIN_BANDS = {
  risky: { max: 0.10, label: 'Arriscada', desc: 'Abaixo de 10% — pouca folga para imprevistos' },
  healthy: { max: 0.20, label: 'Saudável', desc: 'Entre 10% e 20% — margem equilibrada' },
  comfortable: { max: 0.30, label: 'Confortável', desc: 'Entre 20% e 30% — boa reserva de segurança' },
  excellent: { max: 1, label: 'Excelente', desc: 'Acima de 30% — verifique se o preço é competitivo' },
} as const;

export const OCCUPANCY_BENCHMARKS = {
  low: { max: 40, label: 'Abaixo do equilíbrio', action: 'Urgente: captar pacientes' },
  growing: { max: 60, label: 'Lucrativo, subutilizado', action: 'Crescer com marketing' },
  healthy: { max: 75, label: 'Operação saudável', action: 'Otimizar agenda' },
  strong: { max: 85, label: 'Alta performance', action: 'Considerar aumento de preço' },
  full: { max: 100, label: 'Quase no limite', action: 'Expandir ou aumentar preço' },
} as const;
