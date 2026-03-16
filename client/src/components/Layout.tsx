/**
 * Layout Component
 * Design: Warm Professional — Organic Modernism
 * Sidebar navigation with organic shapes and warm tones
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  Menu,
  Home,
  Target,
  Briefcase,
  UserCircle,
  ClipboardList,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/perfil', label: 'Meu Perfil', icon: UserCircle },
  { path: '/custos', label: 'Custos', icon: DollarSign },
  { path: '/precificacao', label: 'Precificação', icon: Calculator },
  { path: '/servicos', label: 'Serviços', icon: Briefcase },
  { path: '/simulacao', label: 'Simulação', icon: TrendingUp },
  { path: '/indicadores', label: 'Indicadores', icon: Target },
  { path: '/reservas', label: 'Reservas', icon: ShieldCheck },
  { path: '/relatorios', label: 'Relatórios', icon: FileText },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
];

const adminNavItems = [
  { path: '/admin/leads', label: 'Contatos', icon: Users },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRegistered } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Fechar menu"
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] bg-card border-r border-border flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <Link href="/" onClick={() => setSidebarOpen(false)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-terracotta to-sage flex items-center justify-center shadow-md">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold text-foreground leading-tight">FisioPrecifica</span>
                <p className="text-xs text-muted-foreground">Precificação inteligente</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="mt-4 mb-2 px-3">
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Admin</p>
              </div>
              {adminNavItems.map((item) => {
                const isActive = location === item.path || location.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            <p className="font-medium">FisioPrecifica v2.0</p>
            <p className="mt-0.5 opacity-70">Seus dados ficam salvos localmente</p>
            <p className="mt-2 text-[10px] opacity-50">Feito por Allison Braz — FisioMind</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 lg:hidden bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-terracotta to-sage flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-sm">FisioPrecifica</span>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        {/* Page Content - add bottom padding when lead gate banner is visible */}
        <div className={`p-4 sm:p-6 lg:p-8 ${!isRegistered ? 'pb-24' : ''}`}>
          {children}
        </div>

        {/* Main Content Footer */}
        <footer className="border-t border-border/50 px-4 sm:px-6 lg:px-8 py-4 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60">
            <p>Feito por <span className="font-medium text-muted-foreground/80">Allison Braz</span> — <span className="font-medium text-primary/70">FisioMind</span></p>
            <p>FisioPrecifica © {new Date().getFullYear()}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
