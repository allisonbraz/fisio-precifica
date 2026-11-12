# Permissões

> Detective. Papéis persistidos: enum Postgres `role` = `user` | `admin`, default `user`. 🟢 `drizzle/schema.ts`.

Não há permissão por recurso além desses dois papéis e do anonimato. Não há dono de clínica com vários profissionais. 🟢 ausência de tabela de membership.

## Matriz

| Capacidade | Anônimo | User | Admin |
|------------|---------|------|-------|
| Ver landing, login, privacidade, termos | sim | sim | sim |
| Criar conta e entrar (Supabase) | sim | sim | sim |
| `auth.me` | `{ user: null }` com HTTP 200 do tRPC | o próprio user | o próprio user |
| `leads.register` | sim, 5 req/min/IP no processo | sim (não há checagem de sessão) | sim |
| `pricing.save` / `pricing.load` | 401 `Please login (10001)` | só o documento do **próprio e-mail** | o documento do próprio e-mail, não o dos outros |
| Editar custos, preço, serviços no client | a tela pede login em vários handlers; o estado local ainda existe | sim | sim |
| Exportar/importar JSON local | a página de configurações está atrás do layout autenticado na prática, porque sem user cai na landing | sim | sim |
| `leads.list`, `leads.exportAll` | 403 | 403 | sim |
| `contacts.list`, `contacts.exportAll` | 403 | 403 | sim |
| `contacts.changeEmail` | 403 | 403 | sim, e exige service role |
| `system.health` | sim | sim | sim |
| `system.notifyOwner` | 403 | 403 | sim |
| Menu Contatos | oculto | oculto | visível (`user.role === 'admin'`) |
| RLS no Postgres via SQL Editor do Supabase | policies existem no arquivo | o arquivo limita `pricing_data` ao e-mail de `auth.uid()` | o arquivo não cria policy de admin |

Mensagens: `UNAUTHED_ERR_MSG = 'Please login (10001)'`, `NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)'`. 🟢 `shared/const.ts`. O client redireciona para `/login` só quando a mensagem é exatamente a de não autenticado. 🟢 `main.tsx`.

## Como o admin nasce

No `createContext`, se o JWT é válido e `supabaseUser.email === ENV.adminEmail`, o upsert grava `role: 'admin'`. Não há comparação case-insensitive. 🟢 `context.ts` linha 26. 🟡 e-mails com caixa diferente não promovem.

Quem não é admin não envia `role` no upsert. Um admin antigo permanece admin. 🟢 ver máquina de estado.

## Isolamento do documento de preço

`savePricingData` / `loadPricingData` filtram por `ctx.user.email`. Não há parâmetro de "e-mail alvo" no input. Um user não lê o JSON de outro pelo tRPC. 🟢 `routers.ts` linhas 158–166.

O vínculo é e-mail, não `users.id` nem `supabaseId`. Trocar o e-mail no admin atualiza `users.email`, `pricing_data.ownerEmail` e, se existir, `leads.email`, com igualdade exata. 🟢 `updateUserEmail`. A listagem unificada compara e-mail com `LOWER(TRIM(...))`. 🟢 `getUnifiedContacts`. 🟡 um e-mail com espaço ou caixa diferente pode duplicar contato na lista e, ao mesmo tempo, não ser alcançado pelo `changeEmail`.

## RLS versus o processo Node

`drizzle/rls-policies.sql` liga RLS e cria policies. O servidor **não** usa o cliente Supabase para ler essas tabelas. Usa `postgres(DATABASE_URL)` + Drizzle. 🟢 `server/db.ts`.

No Supabase, a role `postgres` e a service role ignoram RLS. Se `DATABASE_URL` for essa role, as policies não protegem o caminho do Express. A autorização efetiva é a do tRPC. 🟡 a role exata da connection string não está no git. 🔴 confirmar no projeto Supabase qual role a URL usa.

O comentário do SQL diz que a service role cobre os procedimentos de admin. O código de admin usa Drizzle, não `supabaseAdmin`, exceto `auth.admin.updateUserById` na troca de e-mail. 🟢

Policies escritas:

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `pricing_data` | dono pelo e-mail de `auth.uid()` | idem | idem | nenhuma |
| `users` | `supabaseId = auth.uid()` | nenhuma para o user | nenhuma | nenhuma |
| `leads` | nenhuma para o user | `WITH CHECK (true)` | nenhuma | nenhuma |

Não há policy de DELETE. Pelo client Supabase, ninguém apaga. Pelo Node, não há função de apagar lead ou pricing no código de produto. 🟢

## Rate limit

Só `leads.register`. Janela 60s, máximo 5, chave = primeiro IP de `x-forwarded-for` ou `req.ip` ou `'unknown'`. Memória do processo. `setInterval` limpa chaves expiradas a cada 60s. 🟢 `server/_core/trpc.ts`.

Em várias instâncias serverless, cada uma conta sozinha. 🟡

## Dados que o user não deveria ver e o admin vê

A central de contatos junta lead, user e `_perfil` (WhatsApp, Instagram, especialidades). 🟢 `getUnifiedContacts`. Isso é dado pessoal de terceiros. Só o procedimento admin chega lá. O perfil também vai no backup JSON que o próprio profissional exporta de si. 🟢 `exportarDados` exporta `DadosPrecificacao`; o perfil é estado separado. 🟡 a página de configurações exporta `data`, não necessariamente `_perfil`. `Configuracoes.tsx` chama `exportarDados(data)`. O perfil fica de fora do arquivo. 🟢
