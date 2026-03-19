/**
 * Landing Page — FisioPrecifica
 * Public page with value proposition + quick calculator
 * Converts visitors into registered users
 */

import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Calculator,
  ArrowRight,
  DollarSign,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Shield,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CurrencyInput from '@/components/CurrencyInput';
import { Input } from '@/components/ui/input';
import { formatarMoeda } from '@/lib/store';

const HERO_IMG = '/logo-fisio.png';

export default function Landing() {
  const [custoMensal, setCustoMensal] = useState(0);
  const [sessoesMes, setSessoesMes] = useState(0);
  const [margemDesejada, setMargemDesejada] = useState(20);
  const [showResult, setShowResult] = useState(false);

  const resultado = useMemo(() => {
    if (custoMensal <= 0 || sessoesMes <= 0) return null;
    const custoPorSessao = custoMensal / sessoesMes;
    const precoMinimo = custoPorSessao / (1 - margemDesejada / 100);
    const lucroMensal = (precoMinimo - custoPorSessao) * sessoesMes;
    return { custoPorSessao, precoMinimo, lucroMensal };
  }, [custoMensal, sessoesMes, margemDesejada]);

  const handleCalcular = () => {
    if (resultado) setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta to-sage flex items-center justify-center shadow-sm">
              <Calculator className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">FisioPrecifica</span>
          </div>
          <Link href="/login">
            <Button variant="default" size="sm" className="rounded-xl gap-1.5">
              Entrar / Cadastrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              <Calculator className="w-3.5 h-3.5" />
              100% gratuito
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-heading font-bold text-foreground leading-tight"
            >
              Descubra quanto você{' '}
              <span className="text-gradient">deveria cobrar</span>{' '}
              por sessão
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              Calculadora de precificação feita por fisioterapeuta, para fisioterapeutas.
              Pare de chutar o preço — calcule com base nos seus custos reais.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <a href="#calculadora">
                <Button size="lg" className="rounded-xl gap-2 bg-primary hover:bg-primary/90">
                  Calcular meu preço <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-xl gap-2">
                  Criar conta gratuita
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-shrink-0"
          >
            <img src={HERO_IMG} alt="FisioPrecifica" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-terracotta/5 border-y border-terracotta/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
              Você sabe se está tendo lucro ou prejuízo?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A maioria dos fisioterapeutas define o preço da sessão com base no que o colega cobra,
              sem considerar seus próprios custos. O resultado? Trabalham muito, mas o dinheiro nunca sobra.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Calculator */}
      <section id="calculadora" className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            Calculadora Rápida
          </h2>
          <p className="text-muted-foreground">
            Descubra seu preço mínimo em 30 segundos — sem criar conta
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-3xl border border-border shadow-lg p-6 sm:p-8 max-w-lg mx-auto"
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Quanto você gasta por mês? (aluguel, materiais, impostos, etc.)
              </label>
              <CurrencyInput value={custoMensal} onChange={setCustoMensal} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Quantas sessões você atende por mês?
              </label>
              <Input
                type="number"
                min={0}
                value={sessoesMes || ''}
                onChange={(e) => setSessoesMes(parseInt(e.target.value) || 0)}
                placeholder="Ex: 80"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Margem de lucro desejada: <strong className="text-primary">{margemDesejada}%</strong>
              </label>
              <input
                type="range"
                min={5}
                max={60}
                value={margemDesejada}
                onChange={(e) => setMargemDesejada(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>5%</span>
                <span>60%</span>
              </div>
            </div>
            <Button
              onClick={handleCalcular}
              className="w-full rounded-xl"
              size="lg"
              disabled={!resultado}
            >
              <Calculator className="w-4 h-4 mr-2" /> Calcular preço
            </Button>
          </div>

          {/* Result */}
          {showResult && resultado && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-border space-y-4"
            >
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Seu preço mínimo por sessão:</p>
                <p className="text-4xl font-heading font-bold text-primary">
                  {formatarMoeda(resultado.precoMinimo)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Custo por sessão</p>
                  <p className="font-mono font-semibold text-foreground">{formatarMoeda(resultado.custoPorSessao)}</p>
                </div>
                <div className="bg-sage/10 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Lucro mensal estimado</p>
                  <p className="font-mono font-semibold text-sage-dark">{formatarMoeda(resultado.lucroMensal)}</p>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-4 text-center space-y-3">
                <p className="text-sm text-foreground font-medium">
                  Quer a análise completa com indicadores, simulações e relatório PDF?
                </p>
                <Link href="/login">
                  <Button className="rounded-xl gap-2">
                    Criar conta gratuita <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* How it works */}
      <section className="bg-muted/20 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground text-center mb-10">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                step: '1',
                title: 'Cadastre seus custos',
                desc: 'Informe seus custos fixos e variáveis. O app já vem com os itens mais comuns pré-cadastrados.',
              },
              {
                icon: Calculator,
                step: '2',
                title: 'Defina sua margem',
                desc: 'Ajuste a margem de lucro desejada e veja o preço ideal calculado automaticamente.',
              },
              {
                icon: Target,
                step: '3',
                title: 'Acompanhe sua saúde',
                desc: 'Indicadores financeiros, simulações e relatórios para tomar decisões com confiança.',
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground text-center mb-10">
          Tudo o que você precisa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: DollarSign, title: 'Gestão de Custos', desc: 'Custos fixos, variáveis, depreciação e reservas estratégicas.' },
            { icon: TrendingUp, title: 'Simulação de Cenários', desc: 'Compare cenários otimista, realista e pessimista.' },
            { icon: Target, title: 'Score de Saúde', desc: '5 indicadores financeiros com nota de 0 a 100.' },
            { icon: BarChart3, title: 'Múltiplos Serviços', desc: 'Preços diferentes para RPG, Pilates, domiciliar, etc.' },
            { icon: FileText, title: 'Relatório PDF', desc: 'Relatório profissional com seus custos e preços.' },
            { icon: Smartphone, title: 'Funciona no Celular', desc: 'Interface responsiva otimizada para mobile.' },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl border border-border p-5 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-terracotta/10 via-sage-light/20 to-golden-light/30 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Comece agora — 100% gratuito
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sem cartão de crédito, sem período de teste. Crie sua conta e descubra o preço ideal dos seus serviços.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/login">
              <Button size="lg" className="rounded-xl gap-2">
                Criar minha conta <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-sage-dark" /> Sem cartão</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-sage-dark" /> Dados seguros</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-sage-dark" /> Funciona no celular</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60">
          <p>Feito por <span className="font-medium text-muted-foreground/80">Allison Braz</span> — <span className="font-medium text-primary/70">FisioMind</span></p>
          <p>FisioPrecifica © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
