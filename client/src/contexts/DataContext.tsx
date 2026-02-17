/**
 * FisioPrecifica Data Context
 * Design: Warm Professional — Organic Modernism
 * Provides global data state management with localStorage persistence
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  DadosPrecificacao,
  CustoFixo,
  CustoVariavel,
  TipoServico,
  Pacote,
  RegistroMensal,
  loadData,
  saveData,
  resetData,
  generateId,
} from '@/lib/store';

interface DataContextType {
  data: DadosPrecificacao;
  updateCustoFixo: (id: string, updates: Partial<CustoFixo>) => void;
  addCustoFixo: (custo: Omit<CustoFixo, 'id'>) => void;
  removeCustoFixo: (id: string) => void;
  updateCustoVariavel: (id: string, updates: Partial<CustoVariavel>) => void;
  addCustoVariavel: (custo: Omit<CustoVariavel, 'id'>) => void;
  removeCustoVariavel: (id: string) => void;
  updateSessoesMeta: (value: number) => void;
  updateMargemLucro: (value: number) => void;
  updateHorasTrabalho: (value: number) => void;
  updateDiasUteis: (value: number) => void;
  updateSessoesporDia: (value: number) => void;
  addTipoServico: (servico: Omit<TipoServico, 'id'>) => void;
  updateTipoServico: (id: string, updates: Partial<TipoServico>) => void;
  removeTipoServico: (id: string) => void;
  addPacote: (pacote: Omit<Pacote, 'id'>) => void;
  updatePacote: (id: string, updates: Partial<Pacote>) => void;
  removePacote: (id: string) => void;
  addRegistroMensal: (registro: Omit<RegistroMensal, 'id'>) => void;
  updateRegistroMensal: (id: string, updates: Partial<RegistroMensal>) => void;
  removeRegistroMensal: (id: string) => void;
  resetAllData: () => void;
  importData: (data: DadosPrecificacao) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DadosPrecificacao>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

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

  const removeCustoFixo = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      custosFixos: prev.custosFixos.filter(c => c.id !== id),
    }));
  }, []);

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

  const removeCustoVariavel = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      custosVariaveis: prev.custosVariaveis.filter(c => c.id !== id),
    }));
  }, []);

  const updateSessoesMeta = useCallback((value: number) => {
    setData(prev => ({ ...prev, sessoesMeta: value }));
  }, []);

  const updateMargemLucro = useCallback((value: number) => {
    setData(prev => ({ ...prev, margemLucro: value }));
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

  const addPacote = useCallback((pacote: Omit<Pacote, 'id'>) => {
    setData(prev => ({
      ...prev,
      pacotes: [...prev.pacotes, { ...pacote, id: generateId() }],
    }));
  }, []);

  const updatePacote = useCallback((id: string, updates: Partial<Pacote>) => {
    setData(prev => ({
      ...prev,
      pacotes: prev.pacotes.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const removePacote = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      pacotes: prev.pacotes.filter(p => p.id !== id),
    }));
  }, []);

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
      updateCustoFixo,
      addCustoFixo,
      removeCustoFixo,
      updateCustoVariavel,
      addCustoVariavel,
      removeCustoVariavel,
      updateSessoesMeta,
      updateMargemLucro,
      updateHorasTrabalho,
      updateDiasUteis,
      updateSessoesporDia,
      addTipoServico,
      updateTipoServico,
      removeTipoServico,
      addPacote,
      updatePacote,
      removePacote,
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
