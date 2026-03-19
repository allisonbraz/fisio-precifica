/**
 * ProgressGate — Progressive unlock banner
 * Shows a contextual nudge when the user hasn't completed
 * the essential steps (Custos + Precificação) yet.
 * Does NOT block the page — just guides the user.
 */

import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

interface ProgressGateProps {
  /** What the user needs to do first, shown in the message */
  requiredLabel?: string;
}

export default function ProgressGate({ requiredLabel }: ProgressGateProps) {
  const { data } = useData();

  const hasCustos = data.custosFixos.some(c => c.valor > 0) || data.custosVariaveis.some(c => c.valor > 0);
  const hasPreco = data.precoDefinido > 0;

  // If user has both, no gate needed
  if (hasCustos && hasPreco) return null;

  const missingStep = !hasCustos ? 'custos' : 'precificação';
  const missingHref = !hasCustos ? '/custos' : '/precificacao';
  const missingLabel = !hasCustos ? 'Cadastrar Custos' : 'Definir Precificação';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-golden-light/20 border border-golden/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
    >
      <Lightbulb className="w-5 h-5 text-golden flex-shrink-0 mt-0.5 sm:mt-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {requiredLabel
            ? `Para usar ${requiredLabel}, primeiro preencha seus ${missingStep}.`
            : `Esta ferramenta funciona melhor após preencher seus ${missingStep}.`}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Você pode explorar esta página, mas os cálculos precisam dos dados base.
        </p>
      </div>
      <Link href={missingHref}>
        <Button size="sm" variant="outline" className="rounded-xl gap-1.5 border-golden/40 hover:bg-golden-light/30 flex-shrink-0">
          {missingLabel} <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </motion.div>
  );
}
