/**
 * Custos Page v3
 * Evolução Estrutural: Custos Operacionais / Depreciação / Variáveis
 * Features: mensal/anual toggle, descriptions, zero on trash, zerar tudo,
 *           depreciação condicional (bloqueada se parcela ativa), pergunta inteligente
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Plus,
  Trash2,
  Info,
  RotateCcw,
  Calendar,
  CalendarDays,
  HelpCircle,
  ShieldAlert,
  TrendingDown,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/PageHeader';
import ConfirmAction from '@/components/ConfirmAction';
import CurrencyInput from '@/components/CurrencyInput';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosOperacionais,
  calcularTotalDepreciacao,
  calcularTotalCustosVariaveis,
  calcularCustoTotalMensal,
  formatarMoeda,
  getValorMensal,
  FrequenciaCusto,
  CustoFixo,
} from '@/lib/store';
import { toast } from 'sonner';

export default function Custos() {
  const {
    data,
    isRegistered,
    updateCustoFixo,
    addCustoFixo,
    zeroCustoFixo,
    updateCustoVariavel,
    addCustoVariavel,
    zeroCustoVariavel,
    zerarTodosCustos,
  } = useData();

  const [novoNome, setNovoNome] = useState('');
  const [novoObs, setNovoObs] = useState('');
  const [novoFreq, setNovoFreq] = useState<FrequenciaCusto>('mensal');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'operacional' | 'depreciacao' | 'variavel'>('operacional');
  // Smart question state
  const [smartQuestionOpen, setSmartQuestionOpen] = useState(false);
  const [pendingCusto, setPendingCusto] = useState<{ nome: string; obs: string; freq: FrequenciaCusto } | null>(null);

  const custosOperacionais = data.custosFixos.filter(c => !c.isDepreciacao);
  const custosDepreciacao = data.custosFixos.filter(c => c.isDepreciacao);
  const totalOperacionais = calcularTotalCustosOperacionais(data.custosFixos);
  const totalDepreciacao = calcularTotalDepreciacao(data.custosFixos);
  const totalVariaveis = calcularTotalCustosVariaveis(data.custosVariaveis);
  const totalMensal = calcularCustoTotalMensal(data);

  // Smart question: items that might be reservas
  const AMBIGUOUS_KEYWORDS = ['curso', 'capacitação', 'mentoria', 'equipamento', 'aquisição', 'expansão', 'reposição'];

  const handleAddCusto = () => {
    if (!novoNome.trim()) return;

    // Check if this might be a reserva (smart question)
    const nameLC = novoNome.toLowerCase();
    const isAmbiguous = AMBIGUOUS_KEYWORDS.some(kw => nameLC.includes(kw));

    if (isAmbiguous && dialogType === 'operacional') {
      setPendingCusto({ nome: novoNome, obs: novoObs, freq: novoFreq });
      setDialogOpen(false);
      setSmartQuestionOpen(true);
      return;
    }

    addCustoToList();
  };

  const addCustoToList = () => {
    const nome = pendingCusto?.nome || novoNome;
    const obs = pendingCusto?.obs || novoObs;
    const freq = pendingCusto?.freq || novoFreq;

    if (dialogType === 'operacional') {
      addCustoFixo({ nome, valor: 0, frequencia: freq, observacao: obs, descricao: '', isDepreciacao: false, temParcelaAtiva: false });
    } else if (dialogType === 'depreciacao') {
      addCustoFixo({ nome, valor: 0, frequencia: freq, observacao: obs, descricao: '', isDepreciacao: true, temParcelaAtiva: false });
    } else {
      addCustoVariavel({ nome, valor: 0, frequencia: freq, observacao: obs, descricao: '' });
    }
    resetDialog();
    toast.success('Custo adicionado com sucesso!');
  };

  const resetDialog = () => {
    setNovoNome('');
    setNovoObs('');
    setNovoFreq('mensal');
    setDialogOpen(false);
    setSmartQuestionOpen(false);
    setPendingCusto(null);
  };

  const openAddDialog = (type: 'operacional' | 'depreciacao' | 'variavel') => {
    if (!isRegistered) {
      toast.error('Cadastre-se para editar os custos');
      return;
    }
    setDialogType(type);
    setNovoNome('');
    setNovoObs('');
    setNovoFreq('mensal');
    setDialogOpen(true);
  };

  const handleZerarTudo = () => {
    zerarTodosCustos();
    toast.success('Todos os custos foram zerados!');
  };

  const renderCustoRow = (
    custo: CustoFixo,
    type: 'operacional' | 'depreciacao',
    index: number,
    total: number,
  ) => {
    const valorMensal = getValorMensal(custo);
    const isAnual = custo.frequencia === 'anual';
    const isBlocked = custo.isDepreciacao && custo.temParcelaAtiva;

    return (
      <motion.div
        key={custo.id}
        initial={false}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
        className={`px-4 py-3 ${index < total - 1 ? 'border-b border-border/50' : ''} ${isBlocked ? 'bg-destructive/5' : ''}`}
      >
        <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isBlocked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {custo.nome}
              </span>
              {custo.descricao && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] text-xs">
                    {custo.descricao}
                  </TooltipContent>
                </Tooltip>
              )}
              {isBlocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px] text-xs">
                    <span className="font-semibold text-destructive">Bloqueado:</span> Este item tem parcela ativa. A depreciação não é contabilizada enquanto houver financiamento.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {custo.observacao && (
              <span className="text-xs text-muted-foreground block">{custo.observacao}</span>
            )}
            {isAnual && custo.valor > 0 && !isBlocked && (
              <span className="text-xs text-sage-dark font-medium">
                = {formatarMoeda(valorMensal)}/mês (÷ 12)
              </span>
            )}
            {/* Parcela ativa toggle for depreciação items */}
            {custo.isDepreciacao && (
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={custo.temParcelaAtiva || false}
                  onCheckedChange={(checked) => {
                    if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                    updateCustoFixo(custo.id, { temParcelaAtiva: checked });
                    if (checked) {
                      toast.warning('Depreciação bloqueada: parcela ativa detectada');
                    } else {
                      toast.success('Depreciação liberada');
                    }
                  }}
                  disabled={!isRegistered}
                  className="scale-75"
                />
                <span className="text-[10px] text-muted-foreground">
                  {custo.temParcelaAtiva ? 'Parcela ativa (depreciação bloqueada)' : 'Sem parcela ativa'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex">
              <button
                disabled={!isRegistered || isBlocked}
                onClick={() => updateCustoFixo(custo.id, { frequencia: 'mensal' })}
                className={`px-2 py-1 text-[10px] font-medium rounded-l-lg border transition-colors ${
                  !isAnual
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Mensal
              </button>
              <button
                disabled={!isRegistered || isBlocked}
                onClick={() => updateCustoFixo(custo.id, { frequencia: 'anual' })}
                className={`px-2 py-1 text-[10px] font-medium rounded-r-lg border-t border-b border-r transition-colors ${
                  isAnual
                    ? 'bg-sage/10 text-sage-dark border-sage/30'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Anual
              </button>
            </div>

            <div className="w-[140px] sm:w-[160px]">
              <CurrencyInput
                value={isBlocked ? 0 : custo.valor}
                onChange={(v) => {
                  if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                  updateCustoFixo(custo.id, { valor: v });
                }}
                disabled={!isRegistered || isBlocked}
              />
            </div>

            <ConfirmAction
              title={`Zerar "${custo.nome}"?`}
              description="O valor deste custo será zerado (R$ 0,00). O item não será excluído."
              confirmLabel="Zerar valor"
              onConfirm={() => {
                zeroCustoFixo(custo.id);
                toast.info(`${custo.nome} zerado`);
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg flex-shrink-0"
                disabled={!isRegistered || isBlocked}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </ConfirmAction>
          </div>
        </div>

        {/* Mobile frequency toggle */}
        <div className="flex sm:hidden mt-2 gap-1">
          <button
            disabled={!isRegistered || isBlocked}
            onClick={() => updateCustoFixo(custo.id, { frequencia: 'mensal' })}
            className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-l-lg border transition-colors ${
              !isAnual
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-muted/30 text-muted-foreground border-border'
            }`}
          >
            <Calendar className="w-3 h-3 inline mr-1" />Mensal
          </button>
          <button
            disabled={!isRegistered || isBlocked}
            onClick={() => updateCustoFixo(custo.id, { frequencia: 'anual' })}
            className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-r-lg border-t border-b border-r transition-colors ${
              isAnual
                ? 'bg-sage/10 text-sage-dark border-sage/30'
                : 'bg-muted/30 text-muted-foreground border-border'
            }`}
          >
            <CalendarDays className="w-3 h-3 inline mr-1" />Anual
          </button>
        </div>
      </motion.div>
    );
  };

  const renderCustoVariavelRow = (
    custo: { id: string; nome: string; valor: number; frequencia: FrequenciaCusto; observacao: string; descricao: string },
    index: number,
    total: number,
  ) => {
    const valorMensal = getValorMensal(custo);
    const isAnual = custo.frequencia === 'anual';

    return (
      <motion.div
        key={custo.id}
        initial={false}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
        className={`px-4 py-3 ${index < total - 1 ? 'border-b border-border/50' : ''}`}
      >
        <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{custo.nome}</span>
              {custo.descricao && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] text-xs">
                    {custo.descricao}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {custo.observacao && (
              <span className="text-xs text-muted-foreground block">{custo.observacao}</span>
            )}
            {isAnual && custo.valor > 0 && (
              <span className="text-xs text-sage-dark font-medium">
                = {formatarMoeda(valorMensal)}/mês (÷ 12)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex">
              <button
                disabled={!isRegistered}
                onClick={() => updateCustoVariavel(custo.id, { frequencia: 'mensal' })}
                className={`px-2 py-1 text-[10px] font-medium rounded-l-lg border transition-colors ${
                  !isAnual
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                }`}
              >
                Mensal
              </button>
              <button
                disabled={!isRegistered}
                onClick={() => updateCustoVariavel(custo.id, { frequencia: 'anual' })}
                className={`px-2 py-1 text-[10px] font-medium rounded-r-lg border-t border-b border-r transition-colors ${
                  isAnual
                    ? 'bg-sage/10 text-sage-dark border-sage/30'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                }`}
              >
                Anual
              </button>
            </div>

            <div className="w-[140px] sm:w-[160px]">
              <CurrencyInput
                value={custo.valor}
                onChange={(v) => {
                  if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                  updateCustoVariavel(custo.id, { valor: v });
                }}
                disabled={!isRegistered}
              />
            </div>

            <ConfirmAction
              title={`Zerar "${custo.nome}"?`}
              description="O valor deste custo será zerado (R$ 0,00). O item não será excluído."
              confirmLabel="Zerar valor"
              onConfirm={() => {
                zeroCustoVariavel(custo.id);
                toast.info(`${custo.nome} zerado`);
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

        <div className="flex sm:hidden mt-2 gap-1">
          <button
            disabled={!isRegistered}
            onClick={() => updateCustoVariavel(custo.id, { frequencia: 'mensal' })}
            className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-l-lg border transition-colors ${
              !isAnual
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-muted/30 text-muted-foreground border-border'
            }`}
          >
            <Calendar className="w-3 h-3 inline mr-1" />Mensal
          </button>
          <button
            disabled={!isRegistered}
            onClick={() => updateCustoVariavel(custo.id, { frequencia: 'anual' })}
            className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-r-lg border-t border-b border-r transition-colors ${
              isAnual
                ? 'bg-sage/10 text-sage-dark border-sage/30'
                : 'bg-muted/30 text-muted-foreground border-border'
            }`}
          >
            <CalendarDays className="w-3 h-3 inline mr-1" />Anual
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Custos"
        description="Custos operacionais obrigatórios e depreciação. Reservas estratégicas ficam em aba separada."
        icon={DollarSign}
        action={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5" disabled={!isRegistered}>
                <RotateCcw className="w-4 h-4" /> Zerar tudo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading">Zerar todos os custos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso vai zerar os valores de todos os custos fixos, depreciação e variáveis. Os itens não serão excluídos, apenas os valores voltarão para R$ 0,00.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleZerarTudo} className="rounded-xl bg-destructive hover:bg-destructive/90">
                  Zerar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sage/5 border border-sage/20 rounded-2xl p-4 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-sage-dark flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground/80 space-y-2">
          <p className="font-medium text-sage-dark">Princípio: Se é pago obrigatoriamente → é CUSTO. Se é guardado por decisão → é RESERVA.</p>
          <p>
            <strong>Custos Operacionais:</strong> pagos independentemente de lucro (aluguel, salários, impostos).{' '}
            <strong>Depreciação:</strong> consumo financeiro de ativos ao longo do tempo.{' '}
            <strong>Variáveis:</strong> mudam conforme o volume de atendimentos.
          </p>
          <p className="text-xs text-muted-foreground">
            Custos anuais são divididos por 12 automaticamente. Passe o mouse sobre <HelpCircle className="w-3 h-3 inline" /> para ver exemplos.
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Operacionais"
          value={formatarMoeda(totalOperacionais)}
          subtitle={`${custosOperacionais.filter(c => c.valor > 0).length} itens ativos`}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Depreciação"
          value={formatarMoeda(totalDepreciacao)}
          subtitle={`${custosDepreciacao.filter(c => c.valor > 0 && !c.temParcelaAtiva).length} itens ativos`}
          icon={TrendingDown}
          variant="default"
        />
        <StatCard
          title="Variáveis"
          value={formatarMoeda(totalVariaveis)}
          subtitle={`${data.custosVariaveis.filter(c => c.valor > 0).length} itens ativos`}
          icon={DollarSign}
          variant="warning"
        />
        <div className="relative">
          <StatCard
            title="Custo Total Mensal"
            value={formatarMoeda(totalMensal)}
            subtitle="Oper. + Depr. + Var."
            icon={DollarSign}
            variant="danger"
          />
          <div className="absolute top-3 right-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px] text-xs">
                Soma de todos os custos operacionais, depreciação e variáveis necessários para manter sua clínica funcionando
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Depreciação warning */}
      {custosDepreciacao.some(c => c.temParcelaAtiva && c.valor > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-destructive/5 border border-destructive/20 rounded-2xl p-3 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Equipamento com parcela ativa não pode ter depreciação</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              Itens com parcela ativa têm a depreciação automaticamente bloqueada. Desative a parcela quando o financiamento terminar.
            </p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="operacionais" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="operacionais" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm">
            Operacionais ({custosOperacionais.length})
          </TabsTrigger>
          <TabsTrigger value="depreciacao" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm">
            Depreciação ({custosDepreciacao.length})
          </TabsTrigger>
          <TabsTrigger value="variaveis" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm">
            Variáveis ({data.custosVariaveis.length})
          </TabsTrigger>
        </TabsList>

        {/* Custos Operacionais */}
        <TabsContent value="operacionais" className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Custos pagos obrigatoriamente, independente de lucro
            </p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5"
              onClick={() => openAddDialog('operacional')}
              disabled={!isRegistered}
            >
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Item</span>
                <span>Período / Valor / Ação</span>
              </div>
            </div>
            <AnimatePresence>
              {custosOperacionais.map((custo, index) =>
                renderCustoRow(custo, 'operacional', index, custosOperacionais.length)
              )}
            </AnimatePresence>
            <div className="px-4 py-3 bg-primary/5 border-t border-border flex items-center justify-between">
              <span className="text-sm font-heading font-bold text-foreground">TOTAL OPERACIONAIS (MENSAL)</span>
              <span className="font-mono font-bold text-primary text-sm">
                {formatarMoeda(totalOperacionais)}
              </span>
            </div>
          </div>
        </TabsContent>

        {/* Depreciação / Amortização */}
        <TabsContent value="depreciacao" className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Consumo financeiro técnico de ativos ao longo do tempo
            </p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5"
              onClick={() => openAddDialog('depreciacao')}
              disabled={!isRegistered}
            >
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-3 flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/80">
              <p className="font-medium text-amber-700 dark:text-amber-400 mb-0.5">Regra de depreciação</p>
              <p className="text-xs">
                Se o equipamento ainda está sendo financiado (parcela ativa), a depreciação é <strong>bloqueada automaticamente</strong>.
                A parcela do financiamento já entra como custo operacional. Quando terminar de pagar, desative a parcela para liberar a depreciação.
              </p>
            </div>
          </motion.div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Item</span>
                <span>Período / Valor / Ação</span>
              </div>
            </div>
            <AnimatePresence>
              {custosDepreciacao.map((custo, index) =>
                renderCustoRow(custo, 'depreciacao', index, custosDepreciacao.length)
              )}
            </AnimatePresence>
            <div className="px-4 py-3 bg-muted/10 border-t border-border flex items-center justify-between">
              <span className="text-sm font-heading font-bold text-foreground">TOTAL DEPRECIAÇÃO (MENSAL)</span>
              <span className="font-mono font-bold text-foreground text-sm">
                {formatarMoeda(totalDepreciacao)}
              </span>
            </div>
          </div>
        </TabsContent>

        {/* Custos Variáveis */}
        <TabsContent value="variaveis" className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Custos que variam conforme o volume de atendimentos
            </p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5"
              onClick={() => openAddDialog('variavel')}
              disabled={!isRegistered}
            >
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Item</span>
                <span>Período / Valor / Ação</span>
              </div>
            </div>
            <AnimatePresence>
              {data.custosVariaveis.map((custo, index) =>
                renderCustoVariavelRow(custo, index, data.custosVariaveis.length)
              )}
            </AnimatePresence>
            <div className="px-4 py-3 bg-golden/5 border-t border-border flex items-center justify-between">
              <span className="text-sm font-heading font-bold text-foreground">TOTAL VARIÁVEIS (MENSAL)</span>
              <span className="font-mono font-bold text-golden text-sm">
                {formatarMoeda(totalVariaveis)}
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Adicionar {dialogType === 'operacional' ? 'Custo Operacional' : dialogType === 'depreciacao' ? 'Depreciação' : 'Custo Variável'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nome do custo</label>
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Aluguel, Material, etc."
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Frequência</label>
              <Select value={novoFreq} onValueChange={(v) => setNovoFreq(v as FrequenciaCusto)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual (será dividido por 12)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Observação (opcional)</label>
              <Input
                value={novoObs}
                onChange={(e) => setNovoObs(e.target.value)}
                placeholder="Detalhes adicionais"
                className="rounded-xl"
              />
            </div>
            <Button onClick={handleAddCusto} className="w-full rounded-xl" disabled={!novoNome.trim()}>
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Question Dialog */}
      <Dialog open={smartQuestionOpen} onOpenChange={(open) => { if (!open) resetDialog(); setSmartQuestionOpen(open); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Classificação inteligente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-foreground/80">
              O item <strong>"{pendingCusto?.nome}"</strong> pode ser um custo operacional ou uma reserva estratégica.
            </p>
            <p className="text-sm font-medium text-foreground">
              Este valor é obrigatório para o funcionamento da clínica?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="rounded-xl h-auto py-3 flex flex-col items-center gap-1"
                onClick={() => {
                  setSmartQuestionOpen(false);
                  addCustoToList();
                }}
              >
                <span className="font-semibold">Sim, é obrigatório</span>
                <span className="text-[10px] text-muted-foreground">Classificar como custo</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-auto py-3 flex flex-col items-center gap-1 border-sage/30 hover:bg-sage/5"
                onClick={() => {
                  setSmartQuestionOpen(false);
                  toast.info('Adicione este item na aba "Reservas Estratégicas" no menu lateral');
                  resetDialog();
                }}
              >
                <span className="font-semibold text-sage-dark">Não, é estratégico</span>
                <span className="text-[10px] text-muted-foreground">Classificar como reserva</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
