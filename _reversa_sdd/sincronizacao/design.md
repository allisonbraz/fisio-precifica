# Sincronização, Design Técnico

## Interface

| Símbolo | Papel |
|---------|--------|
| `syncStatus` | `'synced' \| 'pending' \| 'failed'` |
| `syncNow()` | POST imediato, cancela o debounce |
| `hasPendingLocalSync` | lê a flag |
| `shouldPreserveLocalDataOnLogout` | verdadeiro se status ≠ synced |
| `pricing.save` | mutation |
| `pricing.load` | query habilitada só com sessão |

## Fluxo Principal

Ver `../sequences/auth-e-sync.md`.

1. Estado inicial vem de `loadData()` / `loadPerfil()` / `loadLead()`.
2. Se há user sem lead local, grava um lead automático com WhatsApp vazio. Isso marca `isRegistered` mesmo antes, mas o gate visual olha o user. 🟢
3. Efeito de `[data, perfil]` salva local e, se autenticado e load concluído, liga o timer de 2s e já põe status `pending`.
4. `syncNow` envia o documento. `success: false` (banco fora) é falha, não exceção.

## Fluxos Alternativos

- **Flag `fisio_precifica_local_cleared` na session:** o efeito não regrava o local logo depois do logout que limpou. Se a pessoa segue autenticada, a flag é removida e o save segue. 🟢 `sync.ts` e o efeito nas linhas 216–218.
- **Banco indisponível:** `save` devolve `{ success: false }` sem throw quando `getDb()` é null. O client trata como falha e tenta de novo.

## Dependências

- tRPC `pricing.*`
- localStorage e sessionStorage
- Motor não participa; só o documento

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Local primeiro | efeito salva antes do timer | 🟢 |
| Perfil viaja dentro do mesmo JSON | `_perfil` no save | 🟢 |
| Sem merge de campo no servidor | replace do jsonb | 🟢 |

## Estado Interno

React state + localStorage + uma linha Postgres. Três cópias. A flag pending diz qual cópia manda no próximo load. 🟢

## Observabilidade

`console.warn('[Sync] Failed to save to server:')`. 🟢

## Riscos e Lacunas

- 🟡 Duas abas: dois debounces, último POST ganha.
- 🔴 Import pode furar o migrador até o reload.
- 🟡 O prefixo `fisio_precifica_*` e `fisioprecifica_*` convivem.
