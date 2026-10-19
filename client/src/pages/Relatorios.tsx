/**
 * Relatórios Page
 * Registro simples ou completo, meses anteriores e gráfico com séries escolhidas.
 * No celular a lista continua em cards; no desktop, em tabela.
 */

import { type ReactNode, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, Edit3, FileText, Plus, Trash2 } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ProgressGate from '@/components/ProgressGate';
import PageHeader from '@/components/PageHeader';
import ConfirmAction from '@/components/ConfirmAction';
import CurrencyInput from '@/components/CurrencyInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
  formatarMoeda,
  type PlanoVendido,
  type RegistroMensal,
  type ServicoVendido,
} from '@/lib/store';
import { CHART_TOOLTIP_STYLE, getChartColors } from '@/lib/utils';
import { toast } from 'sonner';

type ReportType = 'simples' | 'completo';
type MetricKey = 'sessoes' | 'receita' | 'custoFixo' | 'custoVariavel' | 'lucro';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const PERIODS = [1, 3, 6, 12];

function monthOffset(offset: number) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMes(mes: string) {
  const [year, month] = mes.split('-');
  const label = MESES[parseInt(month, 10) - 1] ?? mes;
  return `${label} ${year}`;
}

function reportKind(registro: RegistroMensal): ReportType {
  if (registro.tipo === 'completo' || registro.tipo === 'simples') return registro.tipo;
  return 'simples';
}

export default function Relatorios() {
  const { data, addRegistroMensal, updateRegistroMensal, removeRegistroMensal } = useData();
  const chartColors = useMemo(() => getChartColors(), []);
  const metrics: Array<{ key: MetricKey; label: string; color: string }> = [
    { key: 'sessoes', label: 'Sessões realizadas', color: chartColors.chart5 },
    { key: 'receita', label: 'Receita total', color: chartColors.chart2 },
    { key: 'custoFixo', label: 'Custo fixo', color: chartColors.chart1 },
    { key: 'custoVariavel', label: 'Custo variável', color: chartColors.chart4 },
    { key: 'lucro', label: 'Lucro', color: chartColors.chart3 },
  ];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RegistroMensal | null>(null);
  const [reportType, setReportType] = useState<ReportType>('simples');
  const [mes, setMes] = useState(monthOffset(0));
  const [sessoes, setSessoes] = useState(0);
  const [receita, setReceita] = useState(0);
  const [custoFixo, setCustoFixo] = useState(0);
  const [custoVar, setCustoVar] = useState(0);
  const [obs, setObs] = useState('');
  const [servicosVendidos, setServicosVendidos] = useState<ServicoVendido[]>([]);
  const [planosVendidos, setPlanosVendidos] = useState<PlanoVendido[]>([]);
  const [range, setRange] = useState(12);
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(['receita', 'lucro']);

  const openDialog = (registro?: RegistroMensal, initialMonth?: string) => {
    if (registro) {
      setEditing(registro);
      setReportType(reportKind(registro));
      setMes(registro.mes);
      setSessoes(registro.sessoesRealizadas);
      setReceita(registro.receitaTotal);
      setCustoFixo(registro.custoFixoTotal);
      setCustoVar(registro.custoVariavelTotal);
      setObs(registro.observacoes);
      setServicosVendidos(registro.servicosVendidos ?? []);
      setPlanosVendidos(registro.planosVendidos ?? []);
    } else {
      setEditing(null);
      setReportType('simples');
      setMes(initialMonth ?? monthOffset(0));
      setSessoes(0);
      setReceita(0);
      setCustoFixo(calcularTotalCustosFixos(data.custosFixos));
      setCustoVar(calcularTotalCustosVariaveis(data.custosVariaveis));
      setObs('');
      setServicosVendidos([]);
      setPlanosVendidos([]);
    }
    setDialogOpen(true);
  };

  const openPastMonth = (monthsAgo: number) => {
    const targetMonth = monthOffset(monthsAgo);
    const existing = data.registrosMensais.find(registro => registro.mes === targetMonth);
    openDialog(existing, targetMonth);
  };

  const saveRegistro = () => {
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      toast.error('Escolha o mês de referência.');
      return;
    }
    if (mes < monthOffset(12) || mes > monthOffset(0)) {
      toast.error('Você pode registrar o mês atual e até 12 meses anteriores.');
      return;
    }
    const duplicate = data.registrosMensais.find(registro => registro.mes === mes && registro.id !== editing?.id);
    if (duplicate) {
      toast.error('Esse mês já tem um registro. Abra o mês existente para editar.');
      return;
    }

    const registroData = {
      mes,
      sessoesRealizadas: sessoes,
      receitaTotal: receita,
      custoFixoTotal: custoFixo,
      custoVariavelTotal: custoVar,
      observacoes: obs,
      tipo: reportType,
      servicosVendidos: reportType === 'completo' ? servicosVendidos : [],
      planosVendidos: reportType === 'completo' ? planosVendidos : [],
    };

    if (editing) updateRegistroMensal(editing.id, registroData);
    else addRegistroMensal(registroData);
    setDialogOpen(false);
  };

  const sortedRegistros = useMemo(
    () => [...data.registrosMensais].sort((a, b) => b.mes.localeCompare(a.mes)),
    [data.registrosMensais],
  );

  const chartData = useMemo(() => {
    const oldest = monthOffset(range - 1);
    return data.registrosMensais
      .filter(registro => registro.mes >= oldest && registro.mes <= monthOffset(0))
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map(registro => ({
        mes: formatMes(registro.mes),
        sessoes: registro.sessoesRealizadas,
        receita: registro.receitaTotal,
        custoFixo: registro.custoFixoTotal,
        custoVariavel: registro.custoVariavelTotal,
        lucro: registro.receitaTotal - registro.custoFixoTotal - registro.custoVariavelTotal,
      }));
  }, [data.registrosMensais, range]);

  const totais = useMemo(() => {
    const total = data.registrosMensais.reduce((acc, registro) => ({
      sessoes: acc.sessoes + registro.sessoesRealizadas,
      receita: acc.receita + registro.receitaTotal,
      custo: acc.custo + registro.custoFixoTotal + registro.custoVariavelTotal,
    }), { sessoes: 0, receita: 0, custo: 0 });
    return { ...total, lucro: total.receita - total.custo };
  }, [data.registrosMensais]);

  const selectedCurrency = activeMetrics.filter(metric => metric !== 'sessoes');
  const visibleMetrics = metrics.filter(metric => activeMetrics.includes(metric.key));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios Mensais"
        description="Registre meses atuais ou passados e acompanhe seus resultados"
        icon={FileText}
        action={
          <Button className="rounded-xl gap-1.5" onClick={() => openDialog()}>
            <Plus className="w-4 h-4" /> Novo registro
          </Button>
        }
      />
      <ProgressGate requiredLabel="Relatórios" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-golden-light/40 border border-golden/30 rounded-xl p-3 flex items-start gap-3"
      >
        <AlertTriangle className="w-4 h-4 text-terracotta-dark flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">
          <strong>Importante:</strong> Os valores registrados aqui são para acompanhamento pessoal e não substituem contabilidade profissional. Os cálculos de impostos são estimativas — consulte seu contador para a apuração fiscal.
        </p>
      </motion.div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading font-semibold text-foreground">Análise retrospectiva</h2>
            <p className="mt-1 text-sm text-muted-foreground">Escolha o período do gráfico. Isso não cria um relatório novo.</p>
          </div>
          <div className="grid grid-cols-4 gap-2" aria-label="Período exibido no gráfico">
            {PERIODS.map(months => (
              <Button
                key={months}
                type="button"
                size="sm"
                variant={range === months ? 'default' : 'outline'}
                className="rounded-lg min-h-10"
                onClick={() => setRange(months)}
              >
                Ver {months} {months === 1 ? 'mês' : 'meses'}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-primary/20 bg-secondary/30 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-heading font-semibold text-foreground">Completar meses anteriores</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Começou a usar o FisioPrecifica agora? Inclua os meses que ficaram faltando, até 12 meses atrás. Se o mês já existir, ele abre para edição.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Adicionar relatório de mês anterior">
            {PERIODS.map(months => (
              <Button
                key={months}
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg bg-card min-h-10"
                onClick={() => openPastMonth(months)}
              >
                {months === 1 ? 'Mês passado' : `${months} meses atrás`}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {chartData.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="font-heading font-semibold text-foreground">Evolução mensal</h2>
          <p className="mt-1 text-sm text-muted-foreground">Escolha os indicadores que quer ver no gráfico.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {metrics.map(metric => {
              const selected = activeMetrics.includes(metric.key);
              return (
                <Button
                  key={metric.key}
                  type="button"
                  size="sm"
                  variant={selected ? 'default' : 'outline'}
                  aria-pressed={selected}
                  className="rounded-lg min-h-10"
                  onClick={() => setActiveMetrics(current => (
                    selected ? current.filter(key => key !== metric.key) : [...current, metric.key]
                  ))}
                >
                  {metric.label}
                </Button>
              );
            })}
          </div>
          {visibleMetrics.length > 0 ? (
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: chartColors.axis }} stroke={chartColors.axis} />
                  {selectedCurrency.length > 0 && (
                    <YAxis
                      yAxisId="currency"
                      tick={{ fontSize: 12, fill: chartColors.axis }}
                      stroke={chartColors.axis}
                      tickFormatter={(value) => `R$${(Number(value) / 1000).toFixed(0)}k`}
                    />
                  )}
                  {activeMetrics.includes('sessoes') && (
                    <YAxis
                      yAxisId="sessions"
                      orientation="right"
                      tick={{ fontSize: 12, fill: chartColors.axis }}
                      stroke={chartColors.axis}
                      allowDecimals={false}
                    />
                  )}
                  <Tooltip
                    formatter={(value: number, name: string) => (
                      name === 'Sessões realizadas' ? value : formatarMoeda(Number(value))
                    )}
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Legend />
                  {visibleMetrics.map(metric => (
                    <Line
                      key={metric.key}
                      yAxisId={metric.key === 'sessoes' ? 'sessions' : 'currency'}
                      type="monotone"
                      dataKey={metric.key}
                      name={metric.label}
                      stroke={metric.color}
                      strokeWidth={2}
                      dot={{ fill: metric.color }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-muted-foreground">Selecione ao menos um indicador para exibir o gráfico.</p>
          )}
        </motion.section>
      )}

      {data.registrosMensais.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Summary label="Total sessões" value={String(totais.sessoes)} />
          <Summary label="Receita total" value={formatarMoeda(totais.receita)} className="text-sage-dark" />
          <Summary label="Custos totais" value={formatarMoeda(totais.custo)} className="text-terracotta" />
          <Summary
            label="Lucro acumulado"
            value={formatarMoeda(totais.lucro)}
            className={totais.lucro >= 0 ? 'text-sage-dark' : 'text-destructive'}
          />
        </div>
      )}

      {sortedRegistros.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-2xl border border-dashed border-border p-10 text-center"
        >
          <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h2 className="font-heading font-semibold text-foreground">Nenhum registro mensal</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Comece por um registro simples ou detalhe serviços e planos em um relatório completo.
          </p>
          <Button variant="outline" className="mt-4 rounded-xl gap-1.5" onClick={() => openDialog()}>
            <Plus className="w-4 h-4" /> Criar primeiro registro
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {sortedRegistros.map(registro => {
              const figures = figuresOf(registro);
              return (
                <div key={registro.id} className="bg-card rounded-2xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-heading font-semibold text-foreground">{formatMes(registro.mes)}</p>
                      <p className="text-xs text-muted-foreground">{kindLabel(registro)}</p>
                    </div>
                    <RecordActions
                      registro={registro}
                      onEdit={() => openDialog(registro)}
                      onDelete={() => removeRegistroMensal(registro.id)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Metric label="Sessões" value={String(registro.sessoesRealizadas)} />
                    <Metric label="Receita" value={formatarMoeda(registro.receitaTotal)} className="text-sage-dark" />
                    <Metric label="Custos" value={formatarMoeda(figures.custo)} />
                    <Metric label="Lucro" value={formatarMoeda(figures.lucro)} className={figures.lucro >= 0 ? 'text-sage-dark' : 'text-destructive'} />
                  </div>
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                    Ticket médio: <span className="font-mono font-medium text-foreground">{formatarMoeda(figures.ticket)}</span>
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                    <th scope="col" className="text-left px-4 py-3 font-medium">Mês</th>
                    <th scope="col" className="text-left px-4 py-3 font-medium">Tipo</th>
                    <th scope="col" className="text-right px-4 py-3 font-medium">Sessões</th>
                    <th scope="col" className="text-right px-4 py-3 font-medium">Receita</th>
                    <th scope="col" className="text-right px-4 py-3 font-medium">Custos</th>
                    <th scope="col" className="text-right px-4 py-3 font-medium">Lucro</th>
                    <th scope="col" className="text-right px-4 py-3 font-medium">Ticket médio</th>
                    <th scope="col" className="text-center px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegistros.map(registro => {
                    const figures = figuresOf(registro);
                    return (
                      <tr key={registro.id} className="border-b border-border/50">
                        <td className="px-4 py-3 font-medium">{formatMes(registro.mes)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{kindLabel(registro)}</td>
                        <td className="px-4 py-3 text-right font-mono">{registro.sessoesRealizadas}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatarMoeda(registro.receitaTotal)}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatarMoeda(figures.custo)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-medium ${figures.lucro >= 0 ? 'text-sage-dark' : 'text-destructive'}`}>
                          {formatarMoeda(figures.lucro)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{formatarMoeda(figures.ticket)}</td>
                        <td className="px-4 py-3">
                          <RecordActions
                            registro={registro}
                            onEdit={() => openDialog(registro)}
                            onDelete={() => removeRegistroMensal(registro.id)}
                          />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{editing ? 'Editar relatório mensal' : 'Novo relatório mensal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={reportType === 'simples' ? 'default' : 'outline'} className="h-auto rounded-xl p-3 text-left" onClick={() => setReportType('simples')}>
                <span>
                  <strong className="block">Registro simples</strong>
                  <span className="mt-1 block text-xs font-normal">Resumo financeiro do mês.</span>
                </span>
              </Button>
              <Button type="button" variant={reportType === 'completo' ? 'default' : 'outline'} className="h-auto rounded-xl p-3 text-left" onClick={() => setReportType('completo')}>
                <span>
                  <strong className="block">Relatório completo</strong>
                  <span className="mt-1 block text-xs font-normal">Inclui serviços e planos vendidos.</span>
                </span>
              </Button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Mês de referência</label>
              <Input type="month" value={mes} min={monthOffset(12)} max={monthOffset(0)} onChange={event => setMes(event.target.value)} className="rounded-xl font-mono" />
              <div className="mt-2 flex flex-wrap gap-2">
                {PERIODS.map(months => (
                  <Button key={months} type="button" size="sm" variant="outline" className="rounded-lg min-h-10" onClick={() => setMes(monthOffset(months))}>
                    {months === 1 ? 'Mês passado' : `${months} meses atrás`}
                  </Button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Você pode registrar o mês atual e até 12 meses anteriores.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FieldNumber label="Sessões realizadas" value={sessoes} onChange={setSessoes} />
              <FieldCurrency label="Receita total do mês" value={receita} onChange={setReceita} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldCurrency label="Custos fixos" value={custoFixo} onChange={setCustoFixo} />
              <FieldCurrency label="Custos variáveis" value={custoVar} onChange={setCustoVar} />
            </div>
            {!editing && (
              <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                Custos pré-preenchidos com os valores atuais. Ajuste se o mês passado foi diferente.
              </p>
            )}

            {reportType === 'completo' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Detalhe somente as origens de receita sobre as quais você tem informação.</p>
                <RevenueSection
                  title="Serviços vendidos"
                  description="Atendimentos e avaliações realizados no mês."
                  addLabel="Adicionar serviço"
                  disabled={data.tiposServico.length === 0}
                  onAdd={() => setServicosVendidos(current => [...current, { tipoServicoId: data.tiposServico[0]?.id ?? '', quantidade: 0, receitaGerada: 0 }])}
                >
                  {data.tiposServico.length === 0 && <p className="text-xs text-muted-foreground">Cadastre um serviço antes de lançar aqui.</p>}
                  {servicosVendidos.map((item, index) => (
                    <div key={`${item.tipoServicoId}-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_88px_120px_40px] items-end gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Serviço</label>
                        <Select value={item.tipoServicoId} onValueChange={value => updateAt(setServicosVendidos, index, { tipoServicoId: value })}>
                          <SelectTrigger className="rounded-lg"><SelectValue placeholder="Serviço" /></SelectTrigger>
                          <SelectContent>
                            {data.tiposServico.map(service => <SelectItem key={service.id} value={service.id}>{service.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <FieldNumber compact label="Qtd." value={item.quantidade} onChange={value => updateAt(setServicosVendidos, index, { quantidade: value })} />
                      <FieldCurrency compact label="Receita" value={item.receitaGerada} onChange={value => updateAt(setServicosVendidos, index, { receitaGerada: value })} />
                      <RemoveButton onClick={() => setServicosVendidos(current => current.filter((_, itemIndex) => itemIndex !== index))} />
                    </div>
                  ))}
                </RevenueSection>
                <RevenueSection
                  title="Planos de tratamento vendidos"
                  description="Planos contratados ou renovados no mês."
                  addLabel="Adicionar plano"
                  disabled={data.planosTratamento.length === 0}
                  onAdd={() => setPlanosVendidos(current => [...current, { planoTratamentoId: data.planosTratamento[0]?.id ?? '', quantidade: 0, receitaGerada: 0 }])}
                >
                  {data.planosTratamento.length === 0 && <p className="text-xs text-muted-foreground">Cadastre um plano antes de lançar aqui.</p>}
                  {planosVendidos.map((item, index) => (
                    <div key={`${item.planoTratamentoId}-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_88px_120px_40px] items-end gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Plano</label>
                        <Select value={item.planoTratamentoId} onValueChange={value => updateAt(setPlanosVendidos, index, { planoTratamentoId: value })}>
                          <SelectTrigger className="rounded-lg"><SelectValue placeholder="Plano" /></SelectTrigger>
                          <SelectContent>
                            {data.planosTratamento.map(plano => <SelectItem key={plano.id} value={plano.id}>{plano.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <FieldNumber compact label="Qtd." value={item.quantidade} onChange={value => updateAt(setPlanosVendidos, index, { quantidade: value })} />
                      <FieldCurrency compact label="Receita" value={item.receitaGerada} onChange={value => updateAt(setPlanosVendidos, index, { receitaGerada: value })} />
                      <RemoveButton onClick={() => setPlanosVendidos(current => current.filter((_, itemIndex) => itemIndex !== index))} />
                    </div>
                  ))}
                </RevenueSection>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">Observações</label>
              <Input value={obs} onChange={event => setObs(event.target.value)} placeholder="Notas sobre o mês" className="rounded-xl" />
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
            <Button onClick={saveRegistro} className="w-full rounded-xl">{editing ? 'Salvar alterações' : 'Registrar mês'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function figuresOf(registro: RegistroMensal) {
  const custo = registro.custoFixoTotal + registro.custoVariavelTotal;
  return {
    custo,
    lucro: registro.receitaTotal - custo,
    ticket: registro.sessoesRealizadas > 0 ? registro.receitaTotal / registro.sessoesRealizadas : 0,
  };
}

function kindLabel(registro: RegistroMensal) {
  if (reportKind(registro) !== 'completo') return 'Simples';
  const lancamentos = (registro.servicosVendidos?.length ?? 0) + (registro.planosVendidos?.length ?? 0);
  return lancamentos > 0 ? `Completo · ${lancamentos} lançamento(s)` : 'Completo';
}

function updateAt<T>(setter: (value: T[] | ((current: T[]) => T[])) => void, index: number, updates: Partial<T>) {
  setter(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item));
}

function Summary({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-mono font-bold ${className}`}>{value}</p>
    </div>
  );
}

function Metric({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-mono font-medium ${className}`}>{value}</p>
    </div>
  );
}

function RecordActions({ registro, onEdit, onDelete }: { registro: RegistroMensal; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit} aria-label={`Editar ${formatMes(registro.mes)}`}>
        <Edit3 className="w-4 h-4" />
      </Button>
      <ConfirmAction
        title={`Excluir registro de ${formatMes(registro.mes)}?`}
        description="Este registro mensal será removido permanentemente."
        confirmLabel="Excluir registro"
        onConfirm={onDelete}
      >
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive" aria-label={`Excluir ${formatMes(registro.mes)}`}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </ConfirmAction>
    </div>
  );
}

function FieldNumber({ label, value, onChange, compact = false }: { label: string; value: number; onChange: (value: number) => void; compact?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <Input type="number" min={0} value={value} onChange={event => onChange(parseInt(event.target.value, 10) || 0)} className={`rounded-xl font-mono ${compact ? 'h-10' : ''}`} />
    </div>
  );
}

function FieldCurrency({ label, value, onChange, compact = false }: { label: string; value: number; onChange: (value: number) => void; compact?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <CurrencyInput value={value} onChange={onChange} className={compact ? 'h-10' : undefined} />
    </div>
  );
}

function RevenueSection({ title, description, addLabel, disabled, onAdd, children }: {
  title: string;
  description: string;
  addLabel: string;
  disabled: boolean;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button type="button" size="sm" variant="outline" className="shrink-0 rounded-lg min-h-10" disabled={disabled} onClick={onAdd}>
          <Plus className="mr-1 h-3.5 w-3.5" /> {addLabel}
        </Button>
      </div>
      {children}
    </section>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-muted-foreground hover:text-destructive" aria-label="Remover lançamento" onClick={onClick}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
