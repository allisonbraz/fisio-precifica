# API tRPC

## Visão Geral

Um router Express em `/api/trpc` expõe sessão, lead, documento de preço, contatos e dois procedimentos de sistema. O corpo viaja em SuperJSON. 🟢

## Responsabilidades

- Autorizar com os middlewares `public`, `rateLimited`, `protected` e `admin`.
- Validar input com Zod 4.
- Persistir via Drizzle.
- Não recalcular preço.

## Regras de Negócio

- Catálogo completo: `../openapi/trpc-procedures.yaml`.
- `pricing.save` devolve `{ success: false }` se não há banco, em vez de erro tRPC. Outras falhas de SQL propagam. 🟢 `savePricingData`.
- `pricing.load` devolve `{ data: null }` também quando a query lança. 🟢 catch que retorna null.
- `leads.register` exige `marketingConsent: true` literal e grava `source: 'banner'`. O booleano não vai para o banco. 🟢
- Rate limit: 5 pedidos / 60s / IP, memória do processo, mensagem "Muitas requisições. Tente novamente em 1 minuto." 🟢
- `system.health` ignora o timestamp depois de validar que é ≥ 0. 🟢
- `system.notifyOwner` depende de Forge. Fora do produto de preço. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério |
|----|-----------|------------|----------|
| RF-01 | `auth.me` | Must | devolve ctx.user |
| RF-02 | `pricing.save` / `load` escopados ao e-mail | Must | sem parâmetro de outro dono |
| RF-03 | `leads.register` com upsert por e-mail | Must | segundo POST atualiza nome |
| RF-04 | Listas admin paginadas até 500 | Should | Zod max 500 |
| RF-05 | `contacts.changeEmail` | Should | 404, 409, 500 conforme o caso |

## Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confiança |
|------|-----------|-----------|-----------|
| Segurança | Zod nos inputs de preço (valores ≥ 0, frações ≤ 1) | `routers.ts` | 🟢 |
| Segurança | `.passthrough()` deixa chave desconhecida entrar no jsonb | linha 156 | 🟢 |
| Performance | Body JSON até 50mb | `index.ts` e `vercel-entry.ts` | 🟢 |
| Disponibilidade | Função Vercel com 30s e 256 MB | `vercel.json` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um user autenticado
Quando pricing.save recebe o documento
Então a linha de pricing_data daquele e-mail é inserida ou substituída
E updatedAt muda

Dado o sexto leads.register do mesmo IP em menos de um minuto
Quando a chamada ocorre no mesmo processo
Então o código é TOO_MANY_REQUESTS

Dado um user comum
Quando chama contacts.list
Então o código é FORBIDDEN
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| pricing e auth | Must | Produto |
| leads e contacts | Should | Operação e aquisição |
| notifyOwner e storage Forge | Won't | Não acoplar o CRM a isso |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `server/routers.ts` | `appRouter` | 🟢 |
| `server/db.ts` | funções exportadas | 🟢 |
| `server/_core/trpc.ts` | middlewares | 🟢 |
| `server/vercel-entry.ts` | app | 🟢 |
