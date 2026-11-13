# Dicionário de dados

> Data Master. Fontes: `drizzle/schema.ts`, `drizzle/0000_spooky_malice.sql`, `drizzle/0001_align_supabase_users.sql` (não executada), `drizzle/rls-policies.sql`, `client/src/lib/types.ts`.

Não há trigger, view, procedure nem check constraint de negócio. 🟢 os SQL do repositório.

## `users`

Espelho da conta Supabase. A migração 0000 criou `openId varchar(64)`. O schema atual chama `supabaseId uuid`. O arquivo 0001 reconcilia isso e avisa para não rodar `pnpm db:push` às cegas. 🟢

| Coluna | Tipo | Nulo | Default | Notas |
|--------|------|------|---------|-------|
| id | serial | não | sequence | PK |
| supabaseId | uuid | não | — | UK. No banco antigo pode ainda ser `openId` varchar. 🔴 conferir information_schema |
| name | text | sim | — | metadata `name` ou prefixo do e-mail |
| email | varchar(320) | sim | — | índice `idx_users_email`. Não é unique no schema |
| whatsapp | varchar(30) | sim | — | a UI grava WhatsApp no `_perfil`, não nesta coluna. 🟢 nenhum update de `users.whatsapp` no app |
| loginMethod | varchar(64) | sim | `'email'` no schema atual; 0000 não tinha default | sempre `"email"` no upsert |
| source | varchar(100) | sim | `'supabase'` no schema; `'oauth'` na 0000 | upsert força `'supabase'` |
| role | enum role | não | `'user'` | `user` \| `admin` |
| createdAt | timestamp | não | now() | |
| updatedAt | timestamp | não | now() | o upsert de login **não** atualiza `updatedAt`, só os campos enviados. 🟢 `db.ts` |
| lastSignedIn | timestamp | não | now() | atualizado a cada request autenticada |

## `leads`

| Coluna | Tipo | Nulo | Default | Notas |
|--------|------|------|---------|-------|
| id | serial | não | | PK |
| nome | varchar(255) | não | | mínimo 2 no Zod |
| email | varchar(320) | não | | unique index `idx_leads_email` |
| whatsapp | varchar(30) | não | | mínimo 8 no Zod |
| ip | varchar(45) | sim | | primeiro hop de `x-forwarded-for` |
| userAgent | text | sim | | header cru |
| source | varchar(100) | sim | `'banner'` | o register sempre manda `'banner'` |
| userId | integer | sim | | FK `users.id`. Sem `ON DELETE` especial (no action) |
| createdAt | timestamp | não | now() | índice `idx_leads_created_at` |

`marketingConsent` não é coluna. 🟢

## `pricing_data`

| Coluna | Tipo | Nulo | Default | Notas |
|--------|------|------|---------|-------|
| id | serial | não | | PK |
| ownerEmail | varchar(320) | não | | unique. É a chave de posse |
| data | jsonb | não | | documento abaixo |
| createdAt | timestamp | não | now() | não muda no upsert |
| updatedAt | timestamp | não | now() | `new Date()` no conflito |

### Chaves de `data` (json)

| Chave | Tipo | Obrigatória no save | Notas |
|-------|------|---------------------|-------|
| custosFixos | CustoFixo[] | não (optional no Zod) | |
| custosVariaveis | CustoVariavel[] | não | |
| reservasEstrategicas | ReservaEstrategica[] | não | |
| sessoesMeta | number ≥ 0 | não | |
| margemLucro | number 0–1 | não | |
| impostoPercentual | number 0–1 | não | |
| precoDefinido | number ≥ 0 | não | |
| horasTrabalho, diasUteis, sessoesporDia, duracaoPadraoMinutos | number ≥ 0 | não | |
| regimeTributario | enum sem `mei` | não | |
| etapasConcluidas | objeto de booleanos | não | |
| tiposServico | TipoServico[] | não | |
| planosTratamento | Plano[] | não | `quantidadeSessoes` ≥ 1, desconto 0–100, validade ≥ 1 |
| registrosMensais | Registro[] | não | |
| _perfil | Perfil parcial | não | ver campos em `PerfilProfissional` |
| outras | qualquer, por passthrough | | 🟡 não há lista branca fechada |

### `CustoFixo`

| Campo | Tipo |
|-------|------|
| id, nome | string |
| valor | number ≥ 0 |
| frequencia | `mensal` \| `anual` |
| observacao, descricao | string, default `''` |
| temParcelaAtiva, isDepreciacao | boolean opcional |

### `CustoVariavel`

Igual ao fixo, mais `modo` opcional `mensal` \| `por_sessao` \| `percentual_receita` e `percentual` 0–1.

### `ReservaEstrategica`

`id`, `nome`, `valor` ≥ 0, `frequencia`, `descricao`, `modo` opcional `fixo` \| `percentual`, `percentual` 0–1.

### `TipoServico`

`id`, `nome`, `duracaoMinutos` ≥ 0, `custoAdicional` ≥ 0, `multiplicadorPreco` ≥ 0, `descricao`.

### `PlanoTratamento`

`id`, `nome`, `tipoServicoId`, `quantidadeSessoes` ≥ 1, `descontoPercentual` 0–100, `validade` ≥ 1.

### `RegistroMensal`

`id`, `mes` string (a UI usa o mês; o formato exato não é validado além de string), quantidades e receitas ≥ 0, `observacoes`, `tipo` opcional `simples` \| `completo`, arrays opcionais de vendidos.

### `PerfilProfissional` / `_perfil`

Todos string: `nome`, `cidade`, `endereco`, `crefito`, `especialidades`, `logoUrl`, `whatsapp`, `instagram`, `cpfCnpj`, `nomeEmpresa`, `site`, `outraRedeSocial`. No save, cada um é optional (partial).

## LocalStorage (não é tabela, é o outro banco)

| Chave | Conteúdo |
|-------|----------|
| `fisioprecifica_data` | `DadosPrecificacao` |
| `fisioprecifica_perfil` | perfil |
| `fisioprecifica_lead` | lead local legado |
| `fisioprecifica_leads_list` | lista local de leads, não é a tabela `leads` |
| `fisioprecifica_onboarding_complete` | `'true'` |
| `fisio_precifica_sync_pending` | `'1'` |
| `fisio_precifica_local_cleared` | sessionStorage `'1'` |
