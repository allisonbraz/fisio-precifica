/**
 * Configurações Page
 * Design: Warm Professional — Organic Modernism
 * App settings, data import/export, and reset
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import PageHeader from '@/components/PageHeader';
import { useData } from '@/contexts/DataContext';
import { exportarDados, importarDados } from '@/lib/store';
import { toast } from 'sonner';

export default function Configuracoes() {
  const { data, resetAllData, importData, updateHorasTrabalho } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportarDados(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fisioprecifica_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const imported = importarDados(json);
      if (imported) {
        importData(imported);
        toast.success('Dados importados com sucesso!');
      } else {
        toast.error('Arquivo inválido. Verifique o formato.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    resetAllData();
    toast.success('Dados restaurados para os valores padrão.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie seus dados e preferências"
        icon={Settings}
      />

      {/* Work Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground">Jornada de Trabalho</h3>
            <p className="text-sm text-muted-foreground">Configure suas horas de trabalho diárias</p>
          </div>
        </div>
        <div className="max-w-xs">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Horas por dia</label>
          <Input
            type="number"
            value={data.horasTrabalho}
            onChange={(e) => updateHorasTrabalho(Math.max(1, parseInt(e.target.value) || 0))}
            className="rounded-xl font-mono"
            min={1}
            max={16}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Total mensal: {data.horasTrabalho * data.diasUteis} horas ({data.diasUteis} dias úteis)
          </p>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6 space-y-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-sage-light/50 flex items-center justify-center">
            <Download className="w-5 h-5 text-sage-dark" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-foreground">Gerenciamento de Dados</h3>
            <p className="text-sm text-muted-foreground">Exporte, importe ou restaure seus dados</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-medium">Seus dados ficam salvos localmente</p>
            <p className="text-muted-foreground mt-1">
              Todos os dados são armazenados no seu navegador (localStorage). Recomendamos fazer backup regularmente exportando seus dados.
            </p>
          </div>
        </div>

        {/* Export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-muted/30">
          <div>
            <h4 className="text-sm font-medium text-foreground">Exportar dados</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Baixe um arquivo JSON com todos os seus dados</p>
          </div>
          <Button variant="outline" className="rounded-xl gap-1.5" onClick={handleExport}>
            <Download className="w-4 h-4" /> Exportar JSON
          </Button>
        </div>

        {/* Import */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-muted/30">
          <div>
            <h4 className="text-sm font-medium text-foreground">Importar dados</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Restaure dados a partir de um arquivo de backup</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="outline" className="rounded-xl gap-1.5" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" /> Importar JSON
            </Button>
          </div>
        </div>

        {/* Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
          <div>
            <h4 className="text-sm font-medium text-foreground">Restaurar padrões</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Apaga todos os dados e restaura os valores iniciais</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10">
                <RotateCcw className="w-4 h-4" /> Restaurar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Restaurar dados padrão?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá apagar todos os seus dados atuais (custos, serviços, planos de tratamento e registros mensais) e restaurar os valores iniciais. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="rounded-xl bg-destructive hover:bg-destructive/90">
                  Sim, restaurar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold text-foreground mb-3">Sobre o FisioPrecifica</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            O FisioPrecifica é uma ferramenta de precificação desenvolvida especialmente para fisioterapeutas. Ele ajuda você a calcular o preço ideal dos seus serviços com base nos seus custos reais.
          </p>
          <p>
            <strong className="text-foreground">Funcionalidades principais:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Gestão completa de custos fixos e variáveis</li>
            <li>Cálculo automático do preço mínimo por sessão</li>
            <li>Diferentes tipos de serviço com preços calculados</li>
            <li>Planos de tratamento com desconto para fidelização</li>
            <li>Simulação de cenários (otimista, realista, pessimista)</li>
            <li>Indicadores financeiros e score de saúde</li>
            <li>Relatórios mensais com gráficos de evolução</li>
            <li>Exportação e importação de dados</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
