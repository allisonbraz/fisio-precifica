# Autenticação, Tarefas de Implementação

## Pré-requisitos

- [ ] Projeto Supabase com e-mail/senha
- [ ] `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e os equivalentes no servidor
- [ ] `ADMIN_EMAIL` se houver operador

## Tarefas

- [ ] T-01, Client Supabase e telas de login, cadastro e reset
  - Origem: `client/src/lib/supabase.ts`, `pages/Login.tsx`
  - Critério de pronto: sessão dispara `auth.me`
  - Confiança: 🟢

- [ ] T-02, Header Bearer no `httpBatchLink`
  - Origem: `client/src/main.tsx:50-61`
  - Critério de pronto: request sem sessão não manda `authorization`
  - Confiança: 🟢

- [ ] T-03, `createContext` com `getUser` e upsert
  - Origem: `server/_core/context.ts`
  - Critério de pronto: token inválido não derruba o processo; user fica null
  - Confiança: 🟢

- [ ] T-04, Promoção a admin e procedimentos `protected` / `admin`
  - Origem: `server/_core/trpc.ts`
  - Critério de pronto: mensagens 10001 e 10002
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Login feliz até `auth.me` com e-mail
- [ ] TT-02, Procedimento protegido sem header
- [ ] TT-03, E-mail igual a `ADMIN_EMAIL` grava `role = admin`

## Lacunas Pendentes (🔴)

- Não assumir que o cadastro já entra logado. O código trata os dois ramos.
- Não rebaixar admin até haver resposta humana.
