/**
 * Precificação Page v4
 * Design: Warm Professional — Organic Modernism
 * Dual pricing: by margin OR by defined price — both linked
 * Includes: jornada de trabalho, margin bands, lucro explanation
 */

import { useState, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PageHeader from '@/components/PageHeader';
import CurrencyInput from '@/components/CurrencyInput';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
  calcularCustoFixoPorSessao,
  calcularCustoVariavelPorSessao,
  calcularCustoTotalPorSessao,
  calcularPrecoMinimo,
  calcularMargemDoPreco,
  calcularPontoEquilibrio,
  calcularValorHora,
  formatarMoeda,
} from '@/lib/store';
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
import { toast } from 'sonner';

// Margin band helper
function getMarginBand(marginPercent: number): { label: string; color: string; bgColor: string; icon: typeof CheckCircle2; description: string } {
  if (marginPercent < 15) {
    return {
      label: 'Margem Arriscada',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10 border-destructive/30',
      icon: AlertTriangle,
      description: 'Abaixo de 15% — pouca margem para imprevistos, impostos e crescimento. Risco de prejuízo em meses fracos.',
    };
  }
  if (marginPercent <= 30) {
    return {
      label: 'Margem Saudável',
      color: 'text-golden',
      bgColor: 'bg-golden/10 border-golden/30',
      icon: CheckCircle2,
      description: 'Entre 15% e 30% — margem adequada para cobrir variações e manter estabilidade financeira.',
    };
  }
  return {
    label: 'Margem Excelente',
    color: 'text-sage-dark',
    bgColor: 'bg-sage-light/30 border-sage/30',
    icon: CheckCircle2,
    description: 'Acima de 30% — excelente! Permite reinvestir, criar reserva e crescer com segurança.',
  };
}

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
  } = useData();

  const [activeMode, setActiveMode] = useState<'margem' | 'preco'>('margem');

  const metrics = useMemo(() => {
    const custoFixoTotal = calcularTotalCustosFixos(data.custosFixos);
    const custoVarTotal = calcularTotalCustosVariaveis(data.custosVariaveis);
    const custoFixoSessao = calcularCustoFixoPorSessao(data);
    const custoVarSessao = calcularCustoVariavelPorSessao(data);
    const custoTotalSessao = calcularCustoTotalPorSessao(data);
    const precoPorSessao = calcularPrecoMinimo(data);
    const pontoEquilibrio = calcularPontoEquilibrio(data, precoPorSessao);
    const valorHora = calcularValorHora(data, precoPorSessao);

    return {
      custoFixoTotal, custoVarTotal, custoFixoSessao, custoVarSessao,
      custoTotalSessao, precoPorSessao, pontoEquilibrio, valorHora,
    };
  }, [data]);

  const margemPercent = data.margemLucro * 100;
  const marginBand = getMarginBand(margemPercent);
  const MarginIcon = marginBand.icon;

  const handleMargemChange = useCallback((margem: number) => {
    if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
    setActiveMode('margem');
    updateMargemLucro(margem / 100);
    const custoTotal = calcularCustoTotalPorSessao(data);
    const newPrice = custoTotal * (1 + margem / 100);
    updatePrecoDefinido(Math.round(newPrice * 100) / 100);
  }, [data, isRegistered, updateMargemLucro, updatePrecoDefinido]);

  const handlePrecoChange = useCallback((preco: number) => {
    if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
    setActiveMode('preco');
    updatePrecoDefinido(preco);
    const newMargem = calcularMargemDoPreco(data, preco);
    updateMargemLucro(Math.max(0, Math.min(newMargem, 10)));
  }, [data, isRegistered, updatePrecoDefinido, updateMargemLucro]);

  const breakdownData = useMemo(() => [
    { name: 'Custo Fixo', valor: metrics.custoFixoSessao, fill: '#b5725d' },
    { name: 'Custo Variável', valor: metrics.custoVarSessao, fill: '#d4a853' },
    { name: 'Lucro', valor: Math.max(0, metrics.precoPorSessao - metrics.custoTotalSessao), fill: '#7c9a82' },
  ], [metrics]);

  const isAbaixoCusto = data.precoDefinido > 0 && data.precoDefinido < metrics.custoTotalSessao;
  const lucroPorSessao = Math.max(0, metrics.precoPorSessao - metrics.custoTotalSessao);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cálculo de Precificação"
        description="Defina o preço ideal: ajuste pela margem de lucro ou defina o preço diretamente"
        icon={Calculator}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Parameters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Jornada de Trabalho — moved from Configurações */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">Jornada de Trabalho</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Horas por dia */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Horas/dia</label>
                <Input
                  type="number"
                  value={data.horasTrabalho}
                  onChange={(e) => {
                    if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                    updateHorasTrabalho(Math.max(1, parseInt(e.target.value) || 0));
                  }}
                  className="rounded-xl font-mono text-sm"
                  min={1}
                  max={16}
                  disabled={!isRegistered}
                />
              </div>

              {/* Dias úteis */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Dias úteis/mês</label>
                <Input
                  type="number"
                  value={data.diasUteis}
                  onChange={(e) => {
                    if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                    updateDiasUteis(Math.max(1, parseInt(e.target.value) || 0));
                  }}
                  className="rounded-xl font-mono text-sm"
                  min={1}
                  max={31}
                  disabled={!isRegistered}
                />
              </div>
            </div>

            {/* Sessões por dia */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                Sessões por dia (capacidade)
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px] text-xs">Máximo de sessões que você consegue atender por dia</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                type="number"
                value={data.sessoesporDia}
                onChange={(e) => {
                  if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                  updateSessoesporDia(Math.max(1, parseInt(e.target.value) || 0));
                }}
                className="rounded-xl font-mono text-sm"
                min={1}
                max={20}
                disabled={!isRegistered}
              />
            </div>

            {/* Summary */}
            <div className="p-2.5 rounded-xl bg-muted/30 text-xs text-muted-foreground space-y-0.5">
              <p><Calendar className="w-3 h-3 inline mr-1" />{data.horasTrabalho * data.diasUteis}h/mês trabalhadas</p>
              <p><Target className="w-3 h-3 inline mr-1" />Capacidade máxima: {data.diasUteis * data.sessoesporDia} sessões/mês</p>
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
                <label className="text-sm font-medium text-foreground">Sessões por mês</label>
                <span className="text-sm font-mono font-medium text-primary">{data.sessoesMeta}</span>
              </div>
              <Slider
                value={[data.sessoesMeta]}
                onValueChange={([v]) => {
                  if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                  updateSessoesMeta(v);
                }}
                min={1}
                max={Math.max(data.diasUteis * data.sessoesporDia, data.sessoesMeta)}
                step={1}
                className="my-3"
                disabled={!isRegistered}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>{data.diasUteis * data.sessoesporDia} (máx)</span>
              </div>
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
              Ajuste a margem de lucro <strong>ou</strong> defina o preço diretamente. Os dois campos estão vinculados e se atualizam automaticamente.
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
                max={200}
                step={5}
                className="my-3"
                disabled={!isRegistered}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>200%</span>
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
            {/* Custo por Sessão */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-terracotta/5 via-card to-terracotta/10 rounded-2xl border border-border p-6 text-center"
            >
              <p className="text-sm text-muted-foreground font-medium">Custo por Sessão</p>
              <p className="text-3xl lg:text-4xl font-heading font-bold text-terracotta mt-2 font-mono">
                {formatarMoeda(metrics.custoTotalSessao)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Mínimo para não ter prejuízo</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Nunca cobre abaixo deste valor
              </div>
            </motion.div>

            {/* Preço por Sessão */}
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
                Com margem de {margemPercent.toFixed(0)}% sobre o custo
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/10 text-sage-dark text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valor sugerido para cobrar
              </div>
            </motion.div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Custo fixo/sessão</p>
              <p className="text-lg font-mono font-bold text-terracotta mt-1">{formatarMoeda(metrics.custoFixoSessao)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatarMoeda(metrics.custoFixoTotal)} ÷ {data.sessoesMeta}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Custo variável/sessão</p>
              <p className="text-lg font-mono font-bold text-golden mt-1">{formatarMoeda(metrics.custoVarSessao)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatarMoeda(metrics.custoVarTotal)} ÷ {data.sessoesMeta}</p>
            </div>
            {/* Lucro/sessão with explanation */}
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Lucro/sessão</p>
              <p className="text-lg font-mono font-bold text-sage-dark mt-1">{formatarMoeda(lucroPorSessao)}</p>
              <div className="mt-1.5 flex items-start gap-1">
                <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${marginBand.bgColor} ${marginBand.color}`}>
                  {marginBand.label}
                </div>
              </div>
            </div>
          </div>

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
                <p className="text-sm font-medium text-foreground">O que é o Lucro?</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  O lucro é o que sobra depois de pagar todos os custos. Com ele você pode:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0" />
                    <span><strong>Reinvestir</strong> no consultório</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0" />
                    <span><strong>Criar reserva</strong> de emergência</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0" />
                    <span><strong>Crescer</strong> o negócio</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0" />
                    <span><strong>Distribuir</strong> como dividendos</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Margin Bands Reference */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <h4 className="text-sm font-heading font-semibold text-foreground mb-3">Referência de Margem de Lucro</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-destructive">Abaixo de 15%</p>
                  <p className="text-[10px] text-muted-foreground">Arriscada</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-golden/5 border border-golden/20">
                <CheckCircle2 className="w-4 h-4 text-golden flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-golden">15% a 30%</p>
                  <p className="text-[10px] text-muted-foreground">Saudável</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-sage-light/30 border border-sage/20">
                <CheckCircle2 className="w-4 h-4 text-sage-dark flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-sage-dark">Acima de 30%</p>
                  <p className="text-[10px] text-muted-foreground">Excelente</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Price Breakdown Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-heading font-semibold text-foreground mb-4">Composição do Preço por Sessão</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#8a7e74" tickFormatter={(v) => `R$${v.toFixed(0)}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#8a7e74" width={120} />
                  <RechartsTooltip
                    formatter={(value: number) => formatarMoeda(value)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e0d8',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
