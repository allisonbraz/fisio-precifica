/**
 * Custos Page
 * Design: Warm Professional — Organic Modernism
 * Manage fixed and variable costs
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Plus,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import PageHeader from '@/components/PageHeader';
import CurrencyInput from '@/components/CurrencyInput';
import StatCard from '@/components/StatCard';
import { useData } from '@/contexts/DataContext';
import {
  calcularTotalCustosFixos,
  calcularTotalCustosVariaveis,
  calcularCustoTotalMensal,
  formatarMoeda,
} from '@/lib/store';

export default function Custos() {
  const {
    data,
    updateCustoFixo,
    addCustoFixo,
    removeCustoFixo,
    updateCustoVariavel,
    addCustoVariavel,
    removeCustoVariavel,
  } = useData();

  const [novoNome, setNovoNome] = useState('');
  const [novoObs, setNovoObs] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'fixo' | 'variavel'>('fixo');

  const totalFixos = calcularTotalCustosFixos(data.custosFixos);
  const totalVariaveis = calcularTotalCustosVariaveis(data.custosVariaveis);
  const totalMensal = calcularCustoTotalMensal(data);

  const handleAddCusto = () => {
    if (!novoNome.trim()) return;
    if (dialogType === 'fixo') {
      addCustoFixo({ nome: novoNome, valor: 0, observacao: novoObs });
    } else {
      addCustoVariavel({ nome: novoNome, valor: 0, observacao: novoObs });
    }
    setNovoNome('');
    setNovoObs('');
    setDialogOpen(false);
  };

  const openAddDialog = (type: 'fixo' | 'variavel') => {
    setDialogType(type);
    setNovoNome('');
    setNovoObs('');
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Custos"
        description="Cadastre todos os seus custos fixos e variáveis mensais"
        icon={DollarSign}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Custos Fixos"
          value={formatarMoeda(totalFixos)}
          subtitle={`${data.custosFixos.filter(c => c.valor > 0).length} itens ativos`}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Custos Variáveis"
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
            >
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_160px_40px] sm:grid-cols-[1fr_200px_40px] gap-2 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Item</span>
              <span className="text-right">Valor (R$)</span>
              <span></span>
            </div>
            <AnimatePresence>
              {data.custosFixos.map((custo, index) => (
                <motion.div
                  key={custo.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`grid grid-cols-[1fr_160px_40px] sm:grid-cols-[1fr_200px_40px] gap-2 px-4 py-3 items-center ${
                    index < data.custosFixos.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">{custo.nome}</span>
                    {custo.observacao && (
                      <span className="text-xs text-muted-foreground truncate block">{custo.observacao}</span>
                    )}
                  </div>
                  <CurrencyInput
                    value={custo.valor}
                    onChange={(v) => updateCustoFixo(custo.id, { valor: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                    onClick={() => removeCustoFixo(custo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="grid grid-cols-[1fr_160px_40px] sm:grid-cols-[1fr_200px_40px] gap-2 px-4 py-3 bg-primary/5 border-t border-border">
              <span className="text-sm font-heading font-bold text-foreground">TOTAL CUSTOS FIXOS</span>
              <span className="text-right font-mono font-bold text-primary text-sm">
                {formatarMoeda(totalFixos)}
              </span>
              <span></span>
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
            >
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_160px_40px] sm:grid-cols-[1fr_200px_40px] gap-2 px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Item</span>
              <span className="text-right">Valor (R$)</span>
              <span></span>
            </div>
            <AnimatePresence>
              {data.custosVariaveis.map((custo, index) => (
                <motion.div
                  key={custo.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`grid grid-cols-[1fr_160px_40px] sm:grid-cols-[1fr_200px_40px] gap-2 px-4 py-3 items-center ${
                    index < data.custosVariaveis.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">{custo.nome}</span>
                    {custo.observacao && (
                      <span className="text-xs text-muted-foreground truncate block">{custo.observacao}</span>
                    )}
                  </div>
                  <CurrencyInput
                    value={custo.valor}
                    onChange={(v) => updateCustoVariavel(custo.id, { valor: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                    onClick={() => removeCustoVariavel(custo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="grid grid-cols-[1fr_160px_40px] sm:grid-cols-[1fr_200px_40px] gap-2 px-4 py-3 bg-golden/5 border-t border-border">
              <span className="text-sm font-heading font-bold text-foreground">TOTAL CUSTOS VARIÁVEIS</span>
              <span className="text-right font-mono font-bold text-golden text-sm">
                {formatarMoeda(totalVariaveis)}
              </span>
              <span></span>
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
