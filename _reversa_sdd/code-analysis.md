# Análise de código

> Archaeologist. Leitura módulo a módulo do que um agente vai tocar. Não é um dump de cada componente visual.

## `client/src/lib/calculations.ts`

Funções puras. Sem IO. Entrada: objetos de `types.ts`. Saída: número, booleano ou o struct de `simularPreco`.

Blocos:

1. Mensalização e somas (linhas 3–49).
2. Fechos mensais que dependem do preço porque há percentual sobre receita (51–59).
3. `componentes` + `dividirComProtecao` (61–75).
4. Preços por sessão e os três preços de tabela (77–129).
5. Lucro, margem, serviço, plano, simulação, ponto de equilíbrio (131–177).
6. Agenda (179–199).

Não lança exceção de domínio. Divisão perigosa vira 0 ou `Infinity` ou o cap de 10x. 🟢

## `client/src/lib/types.ts`

Contrato TypeScript do documento. Não é validado no client na carga do `localStorage` além das migrações de `store.ts`. O servidor valida no save com Zod, com `.passthrough()`, então chaves extras sobrevivem. 🟢 `routers.ts` linha 156.

`RegistroMensal.tipo` opcional preserva lançamentos antigos. 🟢 comentário no tipo.

## `client/src/lib/store.ts`

Responsabilidades misturadas de propósito:

- Reexporta calculations, alerts e formatters (barrel histórico).
- Defaults do perfil fisioterapia.
- `loadData` com uma sequência longa de migrações.
- Chaves: `fisioprecifica_data`, `fisioprecifica_lead`, `fisioprecifica_perfil`, `fisioprecifica_leads_list`.
- `clearAllLocalData` também limpa o pending de sync e marca a sessão como limpa.

`generateId` está em `formatters.ts`: `Date.now().toString(36) + random`. Não é UUID. Colisão é improvável e não tratada. 🟢

## `client/src/lib/sync.ts`

Três funções de política e flags:

- `getNextSyncStatus`: success → `synced`, senão `failed`.
- `shouldPreserveLocalDataOnLogout`: verdadeiro se status ≠ `synced`.
- Flags `fisio_precifica_sync_pending` (localStorage) e `fisio_precifica_local_cleared` (sessionStorage). O prefixo **não** é o mesmo de `fisioprecifica_data`. 🟢 os dois nomes.

## `client/src/contexts/DataContext.tsx`

Orquestra estado React, migração de MEI no payload remoto, debounce de 2s e retry de 5s. É o único lugar que chama `pricing.save` e `pricing.load` no fluxo normal. 🟢

Ao aplicar o servidor, faz merge raso em cima do estado anterior e normaliza `modo` dos variáveis. Não substitui o objeto inteiro por um parse estrito. Campos locais que o servidor não mandou permanecem. 🟢 linhas 163–176.

## `client/src/lib/useMetrics.ts`

Memo de indicadores para o painel. Ver `domain.md`: ancora no preço estratégico.

## `client/src/pages/*`

Cada página é um componente único, sem router interno além das abas de Custos (operacionais, depreciação, variáveis, reservas). `Reservas.tsx` também existe como página, mas a rota `/reservas` faz `window.location.replace('/custos')`. 🟢 `App.tsx` linha 50.

`Precificacao.tsx` mantém dois modos de edição (`margem` e `preco`) que se reescrevem:

- Mudou margem → `margemLucro = margem/100`, `precoDefinido = round(estrategico, 2 centavos)`.
- Mudou preço → `precoDefinido = preco`, `margemLucro = clamp(calcularMargemDoPreco, 0, 0.80)`.

Aceita preço vindo da simulação por query, entre 30 e 9999, e pede confirmação. 🟢 linhas 140–156. 🟡 a simulação grava esse query string; o leitor de `?` está na precificação.

Edição sem `isRegistered` mostra toast e não grava. 🟢

## `server/routers.ts`

Um router: `system`, `auth`, `leads`, `pricing`, `contacts`. Sem versionamento de API. O tipo `AppRouter` é importado pelo client, então o contrato é o TypeScript compartilhado no monorepo, não um schema publicado. 🟢

## `server/db.ts`

- Singleton com retry de conexão a cada 5s se a última tentativa falhou e `_db` ainda é null. Se a primeira conexão **resolve** e o Postgres cai depois, o singleton não reconstrói. 🟢 linhas 10–26. 🟡 o driver `postgres` pode reconectar por conta própria; isso não está configurado aqui (`postgres(url)` sem opções).
- `createLead` faz upsert por e-mail e atualiza nome, WhatsApp e source. Não atualiza IP nem userAgent no conflito. 🟢
- `getUnifiedContacts` é SQL cru com `DISTINCT ON` e paginação. Instagram e especialidades vêm do JSON, não de coluna.
- `savePricingData` substitui o jsonb inteiro. Não há merge no servidor nem trava otimista (`updatedAt` é carimbado, nunca comparado). 🟢

## `server/_core/context.ts`

Toda request com `Bearer` válido faz upsert do user e um select. Request anônima não toca o banco. Erro vira `user = null`, engolindo a causa (o `catch` tem variável não usada; o lint aponta isso). 🟢

## Auth no browser

`Login.tsx`: signUp com `user_metadata.name`, signInWithPassword, resetPasswordForEmail com redirect para `/login`. Se o signUp já devolve session, entra direto. Senão, pede para clicar em entrar (confirmação de e-mail do projeto Supabase). 🟢 o branch; 🔴 se o projeto Supabase exige confirmação, isso é configuração fora do git.

`main.tsx` lê `getSession()` a cada headers() do batch tRPC. Não há refresh manual. A lib do Supabase renova a sessão se o client estiver configurado para isso (default da lib). 🟡 não há opção explícita no `createClient`.

## Legado Manus

`notification.ts` e `storage.ts` falam com `BUILT_IN_FORGE_*`. O commit `7039337` diz ter removido código morto da plataforma; estes dois arquivos permaneceram, e `system.notifyOwner` ainda os alcança. 🟢 arquivos presentes.

## Testes como especificação executável

O conjunto em `calculations.test.ts` é o oráculo do motor. Uma extração do pacote que quebre esses casos quebra o produto, mesmo que a UI continue compilando. 🟢
