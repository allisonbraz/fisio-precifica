export type SyncStatus = 'synced' | 'pending' | 'failed';

const SYNC_PENDING_KEY = 'fisio_precifica_sync_pending';
const LOCAL_CLEARED_KEY = 'fisio_precifica_local_cleared';

type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function getNextSyncStatus(result: { success: boolean }): SyncStatus {
  return result.success ? 'synced' : 'failed';
}

export function shouldPreserveLocalDataOnLogout(syncStatus: SyncStatus): boolean {
  return syncStatus !== 'synced';
}

function browserStorage(): KeyValueStore | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** Lembra que existe alteração local ainda não confirmada no servidor. */
export function hasPendingLocalSync(storage: KeyValueStore | null = browserStorage()): boolean {
  return storage?.getItem(SYNC_PENDING_KEY) === '1';
}

export function setPendingLocalSync(pending: boolean, storage: KeyValueStore | null = browserStorage()): void {
  if (!storage) return;
  if (pending) storage.setItem(SYNC_PENDING_KEY, '1');
  else storage.removeItem(SYNC_PENDING_KEY);
}

function sessionStore(): KeyValueStore | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

/** Evita que o estado em memória regrave o navegador logo depois de um logout que limpou os dados. */
export function markLocalDataCleared(storage: KeyValueStore | null = sessionStore()): void {
  storage?.setItem(LOCAL_CLEARED_KEY, '1');
}

export function isLocalDataCleared(storage: KeyValueStore | null = sessionStore()): boolean {
  return storage?.getItem(LOCAL_CLEARED_KEY) === '1';
}

export function clearLocalDataClearedFlag(storage: KeyValueStore | null = sessionStore()): void {
  storage?.removeItem(LOCAL_CLEARED_KEY);
}
