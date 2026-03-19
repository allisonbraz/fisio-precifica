/**
 * Simulação Page
 * Design: Warm Professional — Organic Modernism
 * Simulate different pricing scenarios with visual comparison
 * Includes: price scenarios with % difference, occupancy scenarios, fixed chart
 */

import { useMemo, useState } from 'react';
import ProgressGate from '@/components/ProgressGate';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  Percent,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import PageHeader from '@/components/PageHeader';
import { useData } from '@/contexts/DataContext';
import {
  simularPreco,
  calcularPrecoMinimo,
  calcularPontoEquilibrio,
  calcularCustoTotalPorSessao,
  calcularCustoOperacionalMensal,
  calcularTotalReservas,
  formatarMoeda,
} from '@/lib/store';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
  Bar,
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '@/lib/utils';

export default function Simulacao() {
  const { data } = useData();
  const [precoCustom, setPrecoCustom] = useState(150);

  const precoPorSessao = calcularPrecoMinimo(data);
  const custoSessao = calcularCustoTotalPorSessao(data);
  const custoOperacionalMensal = calcularCustoOperacionalMensal(data);
  const reservasMensal = calcularTotalReservas(data.reservasEstrategicas);
  const custoMensal = custoOperacionalMensal + reservasMensal;

  // Predefined simulation prices
  const precosSimulacao = useMemo(() => {
    const precos = [60, 80, 100, 120, 140, 160, 180, 200, 250, 300, 350, 400];
    return precos.map(p => ({
      preco: p,
      ...simularPreco(data, p),
      diffPercent: custoSessao > 0 ? ((p - custoSessao) / custoSessao * 100) : 0,
    }));
  }, [data, custoSessao]);

  // Custom simulation
  const customSim = useMemo(() => simularPreco(data, precoCustom), [data, precoCustom]);
  const customPE = useMemo(() => calcularPontoEquilibrio(data, precoCustom), [data, precoCustom]);
  const customDiffPercent = custoSessao > 0 ? ((precoCustom - custoSessao) / custoSessao * 100) : 0;

  // Chart data — includes receita, custo (constant line), and lucro
  const chartData = useMemo(() => {
    const points = [];
    for (let p = 50; p <= 500; p += 10) {
      const sim = simularPreco(data, p);
      points.push({
        preco: p,
        receita: Math.round(sim.receitaMensal),
        custo: Math.round(sim.custoTotal),
        lucro: Math.round(sim.lucroDisponivel),
      });
    }
    return points;
  }, [data]);

  // ===== PRICE SCENARIOS (pessimista, realista, otimista) =====
  const cenariosPreco = useMemo(() => {
    const pessimista = simularPreco(data, precoCustom * 0.8);
    const realista = simularPreco(data, precoCustom);
    const otimista = simularPreco(data, precoCustom * 1.2);

    return [
      {
        label: 'Pessimista',
        desc: `${formatarMoeda(precoCustom * 0.8)} por sessão`,
        diffPercent: custoSessao > 0 ? ((precoCustom * 0.8 - custoSessao) / custoSessao * 100) : 0,
        data: pessimista,
        color: 'border-destructive/30 bg-destructive/5',
        icon: XCircle,
        iconColor: 'text-destructive',
      },
      {
        label: 'Realista',
        desc: `${formatarMoeda(precoCustom)} por sessão`,
        diffPercent: custoSessao > 0 ? ((precoCustom - custoSessao) / custoSessao * 100) : 0,
        data: realista,
        color: 'border-primary/30 bg-primary/5',
        icon: CheckCircle2,
        iconColor: 'text-primary',
      },
      {
        label: 'Otimista',
        desc: `${formatarMoeda(precoCustom * 1.2)} por sessão`,
        diffPercent: custoSessao > 0 ? ((precoCustom * 1.2 - custoSessao) / custoSessao * 100) : 0,
        data: otimista,
        color: 'border-sage/30 bg-sage-light/20',
        icon: CheckCircle2,
        iconColor: 'text-sage-dark',
      },
    ];
  }, [data, precoCustom, custoSessao]);

  // ===== OCCUPANCY SCENARIOS =====
  const cenariosOcupacao = useMemo(() => {
    const sessoesPlena = data.sessoesMeta;
    const sessoes70_80 = Math.floor(data.sessoesMeta * 0.75);
    const sessoesFaltas = Math.floor(data.sessoesMeta * 0.90);

    const buildCenario = (sessoes: number) => {
      const receita = precoCustom * sessoes;
      const impostos = receita * data.impostoPercentual;
      const lucro = receita - impostos - custoMensal;
      return { receita, impostos, custo: custoMensal, lucro, sessoes };
    };

    const simPlena = { ...buildCenario(sessoesPlena), ocupacao: 100 };
    const simFaltas = { ...buildCenario(sessoesFaltas), ocupacao: 90 };
    const sim75 = { ...buildCenario(sessoes70_80), ocupacao: 75 };

    return [
      {
        label: 'Ocupação Plena',
        desc: `100% — ${sessoesPlena} sessões/mês`,
        ...simPlena,
        color: 'border-sage/30 bg-sage-light/20',
        viable: simPlena.lucro >= 0,
      },
      {
        label: 'Faltas e Cancelamentos',
        desc: `10% de faltas — ${sessoesFaltas} sessões/mês`,
        ...simFaltas,
        color: 'border-golden/30 bg-golden/5',
        viable: simFaltas.lucro >= 0,
      },
      {
        label: 'Ocupação 70-80%',
        desc: `~75% — ${sessoes70_80} sessões/mês`,
        ...sim75,
        color: 'border-destructive/30 bg-destructive/5',
        viable: sim75.lucro >= 0,
      },
    ];
  }, [data, precoCustom, custoMensal]);

  // Occupancy chart data
  const occupancyChartData = useMemo(() => {
    return cenariosOcupacao.map(c => ({
      name: c.label,
      receita: Math.round(c.receita),
      custo: Math.round(c.custo),
      lucro: Math.round(c.lucro),
    }));
  }, [cenariosOcupacao]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulação de Cenários"
        description="Teste diferentes preços e taxas de ocupação para ver o impacto no seu faturamento"
        icon={TrendingUp}
      />

      <ProgressGate requiredLabel="Simulação" />

      {/* Custom Price Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Simulador de Preço
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Preço por sessão</label>
                <span className="text-2xl font-mono font-bold text-primary">{formatarMoeda(precoCustom)}</span>
              </div>
              <Slider
                value={[precoCustom]}
                onValueChange={([v]) => setPrecoCustom(v)}
                min={30}
                max={500}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>R$ 30</span>
                <span className="text-primary font-medium">Sugerido: {formatarMoeda(precoPorSessao)}</span>
                <span>R$ 500</span>
              </div>
            </div>

            {/* % above/below cost */}
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              customDiffPercent >= 0 ? 'bg-sage-light/30 text-sage-dark' : 'bg-destructive/10 text-destructive'
            }`}>
              <Percent className="w-4 h-4 flex-shrink-0" />
              <span>
                {customDiffPercent >= 0
                  ? `${customDiffPercent.toFixed(1)}% acima do custo por sessão (${formatarMoeda(custoSessao)})`
                  : `${Math.abs(customDiffPercent).toFixed(1)}% abaixo do custo por sessão (${formatarMoeda(custoSessao)})`
                }
              </span>
            </div>

            {precoCustom < custoSessao && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Este preço está abaixo do custo! Você terá prejuízo em cada sessão.</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Receita Bruta</p>
                <p className="text-lg font-mono font-bold text-foreground">{formatarMoeda(customSim.receitaMensal)}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Impostos</p>
                <p className="text-lg font-mono font-bold text-amber-600">−{formatarMoeda(customSim.impostos)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{(data.impostoPercentual * 100).toFixed(0)}% sobre receita</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Lucro Operacional</p>
                <p className={`text-lg font-mono font-bold ${customSim.lucroOperacional >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                  {formatarMoeda(customSim.lucroOperacional)}
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Lucro Disponível</p>
                <p className={`text-lg font-mono font-bold ${customSim.lucroDisponivel >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                  {formatarMoeda(customSim.lucroDisponivel)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Após reservas</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Margem</p>
                <p className="text-lg font-mono font-bold text-foreground">{customSim.margem.toFixed(1)}%</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Ponto de Equilíbrio</p>
                <p className="text-lg font-mono font-bold text-foreground">
                  {customPE === Infinity ? '—' : `${customPE} sessões`}
                </p>
              </div>
            </div>
            <Link href={`/precificacao?preco=${precoCustom}`}>
              <Button className="w-full rounded-xl gap-2">
                Usar este preço na Precificação <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Receita vs Custo Chart — FIXED to show custo line */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-1">Receita vs Custo por Preço</h3>
        <p className="text-sm text-muted-foreground mb-4">O gráfico mostra como receita e lucro variam conforme o preço cobrado. A linha vermelha tracejada é o custo mensal fixo.</p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c9a82" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c9a82" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a853" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4a853" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
              <XAxis dataKey="preco" tick={{ fontSize: 12 }} stroke="#8a7e74" tickFormatter={(v) => `R$${v}`} />
              <YAxis tick={{ fontSize: 12 }} stroke="#8a7e74" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { receita: 'Receita', custo: 'Custo Mensal', lucro: 'Lucro' };
                  return [formatarMoeda(value), labels[name] || name];
                }}
                labelFormatter={(v) => `Preço: R$ ${v}`}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              {/* Custo line (constant) — this is the key fix */}
              <Line type="monotone" dataKey="custo" stroke="#c2785c" strokeWidth={2} strokeDasharray="8 4" dot={false} name="custo" />
              {/* Reference line for current custom price */}
              <ReferenceLine x={Math.round(precoCustom / 10) * 10} stroke="#b5725d" strokeDasharray="5 5" label={{ value: `Seu preço`, position: 'top', fill: '#b5725d', fontSize: 11 }} />
              {/* Receita area */}
              <Area type="monotone" dataKey="receita" stroke="#7c9a82" fill="url(#colorReceita)" strokeWidth={2} name="receita" />
              {/* Lucro area */}
              <Area type="monotone" dataKey="lucro" stroke="#d4a853" fill="url(#colorLucro)" strokeWidth={2} name="lucro" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#7c9a82] rounded inline-block" /> Receita</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#d4a853] rounded inline-block" /> Lucro</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#c2785c] rounded inline-block border-dashed" style={{ borderTop: '2px dashed #c2785c', height: 0 }} /> Custo Mensal</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#b5725d] rounded inline-block border-dashed" style={{ borderTop: '2px dashed #b5725d', height: 0 }} /> Seu Preço</span>
        </div>
      </motion.div>

      {/* ===== PRICE SCENARIOS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-1 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Cenários de Preço
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Baseados no preço simulado de {formatarMoeda(precoCustom)} (±20%)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cenariosPreco.map((cenario) => {
            const Icon = cenario.icon;
            return (
              <div key={cenario.label} className={`rounded-xl border-2 ${cenario.color} p-4 space-y-2`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-semibold text-sm text-foreground">{cenario.label}</h4>
                  <Icon className={`w-4 h-4 ${cenario.iconColor}`} />
                </div>
                <p className="text-xs text-muted-foreground">{cenario.desc}</p>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                  cenario.diffPercent >= 0 ? 'bg-sage-light/50 text-sage-dark' : 'bg-destructive/10 text-destructive'
                }`}>
                  {cenario.diffPercent >= 0 ? '+' : ''}{cenario.diffPercent.toFixed(1)}% vs custo
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Receita:</span>
                    <span className="font-mono font-medium">{formatarMoeda(cenario.data.receitaMensal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Impostos:</span>
                    <span className="font-mono font-medium text-amber-600">−{formatarMoeda(cenario.data.impostos)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Lucro Disponível:</span>
                    <span className={`font-mono font-medium ${cenario.data.lucroDisponivel >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                      {formatarMoeda(cenario.data.lucroDisponivel)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Margem:</span>
                    <span className="font-mono font-medium">{cenario.data.margem.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ===== OCCUPANCY SCENARIOS ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Cenários de Ocupação
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Como a taxa de ocupação impacta seu faturamento com preço de {formatarMoeda(precoCustom)}/sessão
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {cenariosOcupacao.map((cenario) => (
            <div key={cenario.label} className={`rounded-xl border-2 ${cenario.color} p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-semibold text-sm text-foreground">{cenario.label}</h4>
                {cenario.viable ? (
                  <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{cenario.desc}</p>
              <div className="w-full bg-muted/50 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${cenario.viable ? 'bg-sage' : 'bg-destructive/60'}`}
                  style={{ width: `${cenario.ocupacao}%` }}
                />
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Receita:</span>
                  <span className="font-mono font-medium">{formatarMoeda(cenario.receita)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Custo:</span>
                  <span className="font-mono font-medium">{formatarMoeda(cenario.custo)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Lucro:</span>
                  <span className={`font-mono font-medium ${cenario.lucro >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                    {formatarMoeda(cenario.lucro)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Occupancy comparison chart */}
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={occupancyChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#8a7e74" />
              <YAxis tick={{ fontSize: 11 }} stroke="#8a7e74" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = { receita: 'Receita', custo: 'Custo', lucro: 'Lucro' };
                  return [formatarMoeda(value), labels[name] || name];
                }}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Bar dataKey="receita" fill="#7c9a82" radius={[6, 6, 0, 0]} name="receita" />
              <Bar dataKey="lucro" fill="#d4a853" radius={[6, 6, 0, 0]} name="lucro" />
              <Line type="monotone" dataKey="custo" stroke="#c2785c" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: '#c2785c' }} name="custo" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#7c9a82] rounded inline-block" /> Receita</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#d4a853] rounded inline-block" /> Lucro</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#c2785c] rounded inline-block" style={{ borderTop: '2px dashed #c2785c', height: 0 }} /> Custo</span>
        </div>
      </motion.div>

      {/* Price Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <h3 className="font-heading font-semibold text-foreground">Tabela de Simulação</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Comparação de diferentes preços por sessão</p>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 p-4 sm:hidden">
          {precosSimulacao.map((sim) => (
            <div
              key={sim.preco}
              className={`rounded-xl border p-4 space-y-2 ${
                sim.preco === Math.round(precoPorSessao / 10) * 10 ? 'border-primary/30 bg-primary/5' : 'border-border'
              } ${!sim.viavel ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-bold text-foreground">{formatarMoeda(sim.preco)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  sim.diffPercent >= 0 ? 'bg-sage-light/50 text-sage-dark' : 'bg-destructive/10 text-destructive'
                }`}>
                  {sim.diffPercent >= 0 ? '+' : ''}{sim.diffPercent.toFixed(1)}% vs custo
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Receita</p>
                  <p className="font-mono font-medium">{formatarMoeda(sim.receitaMensal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Custo</p>
                  <p className="font-mono font-medium">{formatarMoeda(sim.custoTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lucro</p>
                  <p className={`font-mono font-bold ${sim.lucroDisponivel >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                    {formatarMoeda(sim.lucroDisponivel)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Margem</p>
                  <p className="font-mono font-medium">{sim.margem.toFixed(1)}%</p>
                </div>
              </div>
              <div>
                {sim.viavel ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-sage-dark bg-sage-light/30 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Viável
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                    <XCircle className="w-3 h-3" /> Prejuízo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <th scope="col" className="text-left px-4 py-3 font-medium">Preço/Sessão</th>
                <th scope="col" className="text-right px-4 py-3 font-medium">% vs Custo</th>
                <th scope="col" className="text-right px-4 py-3 font-medium">Receita Mensal</th>
                <th scope="col" className="text-right px-4 py-3 font-medium">Custo Total</th>
                <th scope="col" className="text-right px-4 py-3 font-medium">Lucro Disponível</th>
                <th scope="col" className="text-right px-4 py-3 font-medium">Margem</th>
                <th scope="col" className="text-center px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {precosSimulacao.map((sim) => (
                <tr
                  key={sim.preco}
                  className={`border-b border-border/50 ${
                    sim.preco === Math.round(precoPorSessao / 10) * 10 ? 'bg-primary/5' : ''
                  } ${!sim.viavel ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3 font-mono font-medium">{formatarMoeda(sim.preco)}</td>
                  <td className={`px-4 py-3 text-right font-mono text-xs ${sim.diffPercent >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                    {sim.diffPercent >= 0 ? '+' : ''}{sim.diffPercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{formatarMoeda(sim.receitaMensal)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatarMoeda(sim.custoTotal)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-medium ${sim.lucroDisponivel >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                    {formatarMoeda(sim.lucroDisponivel)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{sim.margem.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center">
                    {sim.viavel ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-sage-dark bg-sage-light/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Viável
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Prejuízo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
