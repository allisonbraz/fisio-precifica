/**
 * Indicadores Page v3
 * Design: Warm Professional — Organic Modernism
 * Financial indicators and KPIs — clearer Score de Saúde explanation
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Info,
  HelpCircle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosOperacionais,
  calcularTotalDepreciacao,
  calcularTotalCustosVariaveis,
  calcularTotalReservas,
  calcularCustoTotalMensal,
  calcularPrecoMinimo,
  calcularTaxaOcupacao,
  calcularPontoEquilibrio,
  calcularValorHora,
  formatarMoeda,
  getValorMensal,
} from '@/lib/store';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

// Score descriptions for each dimension
const SCORE_DESCRIPTIONS: Record<string, { good: string; bad: string; tip: string }> = {
  'Margem de Lucro': {
    good: 'Sua margem permite reinvestir e crescer.',
    bad: 'Margem baixa — pouco espaço para imprevistos.',
    tip: 'Ideal: acima de 25%. Revise custos ou aumente preços.',
  },
  'Taxa de Ocupação': {
    good: 'Boa utilização da sua agenda.',
    bad: 'Muitos horários vagos na agenda.',
    tip: 'Ideal: acima de 65%. Invista em marketing ou parcerias.',
  },
  'Ponto de Equilíbrio': {
    good: 'Você cobre seus custos com poucas sessões.',
    bad: 'Precisa de muitas sessões para cobrir custos.',
    tip: 'Quanto menor, melhor. Reduza custos fixos para melhorar.',
  },
  'Diversificação de Serviços': {
    good: 'Boa variedade de serviços oferecidos.',
    bad: 'Poucos tipos de serviço cadastrados.',
    tip: 'Ofereça 3-5 serviços diferentes para atingir mais perfis.',
  },
  'Planos de Tratamento': {
    good: 'Planos ajudam a fidelizar pacientes.',
    bad: 'Sem planos de tratamento cadastrados.',
    tip: 'Crie planos com desconto para garantir receita recorrente.',
  },
};

export default function Indicadores() {
  const { data } = useData();

  const metrics = useMemo(() => {
    const custoOperacional = calcularTotalCustosOperacionais(data.custosFixos);
    const custoDepreciacao = calcularTotalDepreciacao(data.custosFixos);
    const custoVarTotal = calcularTotalCustosVariaveis(data.custosVariaveis);
    const totalReservas = calcularTotalReservas(data.reservasEstrategicas);
    const custoFixoTotal = custoOperacional + custoDepreciacao;
    const custoMensal = calcularCustoTotalMensal(data);
    const precoPorSessao = calcularPrecoMinimo(data);
    const taxaOcupacao = calcularTaxaOcupacao(data);
    const pontoEquilibrio = calcularPontoEquilibrio(data, precoPorSessao);
    const valorHora = calcularValorHora(data, precoPorSessao);
    const receitaPotencial = precoPorSessao * data.sessoesMeta;
    const lucroOperacional = receitaPotencial - custoMensal;
    const lucroDisponivel = lucroOperacional - totalReservas;
    const margemLiquida = receitaPotencial > 0 ? (lucroOperacional / receitaPotencial) * 100 : 0;
    const custoFixoPerc = custoMensal > 0 ? (custoFixoTotal / custoMensal) * 100 : 0;
    const custoVarPerc = custoMensal > 0 ? (custoVarTotal / custoMensal) * 100 : 0;
    const capacidadeMaxima = data.diasUteis * data.sessoesporDia;
    const horasMensais = data.diasUteis * data.horasTrabalho;
    const faturamentoPorHora = horasMensais > 0 ? receitaPotencial / horasMensais : 0;
    const custoFixoPorSessao = data.sessoesMeta > 0 ? custoFixoTotal / data.sessoesMeta : 0;
    const custoVarPorSessao = data.sessoesMeta > 0 ? custoVarTotal / data.sessoesMeta : 0;

    const custoMarketing = data.custosFixos
      .filter(c => c.nome.toLowerCase().includes('marketing'))
      .reduce((sum, c) => sum + getValorMensal(c), 0);
    const roiMarketing = custoMarketing > 0 ? ((receitaPotencial - custoMensal) / custoMarketing) * 100 : 0;

    // Score de saúde financeira (0-100)
    const scores = {
      margem: Math.min(margemLiquida / 40 * 100, 100),
      ocupacao: Math.min(taxaOcupacao / 80 * 100, 100),
      equilibrio: pontoEquilibrio !== Infinity ? Math.min((1 - pontoEquilibrio / capacidadeMaxima) * 100, 100) : 0,
      diversificacao: Math.min(data.tiposServico.length / 5 * 100, 100),
      planos: Math.min(data.planosTratamento.length / 3 * 100, 100),
    };
    const saudeFinanceira = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

    return {
      custoFixoTotal, custoVarTotal, custoMensal, precoPorSessao, taxaOcupacao,
      pontoEquilibrio, valorHora, receitaPotencial, lucroOperacional, lucroDisponivel, totalReservas, margemLiquida,
      custoFixoPerc, custoVarPerc, capacidadeMaxima, horasMensais, faturamentoPorHora,
      custoFixoPorSessao, custoVarPorSessao, roiMarketing, scores, saudeFinanceira,
    };
  }, [data]);

  const scoreItems = useMemo(() => [
    { label: 'Margem de Lucro', value: metrics.scores.margem },
    { label: 'Taxa de Ocupação', value: metrics.scores.ocupacao },
    { label: 'Ponto de Equilíbrio', value: metrics.scores.equilibrio },
    { label: 'Diversificação de Serviços', value: metrics.scores.diversificacao },
    { label: 'Planos de Tratamento', value: metrics.scores.planos },
  ], [metrics]);

  const radarData = useMemo(() => scoreItems.map(item => ({
    subject: item.label.split(' ').slice(0, 2).join(' '),
    value: item.value,
    fullMark: 100,
  })), [scoreItems]);

  const dicas = useMemo(() => {
    const tips: { icon: typeof Lightbulb; text: string; type: 'info' | 'warning' | 'success' }[] = [];

    if (metrics.taxaOcupacao < 50) {
      tips.push({ icon: AlertTriangle, text: 'Sua taxa de ocupação está baixa. Considere investir em marketing ou reduzir os dias de trabalho.', type: 'warning' });
    }
    if (metrics.margemLiquida < 15) {
      tips.push({ icon: AlertTriangle, text: 'Margem abaixo de 15% é arriscada. Revise seus custos ou aumente o preço para ter mais segurança.', type: 'warning' });
    } else if (metrics.margemLiquida < 30) {
      tips.push({ icon: Lightbulb, text: 'Sua margem está na faixa saudável (15-30%). Para crescer com mais segurança, busque chegar acima de 30%.', type: 'info' });
    }
    if (data.planosTratamento.length === 0) {
      tips.push({ icon: Lightbulb, text: 'Crie planos de tratamento com desconto para fidelizar pacientes e garantir receita recorrente.', type: 'info' });
    }
    if (data.tiposServico.length <= 2) {
      tips.push({ icon: Lightbulb, text: 'Diversifique seus serviços para atingir diferentes perfis de pacientes.', type: 'info' });
    }
    if (metrics.custoFixoPerc > 80) {
      tips.push({ icon: AlertTriangle, text: 'Seus custos fixos representam mais de 80% do total. Tente negociar ou reduzir.', type: 'warning' });
    }
    if (metrics.saudeFinanceira > 70) {
      tips.push({ icon: CheckCircle2, text: 'Boa saúde financeira! Continue monitorando seus indicadores.', type: 'success' });
    }

    return tips;
  }, [metrics, data]);

  // Determine score color and label
  const getScoreColor = (value: number) => {
    if (value >= 70) return '#7c9a82';
    if (value >= 40) return '#d4a853';
    return '#c2785c';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 70) return 'Saudável';
    if (value >= 40) return 'Regular';
    return 'Crítico';
  };

  const getScoreEmoji = (value: number) => {
    if (value >= 70) return '🟢';
    if (value >= 40) return '🟡';
    return '🔴';
  };

  const getBarColor = (value: number) => {
    if (value >= 70) return 'bg-sage';
    if (value >= 40) return 'bg-golden';
    return 'bg-destructive/70';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicadores Financeiros"
        description="Acompanhe a saúde financeira do seu consultório"
        icon={Target}
      />

      {/* Health Score — IMPROVED CLARITY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-heading font-semibold text-foreground">Score de Saúde Financeira</h3>
              <UITooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs text-xs">
                  <p className="font-medium mb-1">Como funciona?</p>
                  <p>O score é a média de 5 indicadores, cada um pontuado de 0 a 100. Quanto mais próximo de 100, melhor a saúde financeira do seu consultório.</p>
                </TooltipContent>
              </UITooltip>
            </div>

            {/* Explanation box */}
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 mb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este score avalia <strong className="text-foreground">5 dimensões</strong> do seu negócio: margem de lucro, ocupação da agenda, facilidade para cobrir custos, variedade de serviços e planos de tratamento. Cada dimensão vale até 100 pontos. O resultado final é a média.
              </p>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1">🟢 70-100 = Saudável</span>
                <span className="flex items-center gap-1">🟡 40-69 = Regular</span>
                <span className="flex items-center gap-1">🔴 0-39 = Crítico</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e0d8" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={getScoreColor(metrics.saudeFinanceira)}
                    strokeWidth="8"
                    strokeDasharray={`${metrics.saudeFinanceira * 2.64} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-heading font-bold">{Math.round(metrics.saudeFinanceira)}</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
                  {getScoreEmoji(metrics.saudeFinanceira)} {getScoreLabel(metrics.saudeFinanceira)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {metrics.saudeFinanceira >= 70
                    ? 'Seus indicadores estão saudáveis. Continue monitorando!'
                    : metrics.saudeFinanceira >= 40
                    ? 'Há pontos de melhoria. Veja as dimensões abaixo.'
                    : 'Atenção! Revise seus custos e preços com urgência.'}
                </p>
              </div>
            </div>

            {/* Score breakdown with descriptions */}
            <div className="space-y-4">
              {scoreItems.map((item) => {
                const desc = SCORE_DESCRIPTIONS[item.label];
                const isGood = item.value >= 60;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium flex items-center gap-1.5">
                        {getScoreEmoji(item.value)} {item.label}
                      </span>
                      <span className="font-mono font-medium">{Math.round(item.value)}/100</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getBarColor(item.value)}`}
                        style={{ width: `${Math.max(item.value, 2)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isGood ? desc?.good : desc?.bad} <span className="text-primary/80">{desc?.tip}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e0d8" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#8a7e74' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#c2785c"
                  fill="#c2785c"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Faturamento/Hora" value={formatarMoeda(metrics.faturamentoPorHora)} subtitle={`${metrics.horasMensais}h/mês trabalhadas`} icon={Clock} variant="primary" />
        <StatCard title="Margem Líquida" value={`${metrics.margemLiquida.toFixed(1)}%`} subtitle={metrics.margemLiquida >= 30 ? 'Excelente' : metrics.margemLiquida >= 15 ? 'Saudável' : 'Arriscada'} icon={Percent} variant={metrics.margemLiquida >= 15 ? 'success' : 'warning'} />
        <StatCard title="Capacidade Máxima" value={`${metrics.capacidadeMaxima} sessões`} subtitle={`${data.diasUteis} dias × ${data.sessoesporDia} sessões`} icon={Users} variant="default" />
        <StatCard title="Custo Fixo/Sessão" value={formatarMoeda(metrics.custoFixoPorSessao)} subtitle={`${metrics.custoFixoPerc.toFixed(0)}% do custo total`} icon={DollarSign} variant="default" />
      </div>

      {/* Cost Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-4">Estrutura de Custos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Custos Fixos</span>
              <span className="font-mono font-medium text-terracotta">{metrics.custoFixoPerc.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-terracotta rounded-full transition-all" style={{ width: `${metrics.custoFixoPerc}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{formatarMoeda(metrics.custoFixoTotal)} por mês</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Custos Variáveis</span>
              <span className="font-mono font-medium text-golden">{metrics.custoVarPerc.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-golden rounded-full transition-all" style={{ width: `${metrics.custoVarPerc}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{formatarMoeda(metrics.custoVarTotal)} por mês</p>
          </div>
        </div>
      </motion.div>

      {/* Tips */}
      {dicas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-heading font-semibold text-foreground">Dicas e Recomendações</h3>
          {dicas.map((dica, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                dica.type === 'warning' ? 'bg-golden-light/20 border-golden/30' :
                dica.type === 'success' ? 'bg-sage-light/20 border-sage/30' :
                'bg-primary/5 border-primary/20'
              }`}
            >
              <dica.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                dica.type === 'warning' ? 'text-golden' :
                dica.type === 'success' ? 'text-sage-dark' :
                'text-primary'
              }`} />
              <p className="text-sm text-foreground">{dica.text}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
