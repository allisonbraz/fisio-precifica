/** Terminologia padronizada — importar em vez de usar strings hardcoded */
export const LABELS = {
  custoTotalMensal: 'Custo Total Mensal',
  custoOperacionalMensal: 'Custo Operacional Mensal',
  custoPorSessao: 'Custo por Sessão',
  precoPorSessao: 'Preço por Sessão',
  receitaBruta: 'Receita Bruta Estimada',
  receitaLiquida: 'Receita Líquida',
  impostos: 'Impostos sobre Receita',
  lucroOperacional: 'Lucro Operacional',
  lucroDisponivel: 'Lucro Disponível',
  sessoesMeta: 'Meta de Sessões/Mês',
  sessoesRealizadas: 'Sessões Realizadas',
  taxaOcupacao: 'Taxa de Ocupação',
  pontoEquilibrio: 'Ponto de Equilíbrio',
  valorHora: 'Valor por Hora',
  margemLucro: 'Margem de Lucro',
  reservasEstrategicas: 'Reservas Estratégicas',
  custoFixo: 'Custos Fixos',
  custoVariavel: 'Custos Variáveis',
  depreciacao: 'Depreciação',
} as const;

export const REGIMES_TRIBUTARIOS = [
  { value: 'mei', label: 'MEI', imposto: 0.05, desc: 'Microempreendedor Individual — DAS fixo mensal (~5%)' },
  { value: 'simples', label: 'Simples Nacional', imposto: 0.06, desc: 'Anexo III — alíquota inicial de 6%' },
  { value: 'presumido', label: 'Lucro Presumido', imposto: 0.1433, desc: 'ISS + PIS + COFINS + IRPJ + CSLL (~14,33%)' },
  { value: 'autonomo', label: 'Autônomo PF', imposto: 0.15, desc: 'Carnê-leão — IRPF faixa média (~15%)' },
  { value: 'personalizado', label: 'Personalizado', imposto: 0, desc: 'Defina sua alíquota manualmente' },
] as const;

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
