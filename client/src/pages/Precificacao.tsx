/**
 * Precificação Page v5
 * Fórmula correta: Preço = Custo / (1 - margem - imposto)
 * Margem sobre RECEITA (não markup sobre custo)
 * Reservas incluídas no custo base
 * Regime tributário configurável
 * Duração de sessão configurável
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  CheckCircle2,
  Info,
  TrendingUp,
  ArrowLeftRight,
  AlertTriangle,
  Clock,
  Calendar,
  Target,
  Download,
  Building2,
  Timer,
} from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import CurrencyInput from '@/components/CurrencyInput';
import { useData } from '@/contexts/DataContext';
import { useMetrics } from '@/lib/useMetrics';
import {
  calcularCustoTotalPorSessao,
  calcularMargemDoPreco,
  sugerirSessoesPorDia,
  formatarMoeda,
} from '@/lib/store';
import { REGIMES_TRIBUTARIOS } from '@/lib/labels';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '@/lib/utils';
import { toast } from 'sonner';

function getMarginBand(marginPercent: number): { label: string; color: string; bgColor: string; icon: typeof CheckCircle2; description: string } {
  if (marginPercent < 10) {
    return {
      label: 'Margem Arriscada',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10 border-destructive/30',
      icon: AlertTriangle,
      description: 'Abaixo de 10% — pouca margem para imprevistos.',
    };
  }
  if (marginPercent <= 20) {
    return {
      label: 'Margem Saudável',
      color: 'text-golden',
      bgColor: 'bg-golden/10 border-golden/30',
      icon: CheckCircle2,
      description: 'Entre 10% e 20% — margem equilibrada para a maioria dos cenários.',
    };
  }
  if (marginPercent <= 30) {
    return {
      label: 'Margem Confortável',
      color: 'text-sage-dark',
      bgColor: 'bg-sage-light/30 border-sage/30',
      icon: CheckCircle2,
      description: 'Entre 20% e 30% — boa reserva de segurança para crescer.',
    };
  }
  return {
    label: 'Margem Excelente',
    color: 'text-sage-dark',
    bgColor: 'bg-sage-light/30 border-sage/30',
    icon: CheckCircle2,
    description: 'Acima de 30% — verifique se o preço é competitivo na sua região.',
  };
}

const DURACOES = [
  { value: 30, label: '30 min' },
  { value: 40, label: '40 min' },
  { value: 50, label: '50 min' },
  { value: 60, label: '60 min' },
];

export default function Precificacao() {
  const {
    data,
    isRegistered,
    updateSessoesMeta,
    updateMargemLucro,
    updatePrecoDefinido,
    updateDiasUteis,
    updateSessoesporDia,
    updateHorasTrabalho,
    updateDuracaoPadrao,
    updateRegimeTributario,
    updateImpostoPercentual,
  } = useData();

  const [activeMode, setActiveMode] = useState<'margem' | 'preco'>('margem');
  const [fromSimulation, setFromSimulation] = useState(false);
  const [simulationPrice, setSimulationPrice] = useState(0);

  const metrics = useMetrics(data);

  // Read price from URL (coming from Simulação page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const precoParam = params.get('preco');
    if (precoParam) {
      const preco = parseFloat(precoParam);
      if (!isNaN(preco) && preco >= 30 && preco <= 9999) {
        setFromSimulation(true);
        setSimulationPrice(preco);
        window.history.replaceState({}, '', '/precificacao');
      }
    }
  }, []);

  const confirmSimulationPrice = useCallback(() => {
    handlePrecoChange(simulationPrice);
    setFromSimulation(false);
    toast.success('Preço da simulação aplicado!');
  }, [simulationPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const discardSimulationPrice = useCallback(() => {
    setFromSimulation(false);
  }, []);

  const margemPercent = data.margemLucro * 100;
  const marginBand = getMarginBand(margemPercent);
  const MarginIcon = marginBand.icon;

  const handleMargemChange = useCallback((margem: number) => {
    if (!isRegistered) { toast.error('Faça login para editar'); return; }
    setActiveMode('margem');
    const newMargem = margem / 100;
    updateMargemLucro(newMargem);
    // Recalculate price from new margin
    const custoPorSessao = calcularCustoTotalPorSessao(data);
    const divisor = 1 - newMargem - data.impostoPercentual;
    if (divisor > 0.05) {
      const newPrice = custoPorSessao / divisor;
      updatePrecoDefinido(Math.round(newPrice * 100) / 100);
    }
  }, [data, isRegistered, updateMargemLucro, updatePrecoDefinido]);

  const handlePrecoChange = useCallback((preco: number) => {
    if (!isRegistered) { toast.error('Faça login para editar'); return; }
    setActiveMode('preco');
    updatePrecoDefinido(preco);
    const newMargem = calcularMargemDoPreco(data, preco);
    updateMargemLucro(Math.max(0, Math.min(newMargem, 0.80)));
  }, [data, isRegistered, updatePrecoDefinido, updateMargemLucro]);

  const sessaoSugerida = sugerirSessoesPorDia(data.horasTrabalho, data.duracaoPadraoMinutos);

  const breakdownData = useMemo(() => [
    { name: 'Custo Fixo', valor: metrics.custoFixoSessao, fill: '#b5725d' },
    { name: 'Custo Variável', valor: metrics.custoVarSessao, fill: '#d4a853' },
    { name: 'Reservas', valor: metrics.reservaSessao, fill: '#8b7355' },
    { name: 'Impostos', valor: metrics.impostoPorSessao, fill: '#a0a0a0' },
    { name: 'Lucro', valor: Math.max(0, metrics.lucroPorSessao), fill: '#7c9a82' },
  ], [metrics]);

  const isAbaixoCusto = data.precoDefinido > 0 && data.precoDefinido < metrics.custoTotalSessao;
  const peOcupacao = metrics.capacidadeMaxima > 0
    ? ((metrics.pontoEquilibrio / metrics.capacidadeMaxima) * 100).toFixed(0)
    : '—';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cálculo de Precificação"
        description="Defina o preço ideal com base nos seus custos reais, impostos e margem de lucro"
        icon={Calculator}
      />

      {/* Simulation import banner */}
      {fromSimulation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">
              Preço de <strong>{formatarMoeda(simulationPrice)}</strong> importado da Simulação.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={confirmSimulationPrice} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              Confirmar
            </button>
            <button onClick={discardSimulationPrice} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground">
              Descartar
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Parameters */}
        <div className="lg:col-span-1 space-y-4">
          {!isRegistered && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
              Faça login para editar os campos abaixo.
            </div>
          )}

          {/* Regime Tributário */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">Regime Tributário</h3>
            </div>

            <Select
              value={data.regimeTributario}
              onValueChange={(v) => {
                if (!isRegistered) { toast.error('Faça login para editar'); return; }
                const regime = REGIMES_TRIBUTARIOS.find(r => r.value === v);
                if (regime) {
                  updateRegimeTributario(v, v === 'personalizado' ? data.impostoPercentual : regime.imposto);
                }
              }}
              disabled={!isRegistered}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIMES_TRIBUTARIOS.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label} ({(r.value === 'personalizado' ? data.impostoPercentual * 100 : r.imposto * 100).toFixed(0)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-[11px] text-muted-foreground">
              {REGIMES_TRIBUTARIOS.find(r => r.value === data.regimeTributario)?.desc}
            </p>

            {data.regimeTributario === 'personalizado' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Alíquota (%)</label>
                <Input
                  type="number"
                  value={(data.impostoPercentual * 100).toFixed(1)}
                  onChange={(e) => {
                    if (!isRegistered) return;
                    const val = parseFloat(e.target.value) || 0;
                    updateImpostoPercentual(Math.max(0, Math.min(val / 100, 0.50)));
                  }}
                  className="rounded-xl font-mono text-sm"
                  min={0}
                  max={50}
                  step={0.5}
                  disabled={!isRegistered}
                />
              </div>
            )}

            <div className="p-2 rounded-lg bg-muted/30 text-[11px] text-muted-foreground">
              Imposto de {(data.impostoPercentual * 100).toFixed(1)}% será embutido no preço.
              <br />
              <span className="text-[10px] italic">Valores estimados. Consulte seu contador.</span>
            </div>
          </motion.div>

          {/* Jornada de Trabalho + Duração */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">Jornada de Trabalho</h3>
            </div>

            {/* Duração da sessão */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Timer className="w-3 h-3" /> Duração da sessão
              </label>
              <Select
                value={String(data.duracaoPadraoMinutos)}
                onValueChange={(v) => {
                  if (!isRegistered) { toast.error('Faça login para editar'); return; }
                  updateDuracaoPadrao(parseInt(v));
                }}
                disabled={!isRegistered}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURACOES.map(d => (
                    <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  Horas/dia
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent><p className="max-w-[200px] text-xs">Quantas horas por dia você dedica a atendimentos</p></TooltipContent>
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  value={data.horasTrabalho}
                  onChange={(e) => {
                    if (!isRegistered) { toast.error('Faça login para editar'); return; }
                    updateHorasTrabalho(Math.max(1, parseInt(e.target.value) || 0));
                  }}
                  className="rounded-xl font-mono text-sm"
                  min={1} max={16} disabled={!isRegistered}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  Dias úteis/mês
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent><p className="max-w-[200px] text-xs">Dias que você atende por mês</p></TooltipContent>
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  value={data.diasUteis}
                  onChange={(e) => {
                    if (!isRegistered) { toast.error('Faça login para editar'); return; }
                    updateDiasUteis(Math.max(1, parseInt(e.target.value) || 0));
                  }}
                  className="rounded-xl font-mono text-sm"
                  min={1} max={31} disabled={!isRegistered}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                Sessões por dia (capacidade)
              </label>
              <Input
                type="number"
                value={data.sessoesporDia}
                onChange={(e) => {
                  if (!isRegistered) { toast.error('Faça login para editar'); return; }
                  updateSessoesporDia(Math.max(1, parseInt(e.target.value) || 0));
                }}
                className="rounded-xl font-mono text-sm"
                min={1} max={20} disabled={!isRegistered}
              />
              {sessaoSugerida !== data.sessoesporDia && sessaoSugerida > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Sugestão: {sessaoSugerida} sessões/dia (sessão de {data.duracaoPadraoMinutos}min + 10min transição em {data.horasTrabalho}h)
                </p>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-muted/30 text-xs text-muted-foreground space-y-0.5">
              <p><Calendar className="w-3 h-3 inline mr-1" />{data.horasTrabalho * data.diasUteis}h/mês trabalhadas</p>
              <p><Target className="w-3 h-3 inline mr-1" />Capacidade máxima: {metrics.capacidadeMaxima} sessões/mês</p>
            </div>
          </motion.div>

          {/* Meta de sessões */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl border border-border p-5 space-y-4"
          >
            <h3 className="font-heading font-semibold text-foreground">Meta de Sessões</h3>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  Sessões por mês
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent><p className="max-w-[200px] text-xs">Meta realista de pacientes. Recomendado: 65-75% da capacidade</p></TooltipContent>
                  </Tooltip>
                </label>
                <span className="text-sm font-mono font-medium text-primary">{data.sessoesMeta}</span>
              </div>
              <Slider
                value={[data.sessoesMeta]}
                onValueChange={([v]) => {
                  if (!isRegistered) { toast.error('Faça login para editar'); return; }
                  updateSessoesMeta(v);
                }}
                min={1}
                max={Math.max(metrics.capacidadeMaxima, data.sessoesMeta)}
                step={1}
                className="my-3"
                disabled={!isRegistered}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>{metrics.capacidadeMaxima} (máx)</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Ocupação: {metrics.taxaOcupacao.toFixed(0)}% — {
                  metrics.taxaOcupacao < 60 ? 'Considere preencher mais a agenda' :
                  metrics.taxaOcupacao <= 80 ? 'Faixa saudável' :
                  'Próximo da capacidade máxima'
                }
              </p>
            </div>
          </motion.div>

          {/* Dual Pricing Mode */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-5 space-y-5"
          >
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">Modo de Precificação</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Ajuste a margem de lucro <strong>ou</strong> defina o preço diretamente. Os dois campos estão vinculados.
            </p>

            {/* Margem de lucro */}
            <div className={`p-3 rounded-xl border transition-colors ${activeMode === 'margem' ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Margem de lucro</label>
                <span className="text-sm font-mono font-medium text-primary">{margemPercent.toFixed(0)}%</span>
              </div>
              <Slider
                value={[margemPercent]}
                onValueChange={([v]) => handleMargemChange(v)}
                min={0}
                max={50}
                step={1}
                className="my-3"
                disabled={!isRegistered}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
              </div>

              {/* Educational explanation */}
              <div className="mt-2 p-2 rounded-lg bg-muted/30 text-[11px] text-muted-foreground">
                <strong className="text-foreground">Margem de {margemPercent.toFixed(0)}%</strong> = de cada {formatarMoeda(100)} que você recebe, {formatarMoeda(margemPercent)} é lucro líquido.
              </div>

              {/* Margin Band Indicator */}
              <div className={`mt-3 flex items-start gap-2 p-2.5 rounded-lg border ${marginBand.bgColor}`}>
                <MarginIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${marginBand.color}`} />
                <div>
                  <p className={`text-xs font-semibold ${marginBand.color}`}>{marginBand.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{marginBand.description}</p>
                </div>
              </div>
            </div>

            {/* Preço definido */}
            <div className={`p-3 rounded-xl border transition-colors ${activeMode === 'preco' ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Ou defina o preço diretamente
              </label>
              <CurrencyInput
                value={data.precoDefinido || metrics.precoPorSessao}
                onChange={handlePrecoChange}
                disabled={!isRegistered}
              />
              {isAbaixoCusto && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Preço abaixo do custo por sessão ({formatarMoeda(metrics.custoTotalSessao)}) — você terá prejuízo!
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Two-card result: Custo vs Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-terracotta/5 via-card to-terracotta/10 rounded-2xl border border-border p-6 text-center"
            >
              <p className="text-sm text-muted-foreground font-medium">Custo por Sessão</p>
              <p className="text-3xl lg:text-4xl font-heading font-bold text-terracotta mt-2 font-mono">
                {formatarMoeda(metrics.custoTotalSessao)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Fixos + Variáveis + Reservas</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Nunca cobre abaixo deste valor
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-br from-sage/5 via-card to-sage-light/10 rounded-2xl border border-border p-6 text-center"
            >
              <p className="text-sm text-muted-foreground font-medium">Preço por Sessão</p>
              <p className="text-3xl lg:text-4xl font-heading font-bold text-primary mt-2 font-mono">
                {formatarMoeda(metrics.precoPorSessao)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Margem de {margemPercent.toFixed(0)}% + Impostos de {(data.impostoPercentual * 100).toFixed(0)}%
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 text-sage-dark text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valor sugerido para cobrar
              </div>
            </motion.div>
          </div>

          {/* PDF Report link */}
          <div className="flex justify-end">
            <Link href="/perfil#relatorio">
              <span className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors">
                <Download className="w-3 h-3" />
                Baixar relatório completo
              </span>
            </Link>
          </div>

          {/* Breakdown Cards — 5 components */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-[10px] text-muted-foreground">Custo fixo</p>
              <p className="text-base font-mono font-bold text-terracotta mt-0.5">{formatarMoeda(metrics.custoFixoSessao)}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-[10px] text-muted-foreground">Custo variável</p>
              <p className="text-base font-mono font-bold text-golden mt-0.5">{formatarMoeda(metrics.custoVarSessao)}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-[10px] text-muted-foreground">Reservas</p>
              <p className="text-base font-mono font-bold text-[#8b7355] mt-0.5">{formatarMoeda(metrics.reservaSessao)}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-[10px] text-muted-foreground">Impostos</p>
              <p className="text-base font-mono font-bold text-muted-foreground mt-0.5">{formatarMoeda(metrics.impostoPorSessao)}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-[10px] text-muted-foreground">Lucro</p>
              <p className={`text-base font-mono font-bold mt-0.5 ${metrics.lucroPorSessao >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                {formatarMoeda(Math.max(0, metrics.lucroPorSessao))}
              </p>
              <div className={`mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded inline-block ${marginBand.bgColor} ${marginBand.color}`}>
                {marginBand.label}
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-card rounded-2xl border border-border p-5 space-y-2"
          >
            <h4 className="text-sm font-heading font-semibold text-foreground">Projeção Mensal</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receita Bruta ({data.sessoesMeta} sessões)</span>
                <span className="font-mono font-medium">{formatarMoeda(metrics.receitaBruta)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">− Impostos ({(data.impostoPercentual * 100).toFixed(0)}%)</span>
                <span className="font-mono font-medium text-muted-foreground">−{formatarMoeda(metrics.impostosMensal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">− Custos Operacionais</span>
                <span className="font-mono font-medium text-muted-foreground">−{formatarMoeda(metrics.custoOperacionalMensal)}</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-t border-border/50">
                <span className="font-medium text-foreground">= Lucro Operacional</span>
                <span className={`font-mono font-bold ${metrics.lucroOperacional >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                  {formatarMoeda(metrics.lucroOperacional)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">− Reservas Estratégicas</span>
                <span className="font-mono font-medium text-amber-600">−{formatarMoeda(metrics.totalReservas)}</span>
              </div>
              <div className="flex justify-between text-sm py-1.5 bg-sage/5 -mx-5 px-5 rounded-b-xl border-t border-border/50">
                <span className="font-bold text-foreground">= Lucro Disponível</span>
                <span className={`font-mono font-bold text-lg ${metrics.lucroDisponivel >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                  {formatarMoeda(metrics.lucroDisponivel)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Lucro Explanation Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-sage-light/20 border border-sage/20 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-sage-dark flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Como o preço é calculado?</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  <strong>Preço = Custo Total ÷ (1 − Margem − Impostos)</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  O custo total inclui custos fixos, variáveis e reservas estratégicas. A margem é o percentual da receita que sobra como lucro. Os impostos são deduzidos da receita automaticamente.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Price Breakdown Chart — 5 segments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-heading font-semibold text-foreground mb-4">Composição do Preço por Sessão</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#8a7e74" tickFormatter={(v) => `R$${v.toFixed(0)}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#8a7e74" width={100} />
                  <RechartsTooltip
                    formatter={(value: number) => formatarMoeda(value)}
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Bar dataKey="valor" radius={[0, 8, 8, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-light/50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-sage-dark" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ponto de Equilíbrio</p>
                <p className="text-base font-heading font-bold text-foreground">
                  {metrics.pontoEquilibrio === Infinity ? 'Impossível' : `${metrics.pontoEquilibrio} sessões/mês`}
                </p>
                {metrics.pontoEquilibrio !== Infinity && (
                  <p className="text-[10px] text-muted-foreground">
                    {peOcupacao}% da capacidade necessária para empatar
                  </p>
                )}
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-golden-light/50 flex items-center justify-center flex-shrink-0">
                <Calculator className="w-5 h-5 text-golden" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valor por Hora</p>
                <p className="text-base font-heading font-bold text-foreground">
                  {formatarMoeda(metrics.valorHora)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Sessão de {data.duracaoPadraoMinutos}min
                </p>
              </div>
            </div>
          </div>

          {/* Margin Bands Reference */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <h4 className="text-sm font-heading font-semibold text-foreground mb-3">Referência de Margem (sobre receita)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-destructive">&lt; 10%</p>
                  <p className="text-[9px] text-muted-foreground">Arriscada</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-golden/5 border border-golden/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-golden flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-golden">10-20%</p>
                  <p className="text-[9px] text-muted-foreground">Saudável</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-sage-light/30 border border-sage/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-sage-dark">20-30%</p>
                  <p className="text-[9px] text-muted-foreground">Confortável</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-sage-light/30 border border-sage/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-dark flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-sage-dark">&gt; 30%</p>
                  <p className="text-[9px] text-muted-foreground">Excelente</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
