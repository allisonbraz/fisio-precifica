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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosOperacionais,
  calcularTotalDepreciacao,
  calcularTotalCustosVariaveis,
  calcularTotalReservas,
  calcularCustoTotalMensal,
  calcularCustoTotalPorSessao,
  calcularPrecoMinimo,
  calcularTaxaOcupacao,
  calcularPontoEquilibrio,
  calcularValorHora,
  formatarMoeda,
  formatarPercentual,
} from '@/lib/store';
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

const HERO_IMG = 'https://private-us-east-1.manuscdn.com/sessionFile/5x2XL9XPDtN8N7fV0K7m0w/sandbox/BaEZpg9wKuEDvQEdCXAyae-img-3_1771292314000_na1fn_ZGFzaGJvYXJkLWlsbHVzdHJhdGlvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNXgyWEw5WFBEdE44TjdmVjBLN20wdy9zYW5kYm94L0JhRVpwZzl3S3VFRHZRRWRDWEF5YWUtaW1nLTNfMTc3MTI5MjMxNDAwMF9uYTFmbl9aR0Z6YUdKdllYSmtMV2xzYkhWemRISmhkR2x2YmcucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=oSAqyCfZQd6G9TVeQ1ZXIg0IBvvJZbP0otbsogfk7KntheZWZ9jdb5H8XrNQ4wAi8s5sH8AKI-V62l9kDOaptgwigGmm6nQcUtfBh78L98f7xOf1Kvg-8UGp1Zolq1aaY3PcZjVzRthL9UUWgGVxVFKakjet1tw~t2HGSz9drMxZmxA0pDj4Vhiqfs~MCw1VwYtSMr51m1e0B23fTIZoppY9RNMRizY5xsCpq8PXG0Y8HN16Yc7RGf3UwiLl53K5r8JdhmWRI4zkB0guKRp~6RgHMHPXyAgKc1G9aF9L9ILqDz-rmfjna1ei3ZlP5zOJ3cOJKo6vo2OA1n84Ggookg__';

const PIE_COLORS = ['#b5725d', '#7c9a82', '#d4a853', '#c2785c', '#5a7d64'];

export default function Home() {
  const { data } = useData();

  const metrics = useMemo(() => {
    const custoOperacional = calcularTotalCustosOperacionais(data.custosFixos);
    const custoDepreciacao = calcularTotalDepreciacao(data.custosFixos);
    const custoVarTotal = calcularTotalCustosVariaveis(data.custosVariaveis);
    const totalReservas = calcularTotalReservas(data.reservasEstrategicas);
    const custoMensal = calcularCustoTotalMensal(data);
    const custoPorSessao = calcularCustoTotalPorSessao(data);
    const precoPorSessao = calcularPrecoMinimo(data); // preço = custo + margem
    const taxaOcupacao = calcularTaxaOcupacao(data);
    const pontoEquilibrio = calcularPontoEquilibrio(data, precoPorSessao);
    const valorHora = calcularValorHora(data, precoPorSessao);
    const receitaPotencial = precoPorSessao * data.sessoesMeta;
    const lucroOperacional = receitaPotencial - custoMensal;
    const lucroDisponivel = lucroOperacional - totalReservas;

    return {
      custoOperacional,
      custoDepreciacao,
      custoVarTotal,
      totalReservas,
      custoMensal,
      custoPorSessao,
      precoPorSessao,
      taxaOcupacao,
      pontoEquilibrio,
      valorHora,
      receitaPotencial,
      lucroOperacional,
      lucroDisponivel,
    };
  }, [data]);

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
      const receita = p * data.sessoesMeta;
      const lucro = receita - metrics.custoMensal;
      return { preco: `R$${p}`, lucro: Math.max(lucro, 0), receita };
    });
  }, [data, metrics]);

  const hasData = metrics.custoMensal > 0;

  return (
    <div className="space-y-8">
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
          <div className="w-full lg:w-[340px] flex-shrink-0">
            <img
              src={HERO_IMG}
              alt="Ilustração de precificação"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Resumo Financeiro</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Custo Mensal Total"
            value={formatarMoeda(metrics.custoMensal)}
            subtitle="Fixos + Variáveis"
            icon={Wallet}
            variant="primary"
          />
          <StatCard
            title="Custo por Sessão"
            value={formatarMoeda(metrics.custoPorSessao)}
            subtitle="Mínimo para não ter prejuízo"
            icon={DollarSign}
            variant="warning"
          />
          <StatCard
            title="Preço por Sessão"
            value={formatarMoeda(metrics.precoPorSessao)}
            subtitle={`Com margem de ${(data.margemLucro * 100).toFixed(0)}%`}
            icon={Calculator}
            variant="success"
          />
          <StatCard
            title="Lucro Operacional"
            value={formatarMoeda(metrics.lucroOperacional)}
            subtitle={metrics.lucroOperacional >= 0 ? `Disponível: ${formatarMoeda(metrics.lucroDisponivel)}` : 'Inviável — revise custos'}
            icon={metrics.lucroOperacional >= 0 ? CheckCircle2 : AlertTriangle}
            variant={metrics.lucroOperacional >= 0 ? 'success' : 'danger'}
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
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e5e0d8',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        fontSize: '13px',
                      }}
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
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e0d8',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="lucro" name="Lucro" fill="#7c9a82" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
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
    </div>
  );
}
