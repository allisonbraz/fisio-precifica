/**
 * Reservas Estratégicas Page
 * Separação formal: Se é guardado por decisão → é RESERVA
 * Features: reservas com % sobre receita, alertas inteligentes, zerar tudo
 */

import { useState, useMemo } from 'react';
import ProgressGate from '@/components/ProgressGate';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Info,
  RotateCcw,
  HelpCircle,
  AlertTriangle,
  TrendingUp,
  Wallet,
  PiggyBank,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PageHeader from '@/components/PageHeader';
import ConfirmAction from '@/components/ConfirmAction';
import CurrencyInput from '@/components/CurrencyInput';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import { useMetrics } from '@/lib/useMetrics';
import {
  calcularTotalReservas,
  formatarMoeda,
  formatarPercentual,
  ReservaEstrategica,
} from '@/lib/store';
import { toast } from 'sonner';

interface ReservasProps {
  asTab?: boolean;
}

export default function Reservas({ asTab = false }: ReservasProps) {
  const {
    data,
    isRegistered,
    updateReserva,
    addReserva,
    zeroReserva,
    zerarTodasReservas,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoDesc, setNovoDesc] = useState('');

  const m = useMetrics(data);
  const totalReservas = m.totalReservas;
  const custoOperacional = m.custoOperacionalMensal;
  const receitaBruta = m.receitaBruta;
  const percentualReservas = receitaBruta > 0 ? (totalReservas / receitaBruta) * 100 : 0;

  // Smart alerts
  const alerts = useMemo(() => {
    const list: { type: 'warning' | 'danger' | 'success'; message: string }[] = [];

    // Check if reservas > lucro operacional
    const lucroOp = receitaBruta - custoOperacional;
    if (totalReservas > lucroOp && lucroOp > 0) {
      list.push({
        type: 'danger',
        message: `Suas reservas (${formatarMoeda(totalReservas)}) excedem o lucro operacional (${formatarMoeda(lucroOp)}). Reduza as reservas ou aumente o preço.`,
      });
    }

    // Check if reservas > 40% of revenue
    if (percentualReservas > 40) {
      list.push({
        type: 'warning',
        message: `Reservas representam ${percentualReservas.toFixed(1)}% da receita. Acima de 40% pode comprometer a sustentabilidade.`,
      });
    }

    // Check if no reservas
    if (totalReservas === 0) {
      list.push({
        type: 'warning',
        message: 'Você não tem reservas estratégicas definidas. Considere reservar pelo menos 5-10% da receita para emergências e crescimento.',
      });
    }

    // Positive feedback
    if (percentualReservas > 0 && percentualReservas <= 30 && totalReservas <= lucroOp) {
      list.push({
        type: 'success',
        message: `Reservas saudáveis: ${percentualReservas.toFixed(1)}% da receita, dentro do lucro operacional.`,
      });
    }

    return list;
  }, [totalReservas, receitaBruta, custoOperacional, percentualReservas]);

  const handleAdd = () => {
    if (!novoNome.trim()) return;
    addReserva({ nome: novoNome, valor: 0, descricao: novoDesc, frequencia: 'mensal' });
    setNovoNome('');
    setNovoDesc('');
    setDialogOpen(false);
    toast.success('Reserva adicionada!');
  };

  return (
    <div className="space-y-6">
      {!asTab && (
        <>
          <PageHeader
            title="Reservas Estratégicas"
            description="Valores guardados por decisão estratégica para crescer, se proteger e investir."
            icon={ShieldCheck}
            action={
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5" disabled={!isRegistered}>
                    <RotateCcw className="w-4 h-4" /> Zerar tudo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-heading">Zerar todas as reservas?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso vai zerar os valores de todas as reservas estratégicas. Os itens não serão excluídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => { zerarTodasReservas(); toast.success('Reservas zeradas!'); }}
                      className="rounded-xl bg-destructive hover:bg-destructive/90"
                    >
                      Zerar tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            }
          />

          <ProgressGate requiredLabel="Reservas" />
        </>
      )}

      {/* Educational info box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80">
          Reservas são valores que você separa para necessidades futuras, emergências e crescimento. Elas são <strong>incluídas na base de custo</strong> para formação do preço, garantindo que seu preço já cubra essas reservas.
        </p>
      </motion.div>

      {/* Principle banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sage/5 border border-sage/20 rounded-2xl p-4 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground/80 space-y-2">
          <p className="font-medium text-sage-dark">Princípio: Se é guardado por decisão → é RESERVA</p>
          <p>
            Reservas são valores que você <strong>decide</strong> separar para proteger e fazer crescer seu negócio.
            Elas entram na <strong>base de custo para precificação</strong>, ou seja, seu preço é calculado para já cobrir essas reservas.
            No DRE, aparecem entre o Lucro Operacional e o Lucro Disponível.
          </p>
          <p className="text-xs text-muted-foreground">
            Recomendação: reserve entre 5% e 20% da receita bruta para manter saúde financeira a longo prazo.
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Reservas (mensal)"
          value={formatarMoeda(totalReservas)}
          subtitle={`${data.reservasEstrategicas.filter(r => r.valor > 0).length} reservas ativas`}
          icon={PiggyBank}
          variant="primary"
        />
        <StatCard
          title="% da Receita"
          value={formatarPercentual(percentualReservas)}
          subtitle={`Sobre receita de ${formatarMoeda(receitaBruta)}`}
          icon={TrendingUp}
          variant={percentualReservas > 40 ? 'danger' : percentualReservas > 0 ? 'success' : 'warning'}
        />
        <StatCard
          title="Lucro Disponível"
          value={formatarMoeda(m.lucroDisponivel)}
          subtitle="Receita − Impostos − Custos − Reservas"
          icon={Wallet}
          variant={m.lucroDisponivel >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-3 flex items-start gap-3 border ${
                alert.type === 'danger'
                  ? 'bg-destructive/5 border-destructive/20'
                  : alert.type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30'
                  : 'bg-sage/5 border-sage/20'
              }`}
            >
              {alert.type === 'danger' ? (
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              ) : alert.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-sage-dark flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm text-foreground/80">{alert.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reservas List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Valores incluídos na base de custo para formação do preço
          </p>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1.5"
            onClick={() => {
              if (!isRegistered) { toast.error('Faça login para editar'); return; }
              setDialogOpen(true);
            }}
            disabled={!isRegistered}
          >
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b border-border">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Reserva</span>
              <span>Valor Mensal / Ação</span>
            </div>
          </div>
          <AnimatePresence>
            {data.reservasEstrategicas.map((reserva, index) => (
              <motion.div
                key={reserva.id}
                initial={false}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className={`px-4 py-3 ${index < data.reservasEstrategicas.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{reserva.nome}</span>
                      {reserva.descricao && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[300px] text-xs">
                            {reserva.descricao}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {reserva.modo === 'percentual' && reserva.percentual ? (
                      <span className="text-xs text-sage-dark font-medium">
                        = {formatarMoeda(receitaBruta * reserva.percentual)}/mês ({(reserva.percentual * 100).toFixed(1)}% da receita)
                      </span>
                    ) : reserva.valor > 0 && receitaBruta > 0 ? (
                      <span className="text-xs text-sage-dark font-medium">
                        = {((reserva.valor / receitaBruta) * 100).toFixed(1)}% da receita
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mode toggle: fixo / percentual */}
                    <div className="hidden sm:flex">
                      <button
                        disabled={!isRegistered}
                        onClick={() => updateReserva(reserva.id, { modo: 'fixo' })}
                        className={`px-2 py-1 text-[10px] font-medium rounded-l-lg border transition-colors ${
                          reserva.modo !== 'percentual'
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                        }`}
                      >
                        R$
                      </button>
                      <button
                        disabled={!isRegistered}
                        onClick={() => updateReserva(reserva.id, { modo: 'percentual', percentual: reserva.percentual || 0.05 })}
                        className={`px-2 py-1 text-[10px] font-medium rounded-r-lg border-t border-b border-r transition-colors ${
                          reserva.modo === 'percentual'
                            ? 'bg-sage/10 text-sage-dark border-sage/30'
                            : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                        }`}
                      >
                        %
                      </button>
                    </div>

                    <div className="w-[140px] sm:w-[160px]">
                      {reserva.modo === 'percentual' ? (
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            step={0.5}
                            value={((reserva.percentual || 0) * 100).toFixed(1)}
                            onChange={(e) => {
                              if (!isRegistered) { toast.error('Faça login para editar'); return; }
                              updateReserva(reserva.id, { percentual: parseFloat(e.target.value) / 100 || 0 });
                            }}
                            disabled={!isRegistered}
                            className="rounded-xl pr-8 font-mono text-sm h-9"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      ) : (
                        <CurrencyInput
                          value={reserva.valor}
                          onChange={(v) => {
                            if (!isRegistered) { toast.error('Faça login para editar'); return; }
                            updateReserva(reserva.id, { valor: v });
                          }}
                          disabled={!isRegistered}
                        />
                      )}
                    </div>
                    <ConfirmAction
                      title={`Zerar "${reserva.nome}"?`}
                      description="O valor desta reserva será zerado (R$ 0,00). O item não será excluído."
                      confirmLabel="Zerar valor"
                      onConfirm={() => {
                        zeroReserva(reserva.id);
                        toast.info(`${reserva.nome} zerada`);
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg flex-shrink-0"
                        disabled={!isRegistered}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </ConfirmAction>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="px-4 py-3 bg-sage/5 border-t border-border flex items-center justify-between">
            <span className="text-sm font-heading font-bold text-foreground">TOTAL RESERVAS (MENSAL)</span>
            <span className="font-mono font-bold text-sage-dark text-sm">
              {formatarMoeda(totalReservas)}
            </span>
          </div>
        </div>
      </div>

      {/* Lucro breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-5 space-y-3"
      >
        <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Composição do Lucro
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Receita Bruta Estimada</span>
            <span className="font-mono font-medium text-foreground">{formatarMoeda(receitaBruta)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">− Impostos ({(data.impostoPercentual * 100).toFixed(0)}%)</span>
            <span className="font-mono font-medium text-amber-600">−{formatarMoeda(m.impostosMensal)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">− Custos Operacionais</span>
            <span className="font-mono font-medium text-destructive">−{formatarMoeda(custoOperacional)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50 bg-primary/5 -mx-5 px-5">
            <span className="text-sm font-semibold text-foreground">= Lucro Operacional</span>
            <span className={`font-mono font-bold ${m.lucroOperacional >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
              {formatarMoeda(m.lucroOperacional)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">− Reservas Estratégicas</span>
            <span className="font-mono font-medium text-amber-600">−{formatarMoeda(totalReservas)}</span>
          </div>
          <div className="flex justify-between items-center py-2 bg-sage/5 -mx-5 px-5 rounded-b-xl">
            <div>
              <span className="text-sm font-bold text-foreground block">= Lucro Disponível</span>
              <span className="text-[10px] text-muted-foreground">O que sobra para: Reinvestir · Crescer · Dividendos</span>
            </div>
            <span className={`font-mono font-bold text-lg ${m.lucroDisponivel >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
              {formatarMoeda(m.lucroDisponivel)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Adicionar Reserva Estratégica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nome da reserva</label>
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Fundo de emergência, Capacitação, etc."
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição (opcional)</label>
              <Input
                value={novoDesc}
                onChange={(e) => setNovoDesc(e.target.value)}
                placeholder="Para que serve esta reserva?"
                className="rounded-xl"
              />
            </div>
            <Button onClick={handleAdd} className="w-full rounded-xl" disabled={!novoNome.trim()}>
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
