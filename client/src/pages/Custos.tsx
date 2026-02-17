/**
 * Custos Page v2
 * Design: Warm Professional — Organic Modernism
 * Features: mensal/anual toggle, descriptions, zero on trash, zerar tudo
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import CurrencyInput from '@/components/CurrencyInput';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
  calcularCustoTotalMensal,
  formatarMoeda,
  getValorMensal,
  FrequenciaCusto,
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
  const [dialogType, setDialogType] = useState<'fixo' | 'variavel'>('fixo');

  const totalFixos = calcularTotalCustosFixos(data.custosFixos);
  const totalVariaveis = calcularTotalCustosVariaveis(data.custosVariaveis);
  const totalMensal = calcularCustoTotalMensal(data);

  const handleAddCusto = () => {
    if (!novoNome.trim()) return;
    if (dialogType === 'fixo') {
      addCustoFixo({ nome: novoNome, valor: 0, frequencia: novoFreq, observacao: novoObs, descricao: '' });
    } else {
      addCustoVariavel({ nome: novoNome, valor: 0, frequencia: novoFreq, observacao: novoObs, descricao: '' });
    }
    setNovoNome('');
    setNovoObs('');
    setNovoFreq('mensal');
    setDialogOpen(false);
    toast.success('Custo adicionado com sucesso!');
  };

  const openAddDialog = (type: 'fixo' | 'variavel') => {
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
    custo: { id: string; nome: string; valor: number; frequencia: FrequenciaCusto; observacao: string; descricao: string },
    type: 'fixo' | 'variavel',
    index: number,
    total: number,
  ) => {
    const valorMensal = getValorMensal(custo);
    const isAnual = custo.frequencia === 'anual';

    return (
      <motion.div
        key={custo.id}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`px-4 py-3 ${index < total - 1 ? 'border-b border-border/50' : ''}`}
      >
        <div className="grid grid-cols-[1fr_auto] gap-2 items-start">
          {/* Left: name, description, frequency */}
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

          {/* Right: frequency toggle, value, zero button */}
          <div className="flex items-center gap-2">
            {/* Frequency toggle */}
            <div className="hidden sm:flex">
              <button
                disabled={!isRegistered}
                onClick={() => {
                  if (type === 'fixo') updateCustoFixo(custo.id, { frequencia: 'mensal' });
                  else updateCustoVariavel(custo.id, { frequencia: 'mensal' });
                }}
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
                onClick={() => {
                  if (type === 'fixo') updateCustoFixo(custo.id, { frequencia: 'anual' });
                  else updateCustoVariavel(custo.id, { frequencia: 'anual' });
                }}
                className={`px-2 py-1 text-[10px] font-medium rounded-r-lg border-t border-b border-r transition-colors ${
                  isAnual
                    ? 'bg-sage/10 text-sage-dark border-sage/30'
                    : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                }`}
              >
                Anual
              </button>
            </div>

            {/* Value input */}
            <div className="w-[140px] sm:w-[160px]">
              <CurrencyInput
                value={custo.valor}
                onChange={(v) => {
                  if (!isRegistered) { toast.error('Cadastre-se para editar'); return; }
                  if (type === 'fixo') updateCustoFixo(custo.id, { valor: v });
                  else updateCustoVariavel(custo.id, { valor: v });
                }}
                disabled={!isRegistered}
              />
            </div>

            {/* Zero button (instead of delete) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg flex-shrink-0"
                  disabled={!isRegistered}
                  onClick={() => {
                    if (type === 'fixo') zeroCustoFixo(custo.id);
                    else zeroCustoVariavel(custo.id);
                    toast.info(`${custo.nome} zerado`);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zerar valor</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Mobile frequency toggle */}
        <div className="flex sm:hidden mt-2 gap-1">
          <button
            disabled={!isRegistered}
            onClick={() => {
              if (type === 'fixo') updateCustoFixo(custo.id, { frequencia: 'mensal' });
              else updateCustoVariavel(custo.id, { frequencia: 'mensal' });
            }}
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
            onClick={() => {
              if (type === 'fixo') updateCustoFixo(custo.id, { frequencia: 'anual' });
              else updateCustoVariavel(custo.id, { frequencia: 'anual' });
            }}
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
        description="Cadastre todos os seus custos fixos e variáveis. Marque se o custo é mensal ou anual."
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
                  Isso vai zerar os valores de todos os custos fixos e variáveis. Os itens não serão excluídos, apenas os valores voltarão para R$ 0,00.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleZerarTudo} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
        <div className="text-sm text-foreground/80">
          <p className="font-medium text-sage-dark mb-1">Como funciona?</p>
          <p>
            Preencha o valor de cada custo e marque se ele é <strong>mensal</strong> ou <strong>anual</strong>.
            Custos anuais são automaticamente divididos por 12 para calcular o custo mensal.
            Passe o mouse sobre o ícone <HelpCircle className="w-3 h-3 inline" /> para ver uma descrição com exemplo de cada item.
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Custos Fixos (mensal)"
          value={formatarMoeda(totalFixos)}
          subtitle={`${data.custosFixos.filter(c => c.valor > 0).length} itens ativos`}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Custos Variáveis (mensal)"
          value={formatarMoeda(totalVariaveis)}
          subtitle={`${data.custosVariaveis.filter(c => c.valor > 0).length} itens ativos`}
          icon={DollarSign}
          variant="warning"
        />
        <StatCard
          title="Custo Total Mensal"
          value={formatarMoeda(totalMensal)}
          subtitle="Fixos + Variáveis"
          icon={DollarSign}
          variant="danger"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fixos" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="fixos" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Custos Fixos ({data.custosFixos.length})
          </TabsTrigger>
          <TabsTrigger value="variaveis" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Custos Variáveis ({data.custosVariaveis.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixos" className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Custos que não mudam independente do número de atendimentos
            </p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl gap-1.5"
              onClick={() => openAddDialog('fixo')}
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
              {data.custosFixos.map((custo, index) =>
                renderCustoRow(custo, 'fixo', index, data.custosFixos.length)
              )}
            </AnimatePresence>
            <div className="px-4 py-3 bg-primary/5 border-t border-border flex items-center justify-between">
              <span className="text-sm font-heading font-bold text-foreground">TOTAL CUSTOS FIXOS (MENSAL)</span>
              <span className="font-mono font-bold text-primary text-sm">
                {formatarMoeda(totalFixos)}
              </span>
            </div>
          </div>
        </TabsContent>

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
                renderCustoRow(custo, 'variavel', index, data.custosVariaveis.length)
              )}
            </AnimatePresence>
            <div className="px-4 py-3 bg-golden/5 border-t border-border flex items-center justify-between">
              <span className="text-sm font-heading font-bold text-foreground">TOTAL CUSTOS VARIÁVEIS (MENSAL)</span>
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
              Adicionar Custo {dialogType === 'fixo' ? 'Fixo' : 'Variável'}
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
    </div>
  );
}
