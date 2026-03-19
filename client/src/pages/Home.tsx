/**
 * Home / Dashboard Page
 * Design: Warm Professional — Organic Modernism
 * Overview of financial health with key metrics and quick actions
 * 
 * NOMENCLATURA CORRETA:
 * - "Custo por Sessão" = custo total mensal ÷ sessões (mínimo para não ter prejuízo)
 * - "Preço por Sessão" = valor que o profissional define cobrar (custo + margem)
 */

import { useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Target,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Clock,
  Briefcase,
  FileText,
  Calendar,
  Circle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import { useMetrics } from '@/lib/useMetrics';
import { simularPreco, formatarMoeda, formatarPercentual } from '@/lib/store';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '@/lib/utils';

/** Hero logo */
const HERO_IMG = "/logo-fisio.png";

const PIE_COLORS = ['#b5725d', '#7c9a82', '#d4a853', '#c2785c', '#5a7d64'];

export default function Home() {
  const { data } = useData();

  const metrics = useMetrics(data);

  const pieData = useMemo(() => {
    const topCustos = [...data.custosFixos, ...data.custosVariaveis]
      .filter(c => c.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
    return topCustos.map(c => ({ name: c.nome, value: c.valor }));
  }, [data]);

  const simulacaoData = useMemo(() => {
    const precos = [80, 100, 120, 150, 180, 200, 250, 300];
    return precos.map(p => {
      const sim = simularPreco(data, p);
      return { preco: `R$${p}`, lucro: Math.max(sim.lucroDisponivel, 0), receita: sim.receitaMensal };
    });
  }, [data]);

  const hasData = metrics.custoTotalMensal > 0;

  // Progress tracker steps
  const progressSteps = useMemo(() => {
    const hasCustos = data.custosFixos.some(c => c.valor > 0) || data.custosVariaveis.some(c => c.valor > 0);
    const hasMargem = data.margemLucro > 0;
    const hasPreco = data.precoDefinido > 0;
    const hasServico = data.tiposServico.length > 0;

    return [
      { label: 'Cadastrar seus custos', done: hasCustos, href: '/custos' },
      { label: 'Definir margem de lucro', done: hasMargem, href: '/precificacao' },
      { label: 'Calcular preço por sessão', done: hasPreco, href: '/precificacao' },
      { label: 'Criar tipos de serviço', done: hasServico, href: '/servicos' },
    ];
  }, [data]);

  const completedCount = progressSteps.filter(s => s.done).length;
  const allDone = completedCount === progressSteps.length;
  const progressPercent = (completedCount / progressSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Tracker */}
      {!allDone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold text-foreground">Seu progresso</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{completedCount} de {progressSteps.length} etapas concluídas</p>
            </div>
            <span className="text-sm font-mono font-bold text-primary">{progressPercent.toFixed(0)}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-terracotta to-sage rounded-full"
            />
          </div>
          {/* Steps */}
          <div className="space-y-2">
            {progressSteps.map((step, i) => (
              <Link key={i} href={step.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  step.done
                    ? 'text-muted-foreground'
                    : 'text-foreground hover:bg-muted/50'
                }`}>
                  {step.done ? (
                    <CheckCircle className="w-4 h-4 text-sage-dark flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${step.done ? 'line-through' : 'font-medium'}`}>{step.label}</span>
                  {!step.done && <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/40" />}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terracotta/5 via-sage-light/20 to-golden-light/30 border border-border"
      >
        <div className="flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Calculator className="w-3.5 h-3.5" />
              Calculadora de Precificação
            </div>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight">
              Saiba exatamente<br />
              <span className="text-gradient">quanto cobrar</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Calcule o preço ideal dos seus serviços de fisioterapia com base nos seus custos reais. Nunca mais cobre abaixo do necessário.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/custos">
                <Button className="rounded-xl gap-2 bg-primary hover:bg-primary/90">
                  Começar agora <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/simulacao">
                <Button variant="outline" className="rounded-xl gap-2">
                  <BarChart3 className="w-4 h-4" /> Simular cenários
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-[240px] flex-shrink-0 flex flex-col items-center gap-3">
            <img
              src={HERO_IMG}
              alt="Logo FisioPrecifica"
              className="w-40 h-40 object-contain"
            />
            <div className="text-center">
              <p className="text-lg font-heading font-semibold text-terracotta">Precifique com</p>
              <p className="text-lg font-heading font-semibold text-primary">confiança</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Resumo Financeiro</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Custo Mensal Total"
            value={formatarMoeda(metrics.custoTotalMensal)}
            subtitle="Fixos + Variáveis + Reservas"
            icon={Wallet}
            variant="primary"
          />
          <StatCard
            title="Custo por Sessão"
            value={formatarMoeda(metrics.custoTotalSessao)}
            subtitle="Base para formação de preço"
            icon={DollarSign}
            variant="warning"
          />
          <StatCard
            title="Preço por Sessão"
            value={formatarMoeda(metrics.precoPorSessao)}
            subtitle={`Margem ${metrics.margemPercent.toFixed(0)}% + Impostos ${(data.impostoPercentual * 100).toFixed(0)}%`}
            icon={Calculator}
            variant="success"
          />
          <StatCard
            title="Lucro Disponível"
            value={formatarMoeda(metrics.lucroDisponivel)}
            subtitle={metrics.lucroDisponivel >= 0 ? `Operacional: ${formatarMoeda(metrics.lucroOperacional)}` : 'Inviável — revise custos'}
            icon={metrics.lucroDisponivel >= 0 ? CheckCircle2 : AlertTriangle}
            variant={metrics.lucroDisponivel >= 0 ? 'success' : 'danger'}
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Ponto de Equilíbrio"
          value={metrics.pontoEquilibrio === Infinity ? '—' : `${metrics.pontoEquilibrio} sessões`}
          subtitle="Sessões para cobrir custos"
          icon={Target}
          variant="default"
        />
        <StatCard
          title="Valor/Hora"
          value={formatarMoeda(metrics.valorHora)}
          subtitle="Baseado no preço por sessão"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Taxa de Ocupação"
          value={formatarPercentual(metrics.taxaOcupacao)}
          subtitle={`${data.sessoesMeta} de ${data.diasUteis * data.sessoesporDia} possíveis`}
          icon={BarChart3}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Distribution */}
          {pieData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="text-base font-heading font-semibold text-foreground mb-4">
                Maiores Custos
              </h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatarMoeda(value)}
                      contentStyle={CHART_TOOLTIP_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground truncate max-w-[180px]">{item.name}</span>
                    </div>
                    <span className="font-mono text-foreground font-medium">{formatarMoeda(item.value)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Profit Simulation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="text-base font-heading font-semibold text-foreground mb-4">
              Simulação de Lucro por Preço
            </h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulacaoData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
                  <XAxis dataKey="preco" tick={{ fontSize: 12 }} stroke="#8a7e74" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#8a7e74"
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatarMoeda(value)}
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Bar dataKey="lucro" name="Lucro" fill="#7c9a82" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* PDF Report CTA */}
      {hasData && (
        <Link href="/perfil#relatorio">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-gradient-to-r from-terracotta/10 via-card to-sage/10 rounded-2xl border border-border p-5 flex items-center gap-4 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-terracotta" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">Gerar Relatório PDF</h4>
              <p className="text-sm text-muted-foreground">Baixe um relatório profissional com seus custos e preços</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </Link>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/custos', icon: DollarSign, title: 'Gerenciar Custos', desc: 'Fixos e variáveis', color: 'from-terracotta/10 to-terracotta/5' },
            { href: '/precificacao', icon: Calculator, title: 'Calcular Preço', desc: 'Custo e preço por sessão', color: 'from-sage/10 to-sage/5' },
            { href: '/servicos', icon: Briefcase, title: 'Tipos de Serviço', desc: 'Preços por serviço', color: 'from-golden/10 to-golden/5' },
            { href: '/simulacao', icon: TrendingUp, title: 'Simular Cenários', desc: 'Otimista e pessimista', color: 'from-primary/10 to-primary/5' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br ${item.color} rounded-2xl border border-border p-5 cursor-pointer group`}
              >
                <item.icon className="w-8 h-8 text-foreground/70 mb-3 group-hover:text-primary transition-colors" />
                <h4 className="font-heading font-semibold text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
      {/* Monthly record nudge */}
      {(() => {
        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        const hasCurrentMonthRecord = data.registrosMensais?.some(r => r.mes === currentMonth);
        if (!hasCurrentMonthRecord && data.registrosMensais?.length > 0) {
          return (
            <Link href="/relatorios">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-golden-light/20 border border-golden/30 rounded-2xl p-4 flex items-center gap-3 cursor-pointer group hover:bg-golden-light/30 transition-colors"
              >
                <Calendar className="w-5 h-5 text-golden flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Registre seus resultados deste mês</p>
                  <p className="text-xs text-muted-foreground">Mantenha o acompanhamento da evolução do seu consultório</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
          );
        }
        return null;
      })()}
    </div>
  );
}
