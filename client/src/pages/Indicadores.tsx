/**
 * Indicadores Page v2
 * Design: Warm Professional — Organic Modernism
 * Financial indicators and KPIs — replaced "pacote" with "plano de tratamento"
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
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
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

export default function Indicadores() {
  const { data } = useData();

  const metrics = useMemo(() => {
    const custoFixoTotal = calcularTotalCustosFixos(data.custosFixos);
    const custoVarTotal = calcularTotalCustosVariaveis(data.custosVariaveis);
    const custoMensal = calcularCustoTotalMensal(data);
    const precoMinimo = calcularPrecoMinimo(data);
    const taxaOcupacao = calcularTaxaOcupacao(data);
    const pontoEquilibrio = calcularPontoEquilibrio(data, precoMinimo);
    const valorHora = calcularValorHora(data, precoMinimo);
    const receitaPotencial = precoMinimo * data.sessoesMeta;
    const lucroPotencial = receitaPotencial - custoMensal;
    const margemLiquida = receitaPotencial > 0 ? (lucroPotencial / receitaPotencial) * 100 : 0;
    const custoFixoPerc = custoMensal > 0 ? (custoFixoTotal / custoMensal) * 100 : 0;
    const custoVarPerc = custoMensal > 0 ? (custoVarTotal / custoMensal) * 100 : 0;
    const capacidadeMaxima = data.diasUteis * data.sessoesporDia;
    const horasMensais = data.diasUteis * data.horasTrabalho;
    const faturamentoPorHora = horasMensais > 0 ? receitaPotencial / horasMensais : 0;
    const custoFixoPorSessao = data.sessoesMeta > 0 ? custoFixoTotal / data.sessoesMeta : 0;
    const custoVarPorSessao = data.sessoesMeta > 0 ? custoVarTotal / data.sessoesMeta : 0;

    // ROI do marketing
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
      custoFixoTotal, custoVarTotal, custoMensal, precoMinimo, taxaOcupacao,
      pontoEquilibrio, valorHora, receitaPotencial, lucroPotencial, margemLiquida,
      custoFixoPerc, custoVarPerc, capacidadeMaxima, horasMensais, faturamentoPorHora,
      custoFixoPorSessao, custoVarPorSessao, roiMarketing, scores, saudeFinanceira,
    };
  }, [data]);

  const radarData = useMemo(() => [
    { subject: 'Margem', value: metrics.scores.margem, fullMark: 100 },
    { subject: 'Ocupação', value: metrics.scores.ocupacao, fullMark: 100 },
    { subject: 'Equilíbrio', value: metrics.scores.equilibrio, fullMark: 100 },
    { subject: 'Serviços', value: metrics.scores.diversificacao, fullMark: 100 },
    { subject: 'Planos', value: metrics.scores.planos, fullMark: 100 },
  ], [metrics]);

  const dicas = useMemo(() => {
    const tips: { icon: typeof Lightbulb; text: string; type: 'info' | 'warning' | 'success' }[] = [];

    if (metrics.taxaOcupacao < 50) {
      tips.push({ icon: AlertTriangle, text: 'Sua taxa de ocupação está baixa. Considere investir em marketing ou reduzir os dias de trabalho.', type: 'warning' });
    }
    if (metrics.margemLiquida < 20) {
      tips.push({ icon: AlertTriangle, text: 'Sua margem está abaixo de 20%. Revise seus custos ou aumente o preço.', type: 'warning' });
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indicadores Financeiros"
        description="Acompanhe a saúde financeira do seu consultório"
        icon={Target}
      />

      {/* Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-2">Score de Saúde Financeira</h3>
            <p className="text-sm text-muted-foreground mb-4">Avaliação geral baseada nos seus indicadores</p>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e0d8" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={metrics.saudeFinanceira >= 70 ? '#7c9a82' : metrics.saudeFinanceira >= 40 ? '#d4a853' : '#c2785c'}
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
                <p className="text-lg font-heading font-semibold text-foreground">
                  {metrics.saudeFinanceira >= 70 ? 'Bom' : metrics.saudeFinanceira >= 40 ? 'Regular' : 'Atenção'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {metrics.saudeFinanceira >= 70
                    ? 'Seus indicadores estão saudáveis'
                    : metrics.saudeFinanceira >= 40
                    ? 'Há pontos de melhoria'
                    : 'Revise seus custos e preços'}
                </p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="space-y-3">
              {[
                { label: 'Margem de Lucro', value: metrics.scores.margem },
                { label: 'Taxa de Ocupação', value: metrics.scores.ocupacao },
                { label: 'Ponto de Equilíbrio', value: metrics.scores.equilibrio },
                { label: 'Diversificação de Serviços', value: metrics.scores.diversificacao },
                { label: 'Planos de Tratamento', value: metrics.scores.planos },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-mono font-medium">{Math.round(item.value)}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e0d8" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#8a7e74' }} />
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
        <StatCard title="Margem Líquida" value={`${metrics.margemLiquida.toFixed(1)}%`} subtitle={metrics.margemLiquida >= 20 ? 'Saudável' : 'Abaixo do ideal'} icon={Percent} variant={metrics.margemLiquida >= 20 ? 'success' : 'warning'} />
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
