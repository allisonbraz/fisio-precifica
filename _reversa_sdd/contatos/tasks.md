# Contatos e leads, Tarefas de Implementação

## Pré-requisitos

- [ ] Papel admin funcionando
- [ ] Service role para a troca de e-mail

## Tarefas

- [ ] T-01, Register com Zod e upsert por e-mail
  - Origem: `routers.ts` `leads.register`, `createLead`
  - Critério de pronto: consentimento false não passa; e-mail repetido não duplica
  - Confiança: 🟢

- [ ] T-02, SQL de união e enriquecimento com `_perfil`
  - Origem: `getUnifiedContacts`
  - Critério de pronto: lead+user vira uma linha; user sem lead aparece
  - Confiança: 🟢

- [ ] T-03, Tela admin e `wa.me`
  - Origem: `Leads.tsx`
  - Critério de pronto: user comum não vê o menu
  - Confiança: 🟢

- [ ] T-04, changeEmail nas três tabelas e no Auth, sem inventar transação que o código não tem
  - Origem: `routers.ts` e `updateUserEmail`
  - Critério de pronto: 404 e 409 nas condições atuais
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Upsert de lead
- [ ] TT-02, União case-insensitive
- [ ] TT-03, changeEmail com e-mail já usado

## Lacunas Pendentes (🔴)

- Persistência do consentimento e revogação.
- Transação da troca de e-mail, se a operação humana exigir atomicidade.
