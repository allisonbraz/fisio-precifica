/**
 * Simulação Page
 * Design: Warm Professional — Organic Modernism
 * Simulate different pricing scenarios with visual comparison
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import PageHeader from '@/components/PageHeader';
import { useData } from '@/contexts/DataContext';
import {
  simularPreco,
  calcularPrecoMinimo,
  calcularPontoEquilibrio,
  formatarMoeda,
  formatarPercentual,
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
} from 'recharts';

export default function Simulacao() {
  const { data } = useData();
  const [precoCustom, setPrecoCustom] = useState(150);

  const precoMinimo = calcularPrecoMinimo(data);

  // Predefined simulation prices
  const precosSimulacao = useMemo(() => {
    const precos = [60, 80, 100, 120, 140, 160, 180, 200, 250, 300, 350, 400];
    return precos.map(p => ({
      preco: p,
      ...simularPreco(data, p),
    }));
  }, [data]);

  // Custom simulation
  const customSim = useMemo(() => simularPreco(data, precoCustom), [data, precoCustom]);
  const customPE = useMemo(() => calcularPontoEquilibrio(data, precoCustom), [data, precoCustom]);

  // Chart data
  const chartData = useMemo(() => {
    const points = [];
    for (let p = 50; p <= 500; p += 10) {
      const sim = simularPreco(data, p);
      points.push({
        preco: p,
        receita: sim.receitaMensal,
        custo: sim.custoTotal,
        lucro: sim.lucroBruto,
      });
    }
    return points;
  }, [data]);

  // Scenario analysis
  const cenarios = useMemo(() => {
    const pessimista = simularPreco(data, precoCustom * 0.8);
    const realista = simularPreco(data, precoCustom);
    const otimista = simularPreco(data, precoCustom * 1.2);

    // Low occupancy scenario
    const baixaOcupacao = {
      ...simularPreco(data, precoCustom),
      receitaMensal: precoCustom * Math.floor(data.sessoesMeta * 0.6),
      lucroBruto: precoCustom * Math.floor(data.sessoesMeta * 0.6) - simularPreco(data, precoCustom).custoTotal,
    };
    baixaOcupacao.margem = baixaOcupacao.receitaMensal > 0
      ? (baixaOcupacao.lucroBruto / baixaOcupacao.receitaMensal) * 100
      : 0;
    baixaOcupacao.viavel = baixaOcupacao.lucroBruto >= 0;

    return { pessimista, realista, otimista, baixaOcupacao };
  }, [data, precoCustom]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulação de Cenários"
        description="Teste diferentes preços e veja o impacto no seu faturamento"
        icon={TrendingUp}
      />

      {/* Custom Price Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-4">Simulador de Preço</h3>
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
                <span className="text-primary font-medium">Mínimo: {formatarMoeda(precoMinimo)}</span>
                <span>R$ 500</span>
              </div>
            </div>

            {precoCustom < precoMinimo && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Este preço está abaixo do mínimo! Você terá prejuízo.</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Receita Mensal</p>
              <p className="text-lg font-mono font-bold text-foreground">{formatarMoeda(customSim.receitaMensal)}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Lucro Bruto</p>
              <p className={`text-lg font-mono font-bold ${customSim.lucroBruto >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                {formatarMoeda(customSim.lucroBruto)}
              </p>
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
        </div>
      </motion.div>

      {/* Receita vs Custo Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-4">Receita vs Custo por Preço</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
                formatter={(value: number, name: string) => [formatarMoeda(value), name === 'receita' ? 'Receita' : name === 'lucro' ? 'Lucro' : 'Custo']}
                labelFormatter={(v) => `Preço: R$ ${v}`}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e0d8', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }}
              />
              <ReferenceLine x={Math.round(precoMinimo / 10) * 10} stroke="#c2785c" strokeDasharray="5 5" label={{ value: 'Mínimo', position: 'top', fill: '#c2785c', fontSize: 11 }} />
              <Area type="monotone" dataKey="receita" stroke="#7c9a82" fill="url(#colorReceita)" strokeWidth={2} name="receita" />
              <Area type="monotone" dataKey="lucro" stroke="#d4a853" fill="url(#colorLucro)" strokeWidth={2} name="lucro" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Scenario Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-4">Análise de Cenários</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pessimista', desc: `Preço: ${formatarMoeda(precoCustom * 0.8)}`, data: cenarios.pessimista, color: 'border-destructive/30' },
            { label: 'Realista', desc: `Preço: ${formatarMoeda(precoCustom)}`, data: cenarios.realista, color: 'border-primary/30' },
            { label: 'Otimista', desc: `Preço: ${formatarMoeda(precoCustom * 1.2)}`, data: cenarios.otimista, color: 'border-sage/30' },
            { label: 'Baixa Ocupação', desc: `60% da meta (${Math.floor(data.sessoesMeta * 0.6)} sessões)`, data: cenarios.baixaOcupacao, color: 'border-golden/30' },
          ].map((cenario) => (
            <div key={cenario.label} className={`rounded-xl border-2 ${cenario.color} p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-semibold text-sm text-foreground">{cenario.label}</h4>
                {cenario.data.viavel ? (
                  <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{cenario.desc}</p>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Receita:</span>
                  <span className="font-mono font-medium">{formatarMoeda(cenario.data.receitaMensal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Lucro:</span>
                  <span className={`font-mono font-medium ${cenario.data.lucroBruto >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                    {formatarMoeda(cenario.data.lucroBruto)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Margem:</span>
                  <span className="font-mono font-medium">{cenario.data.margem.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Preço/Sessão</th>
                <th className="text-right px-4 py-3 font-medium">Receita Mensal</th>
                <th className="text-right px-4 py-3 font-medium">Custo Total</th>
                <th className="text-right px-4 py-3 font-medium">Lucro Bruto</th>
                <th className="text-right px-4 py-3 font-medium">Margem</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {precosSimulacao.map((sim, i) => (
                <tr
                  key={sim.preco}
                  className={`border-b border-border/50 ${
                    sim.preco === Math.round(precoMinimo / 10) * 10 ? 'bg-primary/5' : ''
                  } ${!sim.viavel ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3 font-mono font-medium">{formatarMoeda(sim.preco)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatarMoeda(sim.receitaMensal)}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatarMoeda(sim.custoTotal)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-medium ${sim.lucroBruto >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                    {formatarMoeda(sim.lucroBruto)}
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
