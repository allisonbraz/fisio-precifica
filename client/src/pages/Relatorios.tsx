/**
 * Relatórios Page
 * Design: Warm Professional — Organic Modernism
 * Monthly records and financial reports
 */

import { useState, useMemo } from 'react';
import ProgressGate from '@/components/ProgressGate';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import ConfirmAction from '@/components/ConfirmAction';
import CurrencyInput from '@/components/CurrencyInput';
import { useData } from '@/contexts/DataContext';
import {
  formatarMoeda,
  RegistroMensal,
  calcularCustoOperacionalMensal,
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
} from '@/lib/store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_TOOLTIP_STYLE } from '@/lib/utils';

export default function Relatorios() {
  const { data, addRegistroMensal, updateRegistroMensal, removeRegistroMensal } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RegistroMensal | null>(null);

  const [mes, setMes] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [sessoes, setSessoes] = useState(0);
  const [receita, setReceita] = useState(0);
  const [custoFixo, setCustoFixo] = useState(0);
  const [custoVar, setCustoVar] = useState(0);
  const [obs, setObs] = useState('');

  const custoAtual = calcularCustoOperacionalMensal(data);

  const openDialog = (registro?: RegistroMensal) => {
    if (registro) {
      setEditing(registro);
      setMes(registro.mes);
      setSessoes(registro.sessoesRealizadas);
      setReceita(registro.receitaTotal);
      setCustoFixo(registro.custoFixoTotal);
      setCustoVar(registro.custoVariavelTotal);
      setObs(registro.observacoes);
    } else {
      setEditing(null);
      const now = new Date();
      setMes(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      setSessoes(0);
      setReceita(0);
      setCustoFixo(calcularTotalCustosFixos(data.custosFixos));
      setCustoVar(calcularTotalCustosVariaveis(data.custosVariaveis));
      setObs('');
    }
    setDialogOpen(true);
  };

  const saveRegistro = () => {
    const registroData = {
      mes,
      sessoesRealizadas: sessoes,
      receitaTotal: receita,
      custoFixoTotal: custoFixo,
      custoVariavelTotal: custoVar,
      observacoes: obs,
    };
    if (editing) {
      updateRegistroMensal(editing.id, registroData);
    } else {
      addRegistroMensal(registroData);
    }
    setDialogOpen(false);
  };

  const sortedRegistros = useMemo(() =>
    [...data.registrosMensais].sort((a, b) => b.mes.localeCompare(a.mes)),
    [data.registrosMensais]
  );

  const chartData = useMemo(() =>
    [...data.registrosMensais]
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map(r => ({
        mes: r.mes.split('-').reverse().join('/'),
        receita: r.receitaTotal,
        custo: r.custoFixoTotal + r.custoVariavelTotal,
        lucro: r.receitaTotal - (r.custoFixoTotal + r.custoVariavelTotal),
      })),
    [data.registrosMensais]
  );

  const totais = useMemo(() => {
    const total = data.registrosMensais.reduce((acc, r) => ({
      sessoes: acc.sessoes + r.sessoesRealizadas,
      receita: acc.receita + r.receitaTotal,
      custo: acc.custo + r.custoFixoTotal + r.custoVariavelTotal,
    }), { sessoes: 0, receita: 0, custo: 0 });
    return { ...total, lucro: total.receita - total.custo };
  }, [data.registrosMensais]);

  const formatMes = (mes: string) => {
    const [year, month] = mes.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios Mensais"
        description="Registre e acompanhe seus resultados mês a mês"
        icon={FileText}
        action={
          <Button className="rounded-xl gap-1.5" onClick={() => openDialog()}>
            <Plus className="w-4 h-4" /> Novo Registro
          </Button>
        }
      />

      <ProgressGate requiredLabel="Relatórios" />

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 flex items-start gap-3"
      >
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">
          <strong>Importante:</strong> Os valores registrados aqui são para acompanhamento pessoal e não substituem contabilidade profissional. Os cálculos de lucro não incluem impostos — consulte seu contador para apuração fiscal.
        </p>
      </motion.div>

      {/* Chart */}
      {chartData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4">Evolução Mensal</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="#8a7e74" />
                <YAxis tick={{ fontSize: 12 }} stroke="#8a7e74" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatarMoeda(value)}
                  contentStyle={CHART_TOOLTIP_STYLE}
                />
                <Legend />
                <Line type="monotone" dataKey="receita" name="Receita" stroke="#7c9a82" strokeWidth={2} dot={{ fill: '#7c9a82' }} />
                <Line type="monotone" dataKey="custo" name="Custo" stroke="#c2785c" strokeWidth={2} dot={{ fill: '#c2785c' }} />
                <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#d4a853" strokeWidth={2} dot={{ fill: '#d4a853' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {data.registrosMensais.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Total Sessões</p>
            <p className="text-xl font-mono font-bold text-foreground">{totais.sessoes}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Total Receita</p>
            <p className="text-xl font-mono font-bold text-sage-dark">{formatarMoeda(totais.receita)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Total Custos</p>
            <p className="text-xl font-mono font-bold text-terracotta">{formatarMoeda(totais.custo)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Lucro Acumulado</p>
            <p className={`text-xl font-mono font-bold ${totais.lucro >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
              {formatarMoeda(totais.lucro)}
            </p>
          </div>
        </div>
      )}

      {/* Records List */}
      {sortedRegistros.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-2xl border border-dashed border-border p-10 text-center"
        >
          <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="font-heading font-semibold text-foreground">Nenhum registro mensal</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Registre seus resultados mensais para acompanhar a evolução do seu consultório.
          </p>
          <Button variant="outline" className="mt-4 rounded-xl gap-1.5" onClick={() => openDialog()}>
            <Plus className="w-4 h-4" /> Criar primeiro registro
          </Button>
        </motion.div>
      ) : (
        <>
        {/* Mobile card layout */}
        <div className="space-y-3 sm:hidden">
          {sortedRegistros.map((reg) => {
            const custoTotal = reg.custoFixoTotal + reg.custoVariavelTotal;
            const lucro = reg.receitaTotal - custoTotal;
            const ticketMedio = reg.sessoesRealizadas > 0 ? reg.receitaTotal / reg.sessoesRealizadas : 0;
            return (
              <div key={reg.id} className="bg-card rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-foreground">{formatMes(reg.mes)}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openDialog(reg)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <ConfirmAction
                      title={`Excluir registro de ${formatMes(reg.mes)}?`}
                      description="Este registro mensal será removido permanentemente."
                      confirmLabel="Excluir registro"
                      onConfirm={() => removeRegistroMensal(reg.id)}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </ConfirmAction>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Sessões</p>
                    <p className="font-mono font-medium">{reg.sessoesRealizadas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Receita</p>
                    <p className="font-mono font-medium text-sage-dark">{formatarMoeda(reg.receitaTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Custos</p>
                    <p className="font-mono font-medium">{formatarMoeda(custoTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lucro</p>
                    <p className={`font-mono font-bold ${lucro >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>{formatarMoeda(lucro)}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                  Ticket médio: <span className="font-mono font-medium text-foreground">{formatarMoeda(ticketMedio)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden hidden sm:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                  <th scope="col" className="text-left px-4 py-3 font-medium">Mês</th>
                  <th scope="col" className="text-right px-4 py-3 font-medium">Sessões</th>
                  <th scope="col" className="text-right px-4 py-3 font-medium">Receita</th>
                  <th scope="col" className="text-right px-4 py-3 font-medium">Custos</th>
                  <th scope="col" className="text-right px-4 py-3 font-medium">Lucro</th>
                  <th scope="col" className="text-right px-4 py-3 font-medium">Ticket Médio</th>
                  <th scope="col" className="text-center px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedRegistros.map((reg) => {
                  const custoTotal = reg.custoFixoTotal + reg.custoVariavelTotal;
                  const lucro = reg.receitaTotal - custoTotal;
                  const ticketMedio = reg.sessoesRealizadas > 0 ? reg.receitaTotal / reg.sessoesRealizadas : 0;
                  return (
                    <tr key={reg.id} className="border-b border-border/50">
                      <td className="px-4 py-3 font-medium">{formatMes(reg.mes)}</td>
                      <td className="px-4 py-3 text-right font-mono">{reg.sessoesRealizadas}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatarMoeda(reg.receitaTotal)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatarMoeda(custoTotal)}</td>
                      <td className={`px-4 py-3 text-right font-mono font-medium ${lucro >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                        {formatarMoeda(lucro)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatarMoeda(ticketMedio)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openDialog(reg)}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <ConfirmAction
                            title={`Excluir registro de ${formatMes(reg.mes)}?`}
                            description="Este registro mensal será removido permanentemente."
                            confirmLabel="Excluir registro"
                            onConfirm={() => removeRegistroMensal(reg.id)}
                          >
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </ConfirmAction>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? 'Editar Registro' : 'Novo Registro Mensal'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mês de referência</label>
              <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="rounded-xl font-mono" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Sessões realizadas</label>
              <Input type="number" value={sessoes} onChange={(e) => setSessoes(parseInt(e.target.value) || 0)} className="rounded-xl font-mono" min={0} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Receita total do mês</label>
              <CurrencyInput value={receita} onChange={setReceita} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Custos fixos</label>
                <CurrencyInput value={custoFixo} onChange={setCustoFixo} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Custos variáveis</label>
                <CurrencyInput value={custoVar} onChange={setCustoVar} />
              </div>
            </div>
            {!editing && (
              <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                Valores pré-preenchidos com seus custos atuais. Ajuste se necessário.
              </p>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Observações</label>
              <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Notas sobre o mês" className="rounded-xl" />
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lucro:</span>
                <span className={`font-mono font-medium ${receita - custoFixo - custoVar >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                  {formatarMoeda(receita - custoFixo - custoVar)}
                </span>
              </div>
              {sessoes > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket médio:</span>
                  <span className="font-mono font-medium">{formatarMoeda(receita / sessoes)}</span>
                </div>
              )}
            </div>
            <Button onClick={saveRegistro} className="w-full rounded-xl">
              {editing ? 'Salvar alterações' : 'Registrar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
