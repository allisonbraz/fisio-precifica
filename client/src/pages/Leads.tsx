/**
 * Unified Contacts Admin Page
 * Design: Warm Professional — Organic Modernism
 * Admin-only page to view all contacts (leads + OAuth users) unified
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Download,
  Search,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Shield,
  UserCheck,
  Globe,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

const PAGE_SIZE = 20;

function SourceBadge({ source, hasOAuth }: { source: string; hasOAuth: boolean }) {
  if (source.includes('+') || (source.includes('banner') && hasOAuth)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/20 text-gold-dark">
        <UserCheck className="w-3 h-3" />
        Banner + Login
      </span>
    );
  }
  if (hasOAuth || source === 'oauth') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage/20 text-sage-dark">
        <LogIn className="w-3 h-3" />
        Login OAuth
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-terracotta/15 text-terracotta">
      <Globe className="w-3 h-3" />
      Banner
    </span>
  );
}

export default function Leads() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'banner' | 'oauth' | 'both'>('all');

  const { data: contactsData, isLoading, refetch } = trpc.contacts.list.useQuery(
    { limit: 500, offset: 0 },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  // Filter and paginate locally
  const filteredContacts = useMemo(() => {
    if (!contactsData?.items) return [];
    let items = contactsData.items;

    // Source filter
    if (sourceFilter === 'banner') {
      items = items.filter(c => !c.hasOAuth);
    } else if (sourceFilter === 'oauth') {
      items = items.filter(c => c.hasOAuth && !c.source.includes('+'));
    } else if (sourceFilter === 'both') {
      items = items.filter(c => c.source.includes('+'));
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        c => c.nome.toLowerCase().includes(q) ||
             c.email.toLowerCase().includes(q) ||
             c.whatsapp.includes(q)
      );
    }

    return items;
  }, [contactsData, search, sourceFilter]);

  const stats = useMemo(() => {
    if (!contactsData?.items) return { total: 0, withOAuth: 0, withWhatsapp: 0, bannerOnly: 0 };
    const items = contactsData.items;
    return {
      total: items.length,
      withOAuth: items.filter(c => c.hasOAuth).length,
      withWhatsapp: items.filter(c => c.whatsapp).length,
      bannerOnly: items.filter(c => !c.hasOAuth).length,
    };
  }, [contactsData]);

  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);
  const paginatedContacts = filteredContacts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportCSV = () => {
    if (!contactsData?.items?.length) {
      toast.error('Nenhum contato para exportar');
      return;
    }
    const headers = ['Nome', 'Email', 'WhatsApp', 'Origem', 'Tem Login', 'Data de Cadastro', 'Último Login'];
    const rows = contactsData.items.map(c => [
      c.nome,
      c.email,
      c.whatsapp,
      c.source,
      c.hasOAuth ? 'Sim' : 'Não',
      new Date(c.createdAt).toLocaleString('pt-BR'),
      c.lastSignedIn ? new Date(c.lastSignedIn).toLocaleString('pt-BR') : '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos_fisioprecifica_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso!');
  };

  // Auth gate
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Central de Contatos"
          description="Faça login como administrador para acessar os contatos"
          icon={Users}
        />
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            Acesso restrito
          </h3>
          <p className="text-muted-foreground mb-6">
            Você precisa fazer login como administrador para visualizar os contatos.
          </p>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="rounded-xl"
          >
            Fazer login
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Central de Contatos"
          description="Acesso restrito a administradores"
          icon={Users}
        />
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            Sem permissão
          </h3>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar a central de contatos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Contatos"
        description="Todos os contatos unificados — cadastros do banner e logins OAuth em um só lugar"
        icon={Users}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl gap-1.5"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              className="rounded-xl gap-1.5"
              onClick={exportCSV}
              disabled={!contactsData?.items?.length}
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Contatos"
          value={String(stats.total)}
          subtitle="Leads + Usuários unificados"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Com Login"
          value={String(stats.withOAuth)}
          subtitle="Fizeram login OAuth"
          icon={LogIn}
          variant="success"
        />
        <StatCard
          title="Apenas Banner"
          value={String(stats.bannerOnly)}
          subtitle="Cadastro sem login"
          icon={Globe}
          variant="warning"
        />
        <StatCard
          title="Com WhatsApp"
          value={String(stats.withWhatsapp)}
          subtitle="Contatos diretos"
          icon={Phone}
          variant="default"
        />
      </div>

      {/* Explanation Card */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Como funciona a unificação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 text-terracotta mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Banner</p>
              <p>Pessoa preencheu nome, e-mail e WhatsApp no banner de cadastro do app</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <LogIn className="w-4 h-4 text-sage-dark mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Login OAuth</p>
              <p>Pessoa fez login com conta Manus — nome e e-mail capturados automaticamente</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-gold-dark mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Banner + Login</p>
              <p>Pessoa fez ambos — dados unificados pelo e-mail em um único registro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Buscar por nome, e-mail ou WhatsApp..."
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'banner', 'oauth', 'both'] as const).map(filter => (
            <Button
              key={filter}
              variant={sourceFilter === filter ? 'default' : 'outline'}
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => { setSourceFilter(filter); setPage(0); }}
            >
              {filter === 'all' ? 'Todos' : filter === 'banner' ? 'Banner' : filter === 'oauth' ? 'Login' : 'Ambos'}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Carregando contatos...</p>
          </div>
        ) : paginatedContacts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search || sourceFilter !== 'all'
                ? 'Nenhum contato encontrado para estes filtros'
                : 'Nenhum contato cadastrado ainda'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Origem</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContacts.map((contact, idx) => (
                    <tr key={contact.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {page * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">{contact.nome || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline">
                          {contact.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {contact.whatsapp ? (
                          <a
                            href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-sage-dark hover:underline"
                          >
                            {contact.whatsapp}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <SourceBadge source={contact.source} hasOAuth={contact.hasOAuth} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                          {contact.lastSignedIn && (
                            <span className="text-[10px] text-muted-foreground/60">
                              Último login: {new Date(contact.lastSignedIn).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Mostrando {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filteredContacts.length)} de {filteredContacts.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
