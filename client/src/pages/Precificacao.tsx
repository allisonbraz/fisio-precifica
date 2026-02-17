/**
 * Precificação Page
 * Design: Warm Professional — Organic Modernism
 * Calculate minimum price per session with visual breakdown
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
  calcularCustoFixoPorSessao,
  calcularCustoVariavelPorSessao,
  calcularCustoTotalPorSessao,
  calcularPrecoMinimo,
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

export default function Precificacao() {
  const { data, updateSessoesMeta, updateMargemLucro, updateDiasUteis, updateSessoesporDia } = useData();

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

  const breakdownData = useMemo(() => [
    { name: 'Custo Fixo', valor: metrics.custoFixoSessao, fill: '#b5725d' },
    { name: 'Custo Variável', valor: metrics.custoVarSessao, fill: '#d4a853' },
    { name: 'Margem de Lucro', valor: metrics.precoMinimo - metrics.custoTotalSessao, fill: '#7c9a82' },
  ], [metrics]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cálculo de Precificação"
        description="Defina o preço mínimo ideal para suas sessões"
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
                onChange={(e) => updateDiasUteis(Math.max(1, parseInt(e.target.value) || 0))}
                className="rounded-xl font-mono"
                min={1}
                max={31}
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
                onChange={(e) => updateSessoesporDia(Math.max(1, parseInt(e.target.value) || 0))}
                className="rounded-xl font-mono"
                min={1}
                max={20}
              />
            </div>

            {/* Meta de sessões */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  Meta de sessões/mês
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[200px] text-xs">
                        Capacidade máxima: {data.diasUteis * data.sessoesporDia} sessões ({data.diasUteis} dias × {data.sessoesporDia} sessões)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <span className="text-sm font-mono font-medium text-primary">{data.sessoesMeta}</span>
              </div>
              <Slider
                value={[data.sessoesMeta]}
                onValueChange={([v]) => updateSessoesMeta(v)}
                min={1}
                max={Math.max(data.diasUteis * data.sessoesporDia, data.sessoesMeta)}
                step={1}
                className="my-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>{data.diasUteis * data.sessoesporDia} (máx)</span>
              </div>
            </div>

            {/* Margem de lucro */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  Margem de lucro
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[200px] text-xs">Recomendado: 20% a 40% sobre o custo</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <span className="text-sm font-mono font-medium text-primary">{(data.margemLucro * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[data.margemLucro * 100]}
                onValueChange={([v]) => updateMargemLucro(v / 100)}
                min={0}
                max={100}
                step={5}
                className="my-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="text-sage-dark font-medium">20-40% recomendado</span>
                <span>100%</span>
              </div>
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
            <p className="text-sm text-muted-foreground font-medium">Preço Mínimo por Sessão</p>
            <p className="text-5xl font-heading font-bold text-primary mt-2 font-mono">
              {formatarMoeda(metrics.precoMinimo)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Para não ter prejuízo com margem de {(data.margemLucro * 100).toFixed(0)}%
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10 text-sage-dark text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Nunca cobre abaixo deste valor
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
              <p className="text-lg font-mono font-bold text-sage-dark mt-1">{formatarMoeda(metrics.precoMinimo - metrics.custoTotalSessao)}</p>
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
