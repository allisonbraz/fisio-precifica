/**
 * Onboarding Wizard
 * Modal overlay with 4 steps shown after first registration
 * Guides new users through the app's main features
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'fisioprecifica_onboarding_complete';

const steps = [
  {
    icon: Calculator,
    title: 'Bem-vindo ao FisioPrecifica!',
    description: 'Vamos te ajudar a calcular o preço ideal dos seus serviços de fisioterapia em poucos passos.',
    cta: 'Começar',
    href: null,
  },
  {
    icon: DollarSign,
    title: 'Cadastre seus custos',
    description: 'Informe seus custos fixos (aluguel, CREFITO, etc.) e variáveis (materiais, descartáveis). Quanto mais preciso, melhor o cálculo.',
    cta: 'Ir para Custos',
    href: '/custos',
  },
  {
    icon: Target,
    title: 'Defina seu preço',
    description: 'Com base nos seus custos, ajuste a margem de lucro ou defina o preço diretamente. Os dois campos se sincronizam automaticamente.',
    cta: 'Ir para Precificação',
    href: '/precificacao',
  },
  {
    icon: CheckCircle2,
    title: 'Pronto! Explore',
    description: 'Agora você pode simular cenários, acompanhar indicadores de saúde financeira e gerar relatórios profissionais.',
    cta: 'Ir para Indicadores',
    href: '/indicadores',
  },
];

interface OnboardingWizardProps {
  isRegistered: boolean;
}

export default function OnboardingWizard({ isRegistered }: OnboardingWizardProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(() => {
    if (!isRegistered) return false;
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  });

  if (!visible) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === steps.length - 1;

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const handleCTA = () => {
    if (step.href) {
      handleClose();
      setLocation(step.href);
    } else if (!isLast) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl border border-border shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-heading font-bold text-foreground">{step.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 space-y-3">
            <Button onClick={handleCTA} className="w-full rounded-xl">
              {step.cta}
            </Button>
            <button
              onClick={step.href ? handleNext : handleClose}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLast ? 'Fechar' : 'Pular'}
            </button>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-primary' : 'bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
