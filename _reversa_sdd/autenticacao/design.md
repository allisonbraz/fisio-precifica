# Autenticação, Design Técnico

## Interface

| Peça | Entrada | Saída |
|------|---------|-------|
| `signInWithPassword` | email, password | sessão ou erro |
| `signUp` | email, password, `data.name` | sessão ou usuário pendente |
| `resetPasswordForEmail` | email, redirect origin + `/login` | erro ou sucesso |
| `getSession` | — | access_token para o header `authorization` |
| `createContext` | header Bearer | `user` ou null |
| `auth.me` | contexto | o user |

Senha mínima na UI: 6 caracteres. A política real pode ser mais estrita no projeto Supabase, fora do git. 🟡

## Fluxo Principal

1. Formulário chama o Supabase direto, sem passar pela API própria.
2. Com sessão, invalida `auth.me`.
3. O batch seguinte manda o JWT.
4. O servidor valida, faz upsert, devolve a linha.

## Fluxos Alternativos

- **Mensagem `Invalid login`:** toast "E-mail ou senha incorretos".
- **Mensagem `already registered`:** volta o modo para login.
- **Placeholder de URL:** `http://127.0.0.1:54321` e chave `local-anon-key` se o env não existe. Chamadas não autenticam. 🟢

## Dependências

- Supabase Auth.
- Tabela `users`.
- `ADMIN_EMAIL`.

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Sem cookie de sessão do Express | header lido no client a cada batch | 🟢 |
| Service role só para trocar e-mail | `supabaseAdmin` | 🟢 |
| Papel não é rebaixado | `upsertUser` condicional | 🟢 |

## Estado Interno

Sessão fica no storage default do supabase-js (localStorage da lib). 🟡 a lib usa esse default; o código não passa `auth.persistSession: false`.

## Observabilidade

Warn `[Supabase] Sem credenciais configuradas` no client e no servidor. 🟢

## Riscos e Lacunas

- 🔴 Confirmação de e-mail é configuração do projeto Supabase, invisível aqui.
- 🟡 Comparação de admin é case-sensitive.
