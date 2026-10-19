import { describe, expect, it } from 'vitest';
import {
  clearLocalDataClearedFlag,
  getNextSyncStatus,
  hasPendingLocalSync,
  isLocalDataCleared,
  markLocalDataCleared,
  setPendingLocalSync,
  shouldPreserveLocalDataOnLogout,
} from './sync';

function memoryStore() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe('synchronization state', () => {
  it('marca falha para tentar de novo e sucesso quando o servidor confirma', () => {
    expect(getNextSyncStatus({ success: false })).toBe('failed');
    expect(getNextSyncStatus({ success: true })).toBe('synced');
  });

  it('preserva os dados locais ao sair se a última gravação não foi confirmada', () => {
    expect(shouldPreserveLocalDataOnLogout('pending')).toBe(true);
    expect(shouldPreserveLocalDataOnLogout('failed')).toBe(true);
    expect(shouldPreserveLocalDataOnLogout('synced')).toBe(false);
  });

  it('guarda e limpa o aviso de alteração local ainda não enviada', () => {
    const storage = memoryStore();
    expect(hasPendingLocalSync(storage)).toBe(false);
    setPendingLocalSync(true, storage);
    expect(hasPendingLocalSync(storage)).toBe(true);
    setPendingLocalSync(false, storage);
    expect(hasPendingLocalSync(storage)).toBe(false);
  });

  it('mantém o aviso de limpeza até alguém apagá-lo', () => {
    const storage = memoryStore();
    expect(isLocalDataCleared(storage)).toBe(false);
    markLocalDataCleared(storage);
    expect(isLocalDataCleared(storage)).toBe(true);
    expect(isLocalDataCleared(storage)).toBe(true);
    clearLocalDataClearedFlag(storage);
    expect(isLocalDataCleared(storage)).toBe(false);
  });
});
