import type { ParametroLacuna, PricingProfile, RotulosPrecificacao } from '../profile';

const rotulosComuns: RotulosPrecificacao = {
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
};

function lacuna(motivo: string): ParametroLacuna {
  return { status: 'lacuna', marcador: '🔴 LACUNA', valor: null, motivo };
}

/** Parâmetros numéricos que este repositório não documenta para a profissão. */
export function parametrosEmLacuna(profissao: string) {
  const motivo = `🔴 LACUNA: ${profissao} não tem esse número no FisioPrecifica. Não reutilizar o valor da fisioterapia.`;
  return {
    sessoesMeta: lacuna(motivo),
    margemLucro: lacuna(motivo),
    impostoPercentual: lacuna(motivo),
    horasTrabalho: lacuna(motivo),
    diasUteis: lacuna(motivo),
    sessoesporDia: lacuna(motivo),
    duracaoPadraoMinutos: lacuna(motivo),
  };
}

export const lacunasDeCatalogo = [
  '🔴 LACUNA: tipos de sessão e durações típicas.',
  '🔴 LACUNA: custos fixos, variáveis e reservas típicos, inclusive anuidade do conselho.',
  '🔴 LACUNA: alíquota efetiva e regime sugerido.',
  '🔴 LACUNA: meta de sessões, horas, dias úteis e sessões por dia.',
  '🔴 LACUNA: o intervalo de 10 minutos entre sessões continua só na fórmula compartilhada, não neste perfil.',
] as const;

export function perfilIncompleto(
  id: PricingProfile['id'],
  nome: string,
  nomeProfissional: string,
  conselhoSigla: string,
  apelidos: readonly string[] = [],
): PricingProfile {
  return {
    id,
    nome,
    nomeProfissional,
    apelidos,
    catalogoCompleto: false,
    conselho: { sigla: conselhoSigla, nomeLinhaCusto: null },
    parametros: parametrosEmLacuna(nome),
    regimeSugerido: null,
    regimes: [],
    rotulos: rotulosComuns,
    custosFixos: [],
    depreciacao: [],
    custosVariaveis: [],
    reservas: [],
    tiposServico: [],
    lacunas: lacunasDeCatalogo,
  };
}
