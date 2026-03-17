/**
 * LeadGate Component
 * Shows a banner at the bottom for unauthenticated users
 * Directs to /login for registration/login
 */

import { motion } from 'framer-motion';
import { Eye, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';

export default function LeadGate() {
  const { user, loading } = useAuth();

  if (loading || user) return null;

  return (
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
              Crie sua conta gratuita para editar, calcular e baixar seu relatório
            </p>
          </div>
        </div>
        <Link href="/login">
          <Button
            className="bg-white text-terracotta-dark hover:bg-cream font-semibold rounded-xl px-6 whitespace-nowrap"
          >
            Entrar / Cadastrar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
