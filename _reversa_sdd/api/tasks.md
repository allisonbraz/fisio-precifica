# API tRPC, Tarefas de Implementação

## Pré-requisitos

- [ ] `DATABASE_URL` e Supabase
- [ ] Schema aplicado, com a ressalva da migração 0001

## Tarefas

- [ ] T-01, Middlewares public, protected, admin e rate limit com as mensagens atuais
  - Origem: `server/_core/trpc.ts`, `shared/const.ts`
  - Critério de pronto: 10001 e 10002 e TOO_MANY_REQUESTS
  - Confiança: 🟢

- [ ] T-02, `pricing.save` / `load` por e-mail, Zod alinhado a `types.ts`, passthrough preservado se a compatibilidade exigir
  - Origem: `server/routers.ts` linhas 59–168
  - Critério de pronto: round-trip do documento de exemplo dos testes
  - Confiança: 🟢

- [ ] T-03, Leads com upsert e rate limit
  - Origem: `routers.ts` e `createLead`
  - Critério de pronto: e-mail repetido atualiza nome e não duplica
  - Confiança: 🟢

- [ ] T-04, Não responder success se `createLead` devolveu null
  - Origem: furo descrito no design
  - Critério de pronto: banco ausente não mente sucesso
  - Confiança: 🟢 o furo; a correção é evolução, não comportamento a copiar cegamente

## Tarefas de Teste

- [ ] TT-01, Save e load do próprio e-mail
- [ ] TT-02, Load de outro usuário impossível pelo input
- [ ] TT-03, Sexto register no mesmo IP

## Lacunas Pendentes (🔴)

- Limite de tamanho do documento não está decidido.
