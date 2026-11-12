# ADR-005 — Espelho local com o remoto atrasado 2 segundos

- **Status:** aceito
- **Evidência:** `DataContext.tsx` debounce 2000 ms, flag pending, retry 5000 ms, commits `4e43bdc` e `3a384d4` sobre sync da cópia local
- **Confiança:** 🟢

## Decisão

Toda edição grava `localStorage` na hora. O POST espera 2 segundos sem nova edição. Se falhar, o local sobrevive ao logout mediante confirmação, e a próxima sessão não deixa o GET antigo sobrescrever o pending.

## Consequências

- Fechar a aba antes dos 2 segundos perde o POST, não o local.
- Duas abas geram duas filas de debounce independentes.
- A flag pending usa outra chave (`fisio_precifica_sync_pending`), fácil de esquecer num reset parcial.
