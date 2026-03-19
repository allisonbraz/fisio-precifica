/**
 * Serviços Page v2
 * Design: Warm Professional — Organic Modernism
 * Manage service types and treatment plans (planos de tratamento) with pricing
 * Replaced "pacotes" with "planos de tratamento"
 */

import { useState } from 'react';
import ProgressGate from '@/components/ProgressGate';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Tag,
  ClipboardList,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import ConfirmAction from '@/components/ConfirmAction';
import CurrencyInput from '@/components/CurrencyInput';
import { useData } from '@/contexts/DataContext';
import {
  calcularPrecoMinimo,
  calcularPrecoServico,
  calcularPrecoPlano,
  formatarMoeda,
  TipoServico,
  PlanoTratamento,
} from '@/lib/store';
import { toast } from 'sonner';

export default function Servicos() {
  const {
    data,
    isRegistered,
    addTipoServico,
    updateTipoServico,
    removeTipoServico,
    addPlanoTratamento,
    updatePlanoTratamento,
    removePlanoTratamento,
  } = useData();

  const [servicoDialog, setServicoDialog] = useState(false);
  const [planoDialog, setPlanoDialog] = useState(false);
  const [editingServico, setEditingServico] = useState<TipoServico | null>(null);
  const [editingPlano, setEditingPlano] = useState<PlanoTratamento | null>(null);

  // Service form state
  const [sNome, setSNome] = useState('');
  const [sDuracao, setSDuracao] = useState(50);
  const [sCustoAdicional, setSCustoAdicional] = useState(0);
  const [sMultiplicador, setSMultiplicador] = useState(1);
  const [sDescricao, setSDescricao] = useState('');

  // Treatment plan form state
  const [pNome, setPNome] = useState('');
  const [pServicoId, setPServicoId] = useState('');
  const [pQtd, setPQtd] = useState(10);
  const [pDesconto, setPDesconto] = useState(10);
  const [pValidade, setPValidade] = useState(90);

  const precoBase = calcularPrecoMinimo(data);

  const guardEdit = (fn: () => void) => {
    if (!isRegistered) {
      toast.error('Faça login para editar');
      return;
    }
    fn();
  };

  const openServicoDialog = (servico?: TipoServico) => {
    guardEdit(() => {
      if (servico) {
        setEditingServico(servico);
        setSNome(servico.nome);
        setSDuracao(servico.duracaoMinutos);
        setSCustoAdicional(servico.custoAdicional);
        setSMultiplicador(servico.multiplicadorPreco);
        setSDescricao(servico.descricao);
      } else {
        setEditingServico(null);
        setSNome('');
        setSDuracao(50);
        setSCustoAdicional(0);
        setSMultiplicador(1);
        setSDescricao('');
      }
      setServicoDialog(true);
    });
  };

  const saveServico = () => {
    if (!sNome.trim()) return;
    const servicoData = {
      nome: sNome,
      duracaoMinutos: sDuracao,
      custoAdicional: sCustoAdicional,
      multiplicadorPreco: sMultiplicador,
      descricao: sDescricao,
    };
    if (editingServico) {
      updateTipoServico(editingServico.id, servicoData);
    } else {
      addTipoServico(servicoData);
    }
    setServicoDialog(false);
    toast.success(editingServico ? 'Serviço atualizado!' : 'Serviço criado!');
  };

  const openPlanoDialog = (plano?: PlanoTratamento) => {
    guardEdit(() => {
      if (plano) {
        setEditingPlano(plano);
        setPNome(plano.nome);
        setPServicoId(plano.tipoServicoId);
        setPQtd(plano.quantidadeSessoes);
        setPDesconto(plano.descontoPercentual);
        setPValidade(plano.validade);
      } else {
        setEditingPlano(null);
        setPNome('');
        setPServicoId(data.tiposServico[0]?.id || '');
        setPQtd(10);
        setPDesconto(10);
        setPValidade(90);
      }
      setPlanoDialog(true);
    });
  };

  const savePlano = () => {
    if (!pNome.trim() || !pServicoId) return;
    const planoData = {
      nome: pNome,
      tipoServicoId: pServicoId,
      quantidadeSessoes: pQtd,
      descontoPercentual: pDesconto,
      validade: pValidade,
    };
    if (editingPlano) {
      updatePlanoTratamento(editingPlano.id, planoData);
    } else {
      addPlanoTratamento(planoData);
    }
    setPlanoDialog(false);
    toast.success(editingPlano ? 'Plano atualizado!' : 'Plano criado!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Serviços e Planos de Tratamento"
        description="Configure tipos de serviço e planos de tratamento com desconto para fidelizar pacientes"
        icon={Briefcase}
      />

      <ProgressGate requiredLabel="Serviços" />

      <Tabs defaultValue="servicos" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="servicos" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Tipos de Serviço ({data.tiposServico.length})
          </TabsTrigger>
          <TabsTrigger value="planos" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Planos de Tratamento ({data.planosTratamento.length})
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="servicos" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Preço base: <span className="font-mono font-medium text-foreground">{formatarMoeda(precoBase)}</span> (sessão padrão)
            </p>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => openServicoDialog()} disabled={!isRegistered}>
              <Plus className="w-4 h-4" /> Novo Serviço
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {data.tiposServico.map((servico) => {
                const preco = calcularPrecoServico(data, servico);
                return (
                  <motion.div
                    key={servico.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    className="bg-card rounded-2xl border border-border p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-heading font-semibold text-foreground">{servico.nome}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{servico.descricao}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => openServicoDialog(servico)}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <ConfirmAction
                          title={`Excluir "${servico.nome}"?`}
                          description="Este serviço será removido permanentemente. Planos de tratamento vinculados perderão a referência."
                          confirmLabel="Excluir serviço"
                          onConfirm={() => guardEdit(() => removeTipoServico(servico.id))}
                        >
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </ConfirmAction>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {servico.duracaoMinutos} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" /> ×{servico.multiplicadorPreco.toFixed(1)}
                      </span>
                      {servico.custoAdicional > 0 && (
                        <span className="flex items-center gap-1">
                          +{formatarMoeda(servico.custoAdicional)}
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">Preço sugerido</p>
                      <p className="text-2xl font-mono font-bold text-primary">{formatarMoeda(preco)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Treatment Plans Tab */}
        <TabsContent value="planos" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Crie planos de tratamento com desconto para fidelizar pacientes
            </p>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => openPlanoDialog()} disabled={!isRegistered}>
              <Plus className="w-4 h-4" /> Novo Plano
            </Button>
          </div>

          {data.planosTratamento.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-dashed border-border p-10 text-center"
            >
              <ClipboardList className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h4 className="font-heading font-semibold text-foreground">Nenhum plano de tratamento criado</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Planos de tratamento com desconto são ótimos para fidelizar pacientes e garantir receita recorrente.
              </p>
              <Button variant="outline" className="mt-4 rounded-xl gap-1.5" onClick={() => openPlanoDialog()} disabled={!isRegistered}>
                <Plus className="w-4 h-4" /> Criar primeiro plano
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {data.planosTratamento.map((plano) => {
                  const servico = data.tiposServico.find(s => s.id === plano.tipoServicoId);
                  const precoUnitario = servico ? calcularPrecoServico(data, servico) : precoBase;
                  const precoPlano = calcularPrecoPlano(precoUnitario, plano);
                  const precoSemDesconto = precoUnitario * plano.quantidadeSessoes;
                  const economia = precoSemDesconto - precoPlano;

                  return (
                    <motion.div
                      key={plano.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4 }}
                      className="bg-card rounded-2xl border border-border p-5 space-y-3 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-sage text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                        -{plano.descontoPercentual}%
                      </div>

                      <div className="flex items-start justify-between pr-12">
                        <div>
                          <h4 className="font-heading font-semibold text-foreground">{plano.nome}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {servico?.nome || 'Serviço não encontrado'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{plano.quantidadeSessoes} sessões</span>
                        <span>Validade: {plano.validade} dias</span>
                      </div>

                      <div className="pt-2 border-t border-border/50 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Sem desconto:</span>
                          <span className="line-through text-muted-foreground font-mono">{formatarMoeda(precoSemDesconto)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Com desconto:</span>
                          <span className="text-xl font-mono font-bold text-primary">{formatarMoeda(precoPlano)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-sage-dark font-medium">Economia do paciente:</span>
                          <span className="text-sage-dark font-mono font-medium">{formatarMoeda(economia)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Preço unitário:</span>
                          <span className="font-mono">{formatarMoeda(precoPlano / plano.quantidadeSessoes)}</span>
                        </div>
                      </div>

                      <div className="flex gap-1 pt-1">
                        <Button variant="ghost" size="sm" className="flex-1 rounded-lg text-xs" onClick={() => openPlanoDialog(plano)}>
                          <Edit3 className="w-3 h-3 mr-1" /> Editar
                        </Button>
                        <ConfirmAction
                          title={`Excluir "${plano.nome}"?`}
                          description="Este plano de tratamento será removido permanentemente."
                          confirmLabel="Excluir plano"
                          onConfirm={() => guardEdit(() => removePlanoTratamento(plano.id))}
                        >
                          <Button variant="ghost" size="sm" className="rounded-lg text-xs text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </ConfirmAction>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Service Dialog */}
      <Dialog open={servicoDialog} onOpenChange={setServicoDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingServico ? 'Editar Serviço' : 'Novo Tipo de Serviço'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome do serviço</label>
              <Input value={sNome} onChange={(e) => setSNome(e.target.value)} placeholder="Ex: Pilates Individual" className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Descrição</label>
              <Input value={sDescricao} onChange={(e) => setSDescricao(e.target.value)} placeholder="Breve descrição" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duração (min)</label>
                <Input type="number" value={sDuracao} onChange={(e) => setSDuracao(parseInt(e.target.value) || 0)} className="rounded-xl font-mono" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Multiplicador de preço</label>
                <Input type="number" step="0.1" value={sMultiplicador} onChange={(e) => setSMultiplicador(parseFloat(e.target.value) || 0)} className="rounded-xl font-mono" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Custo adicional (R$)</label>
              <CurrencyInput value={sCustoAdicional} onChange={setSCustoAdicional} />
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-sm">
              <p className="text-muted-foreground">Preço calculado: <span className="font-mono font-bold text-primary">{formatarMoeda(precoBase * sMultiplicador + sCustoAdicional)}</span></p>
            </div>
            <Button onClick={saveServico} className="w-full rounded-xl" disabled={!sNome.trim()}>
              {editingServico ? 'Salvar alterações' : 'Criar serviço'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Treatment Plan Dialog */}
      <Dialog open={planoDialog} onOpenChange={setPlanoDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingPlano ? 'Editar Plano de Tratamento' : 'Novo Plano de Tratamento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome do plano</label>
              <Input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder="Ex: Plano 10 sessões" className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tipo de serviço</label>
              <Select value={pServicoId} onValueChange={setPServicoId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {data.tiposServico.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Sessões</label>
                <Input type="number" value={pQtd} onChange={(e) => setPQtd(parseInt(e.target.value) || 0)} className="rounded-xl font-mono" min={1} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Desconto (%)</label>
                <Input type="number" value={pDesconto} onChange={(e) => setPDesconto(parseFloat(e.target.value) || 0)} className="rounded-xl font-mono" min={0} max={50} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Validade (dias)</label>
                <Input type="number" value={pValidade} onChange={(e) => setPValidade(parseInt(e.target.value) || 0)} className="rounded-xl font-mono" min={1} />
              </div>
            </div>
            <Button onClick={savePlano} className="w-full rounded-xl" disabled={!pNome.trim() || !pServicoId}>
              {editingPlano ? 'Salvar alterações' : 'Criar plano'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
