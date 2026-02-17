/**
 * Serviços Page
 * Design: Warm Professional — Organic Modernism
 * Manage service types and packages with pricing
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Tag,
  Gift,
  Info,
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
import CurrencyInput from '@/components/CurrencyInput';
import { useData } from '@/contexts/DataContext';
import {
  calcularPrecoMinimo,
  calcularPrecoServico,
  calcularPrecoPacote,
  formatarMoeda,
  TipoServico,
  Pacote,
} from '@/lib/store';

export default function Servicos() {
  const {
    data,
    addTipoServico,
    updateTipoServico,
    removeTipoServico,
    addPacote,
    updatePacote,
    removePacote,
  } = useData();

  const [servicoDialog, setServicoDialog] = useState(false);
  const [pacoteDialog, setPacoteDialog] = useState(false);
  const [editingServico, setEditingServico] = useState<TipoServico | null>(null);
  const [editingPacote, setEditingPacote] = useState<Pacote | null>(null);

  // Service form state
  const [sNome, setSNome] = useState('');
  const [sDuracao, setSDuracao] = useState(50);
  const [sCustoAdicional, setSCustoAdicional] = useState(0);
  const [sMultiplicador, setSMultiplicador] = useState(1);
  const [sDescricao, setSDescricao] = useState('');

  // Package form state
  const [pNome, setPNome] = useState('');
  const [pServicoId, setPServicoId] = useState('');
  const [pQtd, setPQtd] = useState(10);
  const [pDesconto, setPDesconto] = useState(10);
  const [pValidade, setPValidade] = useState(90);

  const precoBase = calcularPrecoMinimo(data);

  const openServicoDialog = (servico?: TipoServico) => {
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
  };

  const openPacoteDialog = (pacote?: Pacote) => {
    if (pacote) {
      setEditingPacote(pacote);
      setPNome(pacote.nome);
      setPServicoId(pacote.tipoServicoId);
      setPQtd(pacote.quantidadeSessoes);
      setPDesconto(pacote.descontoPercentual);
      setPValidade(pacote.validade);
    } else {
      setEditingPacote(null);
      setPNome('');
      setPServicoId(data.tiposServico[0]?.id || '');
      setPQtd(10);
      setPDesconto(10);
      setPValidade(90);
    }
    setPacoteDialog(true);
  };

  const savePacote = () => {
    if (!pNome.trim() || !pServicoId) return;
    const pacoteData = {
      nome: pNome,
      tipoServicoId: pServicoId,
      quantidadeSessoes: pQtd,
      descontoPercentual: pDesconto,
      validade: pValidade,
    };
    if (editingPacote) {
      updatePacote(editingPacote.id, pacoteData);
    } else {
      addPacote(pacoteData);
    }
    setPacoteDialog(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Serviços e Pacotes"
        description="Configure diferentes tipos de serviço e pacotes com desconto"
        icon={Package}
      />

      <Tabs defaultValue="servicos" className="space-y-4">
        <TabsList className="bg-muted/50 rounded-xl p-1">
          <TabsTrigger value="servicos" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Tipos de Serviço ({data.tiposServico.length})
          </TabsTrigger>
          <TabsTrigger value="pacotes" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Pacotes ({data.pacotes.length})
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="servicos" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Preço base: <span className="font-mono font-medium text-foreground">{formatarMoeda(precoBase)}</span> (sessão padrão)
            </p>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => openServicoDialog()}>
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
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openServicoDialog(servico)}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive" onClick={() => removeTipoServico(servico.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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

        {/* Packages Tab */}
        <TabsContent value="pacotes" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Crie pacotes com desconto para fidelizar pacientes
            </p>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => openPacoteDialog()}>
              <Plus className="w-4 h-4" /> Novo Pacote
            </Button>
          </div>

          {data.pacotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-dashed border-border p-10 text-center"
            >
              <Gift className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h4 className="font-heading font-semibold text-foreground">Nenhum pacote criado</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Pacotes com desconto são ótimos para fidelizar pacientes e garantir receita recorrente.
              </p>
              <Button variant="outline" className="mt-4 rounded-xl gap-1.5" onClick={() => openPacoteDialog()}>
                <Plus className="w-4 h-4" /> Criar primeiro pacote
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {data.pacotes.map((pacote) => {
                  const servico = data.tiposServico.find(s => s.id === pacote.tipoServicoId);
                  const precoUnitario = servico ? calcularPrecoServico(data, servico) : precoBase;
                  const precoPacote = calcularPrecoPacote(precoUnitario, pacote);
                  const precoSemDesconto = precoUnitario * pacote.quantidadeSessoes;
                  const economia = precoSemDesconto - precoPacote;

                  return (
                    <motion.div
                      key={pacote.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -4 }}
                      className="bg-card rounded-2xl border border-border p-5 space-y-3 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-sage text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                        -{pacote.descontoPercentual}%
                      </div>

                      <div className="flex items-start justify-between pr-12">
                        <div>
                          <h4 className="font-heading font-semibold text-foreground">{pacote.nome}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {servico?.nome || 'Serviço não encontrado'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{pacote.quantidadeSessoes} sessões</span>
                        <span>Validade: {pacote.validade} dias</span>
                      </div>

                      <div className="pt-2 border-t border-border/50 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Sem desconto:</span>
                          <span className="line-through text-muted-foreground font-mono">{formatarMoeda(precoSemDesconto)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Com desconto:</span>
                          <span className="text-xl font-mono font-bold text-primary">{formatarMoeda(precoPacote)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-sage-dark font-medium">Economia do paciente:</span>
                          <span className="text-sage-dark font-mono font-medium">{formatarMoeda(economia)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Preço unitário:</span>
                          <span className="font-mono">{formatarMoeda(precoPacote / pacote.quantidadeSessoes)}</span>
                        </div>
                      </div>

                      <div className="flex gap-1 pt-1">
                        <Button variant="ghost" size="sm" className="flex-1 rounded-lg text-xs" onClick={() => openPacoteDialog(pacote)}>
                          <Edit3 className="w-3 h-3 mr-1" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-lg text-xs text-muted-foreground hover:text-destructive" onClick={() => removePacote(pacote.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
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

      {/* Package Dialog */}
      <Dialog open={pacoteDialog} onOpenChange={setPacoteDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingPacote ? 'Editar Pacote' : 'Novo Pacote'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome do pacote</label>
              <Input value={pNome} onChange={(e) => setPNome(e.target.value)} placeholder="Ex: Pacote 10 sessões" className="rounded-xl" />
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
            <Button onClick={savePacote} className="w-full rounded-xl" disabled={!pNome.trim() || !pServicoId}>
              {editingPacote ? 'Salvar alterações' : 'Criar pacote'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
