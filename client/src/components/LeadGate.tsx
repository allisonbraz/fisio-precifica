/**
 * LeadGate Component
 * Design: Warm Professional — Organic Modernism
 * Modal that requires name, whatsapp and email before allowing edits
 * Users can VIEW the app but cannot EDIT until registered
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, User, Phone, Mail, ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';

export default function LeadGate() {
  const { isRegistered, registerLead } = useData();
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isRegistered) return null;

  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nome.trim()) errs.nome = 'Informe seu nome';
    if (whatsapp.replace(/\D/g, '').length < 10) errs.whatsapp = 'WhatsApp inválido';
    if (!email.includes('@') || !email.includes('.')) errs.email = 'E-mail inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    registerLead({
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim().toLowerCase(),
      registeredAt: new Date().toISOString(),
    });
    setShowModal(false);
  };

  return (
    <>
      {/* Floating banner at bottom */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-r from-terracotta to-terracotta-dark text-white shadow-2xl"
      >
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Eye className="w-5 h-5 flex-shrink-0 hidden sm:block" />
            <div>
              <p className="font-heading font-semibold text-sm sm:text-base">
                Você está no modo visualização
              </p>
              <p className="text-xs sm:text-sm opacity-90">
                Cadastre-se gratuitamente para editar, calcular e baixar seu relatório
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-white text-terracotta-dark hover:bg-cream font-semibold rounded-xl px-6 whitespace-nowrap"
          >
            Cadastrar grátis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-terracotta/10 to-sage/10 p-6 pb-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta to-sage flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Calculator className="w-7 h-7 text-white" />
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Acesse o FisioPrecifica
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha seus dados para editar, calcular preços e baixar relatórios
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-nome" className="text-sm font-medium">
                    <User className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                    Nome completo
                  </Label>
                  <Input
                    id="lead-nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="rounded-xl"
                  />
                  {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead-whatsapp" className="text-sm font-medium">
                    <Phone className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                    WhatsApp
                  </Label>
                  <Input
                    id="lead-whatsapp"
                    value={whatsapp}
                    onChange={e => setWhatsapp(formatWhatsapp(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="rounded-xl"
                    maxLength={16}
                  />
                  {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lead-email" className="text-sm font-medium">
                    <Mail className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                    E-mail
                  </Label>
                  <Input
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="rounded-xl"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
                >
                  Acessar calculadora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Seus dados são usados apenas para identificação do relatório.
                  Não enviamos spam.
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
