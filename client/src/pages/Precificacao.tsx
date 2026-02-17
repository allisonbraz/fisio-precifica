/**
 * Precificação Page v2
 * Design: Warm Professional — Organic Modernism
 * Dual pricing: by margin OR by defined price — both linked
 */

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  CheckCircle2,
  Info,
  TrendingUp,
  ArrowLeftRight,
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

export default function Precificacao() {
  const {
    data,
    isRegistered,
    updateSessoesMeta,
    updateMargemLucro,
    updatePrecoDefinido,
    updateDiasUteis,
    updateSessoesporDia,
  } = useData();

  // Track which input the user is currently editing
  const [activeMode, setActiveMode] = useState<'margem' | 'preco'>('margem');

  const metrics = useMemo(() => {
    const custoFixoTotal = calcularTotalCustosFixos(data.custosFixos);
    const custoVarTotal = calcularTotalCustosVariaveis(data.custosVariaveis);
    const custoFixoSessao = calcularCustoFixoPorSessao(data);
    const custoVarSessao = calcularCustoVariavelPorSessao(data);
    const custoTotalSessao = calcularCustoTotalPorSessao(data);
    const precoMinimo = calcularPrecoMinimo(data);
    const pontoEquilibrio = calcularPontoEquilibrio(data, precoMinimo);
    const valorHora = calcularValorHora(data, precoMinimo);

    return {
      custoFixoTotal,
      custoVarTotal,
      custoFixoSessao,
      custoVarSessao,
      custoTotalSessao,
      precoMinimo,
      pontoEquilibrio,
      valorHora,
    };
  }, [data]);

  // When user changes margin → update precoDefinido
  const handleMargemChange = useCallback((margem: number) => {
    if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
    setActiveMode('margem');
    updateMargemLucro(margem / 100);
    // Auto-calc the price from margin
    const custoTotal = calcularCustoTotalPorSessao(data);
    const newPrice = custoTotal * (1 + margem / 100);
    updatePrecoDefinido(Math.round(newPrice * 100) / 100);
  }, [data, isRegistered, updateMargemLucro, updatePrecoDefinido]);

  // When user changes price → update margem
  const handlePrecoChange = useCallback((preco: number) => {
    if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
    setActiveMode('preco');
    updatePrecoDefinido(preco);
    const newMargem = calcularMargemDoPreco(data, preco);
    updateMargemLucro(Math.max(0, Math.min(newMargem, 10))); // cap at 1000%
  }, [data, isRegistered, updatePrecoDefinido, updateMargemLucro]);

  const breakdownData = useMemo(() => [
    { name: 'Custo Fixo', valor: metrics.custoFixoSessao, fill: '#b5725d' },
    { name: 'Custo Variável', valor: metrics.custoVarSessao, fill: '#d4a853' },
    { name: 'Margem de Lucro', valor: Math.max(0, metrics.precoMinimo - metrics.custoTotalSessao), fill: '#7c9a82' },
  ], [metrics]);

  const isAbaixoCusto = data.precoDefinido > 0 && data.precoDefinido < metrics.custoTotalSessao;

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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border p-5 space-y-5"
          >
            <h3 className="font-heading font-semibold text-foreground">Parâmetros</h3>

            {/* Dias úteis */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                Dias úteis por mês
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px] text-xs">Considere férias, feriados e dias de folga</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Input
                type="number"
                value={data.diasUteis}
                onChange={(e) => {
                  if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                  updateDiasUteis(Math.max(1, parseInt(e.target.value) || 0));
                }}
                className="rounded-xl font-mono"
                min={1}
                max={31}
                disabled={!isRegistered}
              />
            </div>

            {/* Sessões por dia */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                Sessões por dia (capacidade)
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
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
                className="rounded-xl font-mono"
                min={1}
                max={20}
                disabled={!isRegistered}
              />
            </div>

            {/* Meta de sessões */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  Meta de sessões/mês
                </label>
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
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  Margem de lucro
                </label>
                <span className="text-sm font-mono font-medium text-primary">{(data.margemLucro * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[data.margemLucro * 100]}
                onValueChange={([v]) => handleMargemChange(v)}
                min={0}
                max={200}
                step={5}
                className="my-3"
                disabled={!isRegistered}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="text-sage-dark font-medium">20-40% recomendado</span>
                <span>200%</span>
              </div>
            </div>

            {/* Preço definido */}
            <div className={`p-3 rounded-xl border transition-colors ${activeMode === 'preco' ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Ou defina o preço diretamente
              </label>
              <CurrencyInput
                value={data.precoDefinido || metrics.precoMinimo}
                onChange={handlePrecoChange}
                disabled={!isRegistered}
              />
              {isAbaixoCusto && (
                <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Preço abaixo do custo por sessão ({formatarMoeda(metrics.custoTotalSessao)})
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Price Result */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-primary/5 via-card to-sage-light/10 rounded-2xl border border-border p-6 text-center"
          >
            <p className="text-sm text-muted-foreground font-medium">Preço por Sessão</p>
            <p className="text-5xl font-heading font-bold text-primary mt-2 font-mono">
              {formatarMoeda(metrics.precoMinimo)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Com margem de {(data.margemLucro * 100).toFixed(0)}% sobre o custo de {formatarMoeda(metrics.custoTotalSessao)}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 text-sage-dark text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Nunca cobre abaixo de {formatarMoeda(metrics.custoTotalSessao)} (seu custo)
            </div>
          </motion.div>

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
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Lucro/sessão</p>
              <p className="text-lg font-mono font-bold text-sage-dark mt-1">{formatarMoeda(Math.max(0, metrics.precoMinimo - metrics.custoTotalSessao))}</p>
              <p className="text-xs text-muted-foreground mt-1">Margem de {(data.margemLucro * 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Price Breakdown Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="font-heading font-semibold text-foreground mb-4">Composição do Preço</h3>
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
