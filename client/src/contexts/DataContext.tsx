/**
 * FisioPrecifica Data Context v3
 * Evolução Estrutural: Custos Operacionais / Depreciação / Reservas Estratégicas
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  DadosPrecificacao,
  CustoFixo,
  CustoVariavel,
  ReservaEstrategica,
  TipoServico,
  PlanoTratamento,
  RegistroMensal,
  LeadData,
  PerfilProfissional,
  loadData,
  saveData,
  resetData,
  generateId,
  loadLead,
  saveLead,
  loadPerfil,
  savePerfil,
} from '@/lib/store';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface DataContextType {
  data: DadosPrecificacao;
  lead: LeadData | null;
  perfil: PerfilProfissional;
  isRegistered: boolean;
  updatePerfil: (updates: Partial<PerfilProfissional>) => void;
  // Custos Fixos (operacionais + depreciação)
  updateCustoFixo: (id: string, updates: Partial<CustoFixo>) => void;
  addCustoFixo: (custo: Omit<CustoFixo, 'id'>) => void;
  zeroCustoFixo: (id: string) => void;
  // Custos Variáveis
  updateCustoVariavel: (id: string, updates: Partial<CustoVariavel>) => void;
  addCustoVariavel: (custo: Omit<CustoVariavel, 'id'>) => void;
  zeroCustoVariavel: (id: string) => void;
  // Reservas Estratégicas
  updateReserva: (id: string, updates: Partial<ReservaEstrategica>) => void;
  addReserva: (reserva: Omit<ReservaEstrategica, 'id'>) => void;
  zeroReserva: (id: string) => void;
  // Bulk
  zerarTodosCustos: () => void;
  zerarTodasReservas: () => void;
  // Parameters
  updateSessoesMeta: (value: number) => void;
  updateMargemLucro: (value: number) => void;
  updatePrecoDefinido: (value: number) => void;
  updateHorasTrabalho: (value: number) => void;
  updateDiasUteis: (value: number) => void;
  updateSessoesporDia: (value: number) => void;
  updateDuracaoPadrao: (value: number) => void;
  updateRegimeTributario: (regime: string, imposto: number) => void;
  updateImpostoPercentual: (value: number) => void;
  // Serviços
  addTipoServico: (servico: Omit<TipoServico, 'id'>) => void;
  updateTipoServico: (id: string, updates: Partial<TipoServico>) => void;
  removeTipoServico: (id: string) => void;
  // Planos de Tratamento
  addPlanoTratamento: (plano: Omit<PlanoTratamento, 'id'>) => void;
  updatePlanoTratamento: (id: string, updates: Partial<PlanoTratamento>) => void;
  removePlanoTratamento: (id: string) => void;
  // Registros Mensais
  addRegistroMensal: (registro: Omit<RegistroMensal, 'id'>) => void;
  updateRegistroMensal: (id: string, updates: Partial<RegistroMensal>) => void;
  removeRegistroMensal: (id: string) => void;
  // Global
  resetAllData: () => void;
  importData: (data: DadosPrecificacao) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DadosPrecificacao>(() => loadData());
  const [lead, setLead] = useState<LeadData | null>(() => loadLead());
  const [perfil, setPerfilState] = useState<PerfilProfissional>(() => loadPerfil());
  const { user } = useAuth();

  // isRegistered = logged in via Supabase OR legacy lead registration
  const isRegistered = !!user || lead !== null;
  const isAuthenticated = !!user;
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveMutation = trpc.pricing.save.useMutation();
  const lastSyncedUser = useRef<string | null>(null);
  const [remoteDataLoaded, setRemoteDataLoaded] = useState(false);

  // Keep the remote state authoritative for signed-in users. In particular, do
  // not let the first local render schedule a write before this query returns.
  const pricingQuery = trpc.pricing.load.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchOnMount: 'always' },
  );

  // Auto-register lead data when user logs in via Supabase
  useEffect(() => {
    if (user?.email && !lead) {
      const autoLead: LeadData = {
        nome: user.name || user.email.split('@')[0],
        email: user.email,
        whatsapp: '',
        registeredAt: new Date().toISOString(),
      };
      saveLead(autoLead);
      setLead(autoLead);
    }
  }, [user, lead]);

  // Reset local data and fetch again when the authenticated account changes.
  // The query key has no user identifier, so an explicit refetch is required
  // to avoid reusing the previous account's cached result.
  useEffect(() => {
    const currentEmail = user?.email ?? null;
    if (lastSyncedUser.current !== null && lastSyncedUser.current !== currentEmail) {
      setRemoteDataLoaded(false);
      const fresh = resetData();
      setData(fresh);
      setPerfilState(loadPerfil()); // reload defaults
      if (currentEmail) {
        void pricingQuery.refetch();
      }
    }
    lastSyncedUser.current = currentEmail;
  }, [user?.email, pricingQuery.refetch]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRemoteDataLoaded(false);
      return;
    }

    // A successful response with no saved data is also a completed initial
    // sync: only then may a new account's local defaults be persisted.
    if (pricingQuery.isSuccess) {
      const serverData = pricingQuery.data?.data as Record<string, unknown> | null | undefined;
      // Extract perfil if synced
      if (serverData?._perfil) {
        const serverPerfil = serverData._perfil as Partial<PerfilProfissional>;
        setPerfilState(prev => {
          const merged = { ...prev, ...serverPerfil };
          savePerfil(merged);
          return merged;
        });
      }
      if (serverData?.custosFixos) {
        const { _perfil, ...pricingOnly } = serverData;
        setData(prev => {
          const incoming = pricingOnly as unknown as DadosPrecificacao;
          return {
            ...prev,
            ...incoming,
            regimeTributario: incoming.regimeTributario === 'mei' ? 'personalizado' : incoming.regimeTributario,
            custosVariaveis: (incoming.custosVariaveis || prev.custosVariaveis).map(c => ({ ...c, modo: c.modo || 'mensal', percentual: c.percentual || 0 })),
            etapasConcluidas: incoming.etapasConcluidas || {},
          };
        });
      }
      setRemoteDataLoaded(true);
    }
  }, [isAuthenticated, pricingQuery.data, pricingQuery.isSuccess]);

  // Save to localStorage immediately + debounce save to server
  useEffect(() => {
    saveData(data);
    savePerfil(perfil);

    if (!isAuthenticated || !remoteDataLoaded) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      saveMutation.mutate(
        { data: { ...data, _perfil: perfil } as unknown as Record<string, unknown> },
        { onError: (err) => console.warn('[Sync] Failed to save to server:', err) },
      );
    }, 2000);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [data, perfil, isAuthenticated, remoteDataLoaded]);

  const updatePerfil = useCallback((updates: Partial<PerfilProfissional>) => {
    setPerfilState(prev => {
      const updated = { ...prev, ...updates };
      savePerfil(updated);
      return updated;
    });
  }, []);

  // --- Custos Fixos ---
  const updateCustoFixo = useCallback((id: string, updates: Partial<CustoFixo>) => {
    setData(prev => ({
      ...prev,
      custosFixos: prev.custosFixos.map(c => c.id === id ? { ...c, ...updates } : c),
      etapasConcluidas: { ...prev.etapasConcluidas, custos: true },
    }));
  }, []);

  const addCustoFixo = useCallback((custo: Omit<CustoFixo, 'id'>) => {
    setData(prev => ({
      ...prev,
      custosFixos: [...prev.custosFixos, { ...custo, id: generateId() }],
      etapasConcluidas: { ...prev.etapasConcluidas, custos: true },
    }));
  }, []);

  const zeroCustoFixo = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      custosFixos: prev.custosFixos.map(c => c.id === id ? { ...c, valor: 0 } : c),
      etapasConcluidas: { ...prev.etapasConcluidas, custos: true },
    }));
  }, []);

  // --- Custos Variáveis ---
  const updateCustoVariavel = useCallback((id: string, updates: Partial<CustoVariavel>) => {
    setData(prev => ({
      ...prev,
      custosVariaveis: prev.custosVariaveis.map(c => c.id === id ? { ...c, ...updates } : c),
      etapasConcluidas: { ...prev.etapasConcluidas, custos: true },
    }));
  }, []);

  const addCustoVariavel = useCallback((custo: Omit<CustoVariavel, 'id'>) => {
    setData(prev => ({
      ...prev,
      custosVariaveis: [...prev.custosVariaveis, { ...custo, id: generateId() }],
      etapasConcluidas: { ...prev.etapasConcluidas, custos: true },
    }));
  }, []);

  const zeroCustoVariavel = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      custosVariaveis: prev.custosVariaveis.map(c => c.id === id ? { ...c, valor: 0, percentual: 0 } : c),
      etapasConcluidas: { ...prev.etapasConcluidas, custos: true },
    }));
  }, []);

  // --- Reservas Estratégicas ---
  const updateReserva = useCallback((id: string, updates: Partial<ReservaEstrategica>) => {
    setData(prev => ({
      ...prev,
      reservasEstrategicas: prev.reservasEstrategicas.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  }, []);

  const addReserva = useCallback((reserva: Omit<ReservaEstrategica, 'id'>) => {
    setData(prev => ({
      ...prev,
      reservasEstrategicas: [...prev.reservasEstrategicas, { ...reserva, id: generateId() }],
    }));
  }, []);

  const zeroReserva = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      reservasEstrategicas: prev.reservasEstrategicas.map(r => r.id === id ? { ...r, valor: 0 } : r),
    }));
  }, []);

  // --- Bulk ---
  const zerarTodosCustos = useCallback(() => {
    setData(prev => ({
      ...prev,
      custosFixos: prev.custosFixos.map(c => ({ ...c, valor: 0 })),
      custosVariaveis: prev.custosVariaveis.map(c => ({ ...c, valor: 0 })),
    }));
  }, []);

  const zerarTodasReservas = useCallback(() => {
    setData(prev => ({
      ...prev,
      reservasEstrategicas: prev.reservasEstrategicas.map(r => ({ ...r, valor: 0 })),
    }));
  }, []);

  // --- Parameters ---
  const updateSessoesMeta = useCallback((value: number) => {
    setData(prev => ({ ...prev, sessoesMeta: value, etapasConcluidas: { ...prev.etapasConcluidas, precificacao: true } }));
  }, []);

  const updateMargemLucro = useCallback((value: number) => {
    setData(prev => ({ ...prev, margemLucro: value, etapasConcluidas: { ...prev.etapasConcluidas, precificacao: true } }));
  }, []);

  const updatePrecoDefinido = useCallback((value: number) => {
    setData(prev => ({ ...prev, precoDefinido: value, etapasConcluidas: { ...prev.etapasConcluidas, precificacao: true } }));
  }, []);

  const updateHorasTrabalho = useCallback((value: number) => {
    setData(prev => ({ ...prev, horasTrabalho: value }));
  }, []);

  const updateDiasUteis = useCallback((value: number) => {
    setData(prev => ({ ...prev, diasUteis: value }));
  }, []);

  const updateSessoesporDia = useCallback((value: number) => {
    setData(prev => ({ ...prev, sessoesporDia: value }));
  }, []);

  const updateDuracaoPadrao = useCallback((value: number) => {
    setData(prev => ({ ...prev, duracaoPadraoMinutos: value }));
  }, []);

  const updateRegimeTributario = useCallback((regime: string, imposto: number) => {
    setData(prev => ({ ...prev, regimeTributario: regime as any, impostoPercentual: imposto, etapasConcluidas: { ...prev.etapasConcluidas, precificacao: true } }));
  }, []);

  const updateImpostoPercentual = useCallback((value: number) => {
    setData(prev => ({ ...prev, impostoPercentual: value, etapasConcluidas: { ...prev.etapasConcluidas, precificacao: true } }));
  }, []);

  // --- Serviços ---
  const addTipoServico = useCallback((servico: Omit<TipoServico, 'id'>) => {
    setData(prev => ({
      ...prev,
      tiposServico: [...prev.tiposServico, { ...servico, id: generateId() }],
      etapasConcluidas: { ...prev.etapasConcluidas, servicos: true },
    }));
  }, []);

  const updateTipoServico = useCallback((id: string, updates: Partial<TipoServico>) => {
    setData(prev => ({
      ...prev,
      tiposServico: prev.tiposServico.map(s => s.id === id ? { ...s, ...updates } : s),
      etapasConcluidas: { ...prev.etapasConcluidas, servicos: true },
    }));
  }, []);

  const removeTipoServico = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tiposServico: prev.tiposServico.filter(s => s.id !== id),
      etapasConcluidas: { ...prev.etapasConcluidas, servicos: true },
    }));
  }, []);

  // --- Planos de Tratamento ---
  const addPlanoTratamento = useCallback((plano: Omit<PlanoTratamento, 'id'>) => {
    setData(prev => ({
      ...prev,
      planosTratamento: [...prev.planosTratamento, { ...plano, id: generateId() }],
    }));
  }, []);

  const updatePlanoTratamento = useCallback((id: string, updates: Partial<PlanoTratamento>) => {
    setData(prev => ({
      ...prev,
      planosTratamento: prev.planosTratamento.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const removePlanoTratamento = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      planosTratamento: prev.planosTratamento.filter(p => p.id !== id),
    }));
  }, []);

  // --- Registros Mensais ---
  const addRegistroMensal = useCallback((registro: Omit<RegistroMensal, 'id'>) => {
    setData(prev => ({
      ...prev,
      registrosMensais: [...prev.registrosMensais, { ...registro, id: generateId() }],
    }));
  }, []);

  const updateRegistroMensal = useCallback((id: string, updates: Partial<RegistroMensal>) => {
    setData(prev => ({
      ...prev,
      registrosMensais: prev.registrosMensais.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  }, []);

  const removeRegistroMensal = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      registrosMensais: prev.registrosMensais.filter(r => r.id !== id),
    }));
  }, []);

  // --- Global ---
  const resetAllData = useCallback(() => {
    const fresh = resetData();
    setData(fresh);
  }, []);

  const importData = useCallback((newData: DadosPrecificacao) => {
    setData(newData);
  }, []);

  return (
    <DataContext.Provider value={{
      data,
      lead,
      perfil,
      isRegistered,
      updatePerfil,
      updateCustoFixo,
      addCustoFixo,
      zeroCustoFixo,
      updateCustoVariavel,
      addCustoVariavel,
      zeroCustoVariavel,
      updateReserva,
      addReserva,
      zeroReserva,
      zerarTodosCustos,
      zerarTodasReservas,
      updateSessoesMeta,
      updateMargemLucro,
      updatePrecoDefinido,
      updateHorasTrabalho,
      updateDiasUteis,
      updateSessoesporDia,
      updateDuracaoPadrao,
      updateRegimeTributario,
      updateImpostoPercentual,
      addTipoServico,
      updateTipoServico,
      removeTipoServico,
      addPlanoTratamento,
      updatePlanoTratamento,
      removePlanoTratamento,
      addRegistroMensal,
      updateRegistroMensal,
      removeRegistroMensal,
      resetAllData,
      importData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
