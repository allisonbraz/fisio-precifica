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
  const initialSyncDone = useRef(false);
  const lastSyncedUser = useRef<string | null>(null);

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

  // Reset local data when user changes (account switch)
  useEffect(() => {
    const currentEmail = user?.email ?? null;
    if (lastSyncedUser.current !== null && lastSyncedUser.current !== currentEmail) {
      // User changed — reset local state to defaults
      initialSyncDone.current = false;
      const fresh = resetData();
      setData(fresh);
      setPerfilState(loadPerfil()); // reload defaults
    }
    lastSyncedUser.current = currentEmail;
  }, [user?.email]);

  // Load from server on first mount when authenticated
  const { data: serverResult } = trpc.pricing.load.useQuery(
    undefined,
    { enabled: isAuthenticated && !initialSyncDone.current },
  );

  useEffect(() => {
    if (serverResult?.data && !initialSyncDone.current) {
      initialSyncDone.current = true;
      const serverData = serverResult.data as Record<string, unknown>;
      // Extract perfil if synced
      if (serverData._perfil) {
        const serverPerfil = serverData._perfil as Partial<PerfilProfissional>;
        setPerfilState(prev => {
          const merged = { ...prev, ...serverPerfil };
          savePerfil(merged);
          return merged;
        });
      }
      if (serverData.custosFixos) {
        const { _perfil, ...pricingOnly } = serverData;
        setData(prev => ({ ...prev, ...pricingOnly as unknown as DadosPrecificacao }));
      }
    }
  }, [serverResult]);

  // Save to localStorage immediately + debounce save to server
  useEffect(() => {
    saveData(data);
    savePerfil(perfil);

    if (!isAuthenticated) return;
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
  }, [data, perfil, isAuthenticated]);

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
    }));
  }, []);

  const addCustoFixo = useCallback((custo: Omit<CustoFixo, 'id'>) => {
    setData(prev => ({
      ...prev,
      custosFixos: [...prev.custosFixos, { ...custo, id: generateId() }],
    }));
  }, []);

  const zeroCustoFixo = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      custosFixos: prev.custosFixos.map(c => c.id === id ? { ...c, valor: 0 } : c),
    }));
  }, []);

  // --- Custos Variáveis ---
  const updateCustoVariavel = useCallback((id: string, updates: Partial<CustoVariavel>) => {
    setData(prev => ({
      ...prev,
      custosVariaveis: prev.custosVariaveis.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  }, []);

  const addCustoVariavel = useCallback((custo: Omit<CustoVariavel, 'id'>) => {
    setData(prev => ({
      ...prev,
      custosVariaveis: [...prev.custosVariaveis, { ...custo, id: generateId() }],
    }));
  }, []);

  const zeroCustoVariavel = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      custosVariaveis: prev.custosVariaveis.map(c => c.id === id ? { ...c, valor: 0 } : c),
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
    setData(prev => ({ ...prev, sessoesMeta: value }));
  }, []);

  const updateMargemLucro = useCallback((value: number) => {
    setData(prev => ({ ...prev, margemLucro: value }));
  }, []);

  const updatePrecoDefinido = useCallback((value: number) => {
    setData(prev => ({ ...prev, precoDefinido: value }));
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
    setData(prev => ({ ...prev, regimeTributario: regime as any, impostoPercentual: imposto }));
  }, []);

  const updateImpostoPercentual = useCallback((value: number) => {
    setData(prev => ({ ...prev, impostoPercentual: value }));
  }, []);

  // --- Serviços ---
  const addTipoServico = useCallback((servico: Omit<TipoServico, 'id'>) => {
    setData(prev => ({
      ...prev,
      tiposServico: [...prev.tiposServico, { ...servico, id: generateId() }],
    }));
  }, []);

  const updateTipoServico = useCallback((id: string, updates: Partial<TipoServico>) => {
    setData(prev => ({
      ...prev,
      tiposServico: prev.tiposServico.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const removeTipoServico = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      tiposServico: prev.tiposServico.filter(s => s.id !== id),
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
