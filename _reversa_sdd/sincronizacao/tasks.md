# Sincronização, Tarefas de Implementação

## Pré-requisitos

- [ ] `pricing.save` e `pricing.load` com o contrato de `../api/`
- [ ] Chaves de localStorage documentadas em `../database/data-dictionary.md`

## Tarefas

- [ ] T-01, Portar flags de `sync.ts` com os nomes atuais
  - Origem: `client/src/lib/sync.ts`
  - Critério de pronto: testes de `sync.test.ts`
  - Confiança: 🟢

- [ ] T-02, Reproduzir o efeito de debounce, o bloqueio antes do load e o retry
  - Origem: `DataContext.tsx` linhas 143–237
  - Critério de pronto: nenhum POST antes de `remoteDataLoaded`; POST 2s depois; retry 5s
  - Confiança: 🟢

- [ ] T-03, Merge remoto com exceção de pending, MEI e modo default
  - Origem: `DataContext.tsx` linhas 151–181
  - Critério de pronto: pending local sobrevive ao GET
  - Confiança: 🟢

- [ ] T-04, Logout condicional e reset na troca de e-mail
  - Origem: `Layout.tsx` `handleLogout`, efeito de `user.email`
  - Critério de pronto: confirm cancela a saída; conta nova não herda JSON
  - Confiança: 🟢

- [ ] T-05, Portar migrações de `loadData` se o CRM for ler JSON antigo
  - Origem: `store.ts` `loadData`
  - Critério de pronto: markup > 0,50 vira margem; MEI vira personalizado
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Happy path local → POST → synced
- [ ] TT-02, Falha de rede mantém pending e não aplica o GET
- [ ] TT-03, Logout sujo preserva `fisioprecifica_data`

## Lacunas Pendentes (🔴)

- Conflito de duas abas permanece last-write-wins até haver versão no JSON.
