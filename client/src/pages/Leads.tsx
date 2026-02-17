/**
 * Leads Admin Page
 * Design: Warm Professional — Organic Modernism
 * Admin-only page to view and export captured leads
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

export default function Leads() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data: leadsData, isLoading, refetch } = trpc.leads.list.useQuery(
    { limit: 500, offset: 0 },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );

  // Filter and paginate locally
  const filteredLeads = useMemo(() => {
    if (!leadsData?.items) return [];
    if (!search.trim()) return leadsData.items;
    const q = search.toLowerCase();
    return leadsData.items.filter(
      l => l.nome.toLowerCase().includes(q) ||
           l.email.toLowerCase().includes(q) ||
           l.whatsapp.includes(q)
    );
  }, [leadsData, search]);

  const totalPages = Math.ceil(filteredLeads.length / PAGE_SIZE);
  const paginatedLeads = filteredLeads.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportCSV = () => {
    if (!leadsData?.items?.length) {
      toast.error('Nenhum lead para exportar');
      return;
    }
    const headers = ['Nome', 'Email', 'WhatsApp', 'Data de Cadastro', 'IP', 'Origem'];
    const rows = leadsData.items.map(l => [
      l.nome,
      l.email,
      l.whatsapp,
      new Date(l.createdAt).toLocaleString('pt-BR'),
      l.ip || '',
      l.source || 'fisioprecifica',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_fisioprecifica_${new Date().toISOString().split('T')[0]}.csv`;
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
          title="Painel de Leads"
          description="Faça login como administrador para acessar os leads capturados"
          icon={Users}
        />
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            Acesso restrito
          </h3>
          <p className="text-muted-foreground mb-6">
            Você precisa fazer login como administrador para visualizar os leads capturados.
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
          title="Painel de Leads"
          description="Acesso restrito a administradores"
          icon={Users}
        />
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            Sem permissão
          </h3>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar o painel de leads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Leads"
        description="Visualize e exporte os contatos capturados para sua mailing list"
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
              disabled={!leadsData?.items?.length}
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total de Leads"
          value={String(leadsData?.total ?? 0)}
          subtitle="Cadastros realizados"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="E-mails Capturados"
          value={String(leadsData?.total ?? 0)}
          subtitle="Para mailing list"
          icon={Mail}
          variant="success"
        />
        <StatCard
          title="WhatsApp"
          value={String(leadsData?.total ?? 0)}
          subtitle="Contatos diretos"
          icon={Phone}
          variant="warning"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Buscar por nome, e-mail ou WhatsApp..."
          className="pl-10 rounded-xl"
        />
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
            <p className="text-muted-foreground">Carregando leads...</p>
          </div>
        ) : paginatedLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search ? 'Nenhum lead encontrado para esta busca' : 'Nenhum lead cadastrado ainda'}
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map((lead, idx) => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {page * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground">{lead.nome}</span>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-sage-dark hover:underline"
                        >
                          {lead.whatsapp}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
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
                  Mostrando {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filteredLeads.length)} de {filteredLeads.length}
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
