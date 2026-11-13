# Autenticação

## Visão Geral

A conta é Supabase Auth (e-mail e senha). O servidor confia no JWT Bearer e espelha o usuário em `users`. Admin é um e-mail de ambiente. 🟢

## Responsabilidades

- Criar sessão, encerrar sessão e pedir reset de senha.
- Anexar o access token em todo batch tRPC.
- Validar o token com `auth.getUser` e fazer upsert.
- Promover a admin quando o e-mail é exatamente `ADMIN_EMAIL`.
- Redirecionar para `/login` quando a API responde a mensagem de não autenticado.

## Regras de Negócio

- Sem Bearer, `ctx.user` é null. Procedimento protegido lança `UNAUTHORIZED` com `Please login (10001)`. 🟢
- Erro de validação vira user null, sem distinguir token expirado de rede caída. 🟢 `context.ts` catch.
- `loginMethod` gravado é sempre `"email"`, mesmo que o metadata diga outra coisa. 🟢
- Nome: `user_metadata.name`, senão o trecho do e-mail antes do `@`. 🟢
- Lead com o mesmo e-mail ganha `userId` nesse upsert. 🟢
- Logout no client chama `supabase.auth.signOut`, limpa o cache de `auth.me` e vai para `/login`. Limpar o localStorage depende de `preserveLocalData`. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|--------------------|
| RF-01 | Login e cadastro por e-mail e senha | Must | `Login.tsx` |
| RF-02 | Reset com redirect para a própria `/login` | Should | `resetPasswordForEmail` |
| RF-03 | Header Bearer | Must | `main.tsx` |
| RF-04 | Upsert por `supabaseId` | Must | `db.ts` |
| RF-05 | Admin por `ADMIN_EMAIL` | Must | `context.ts` |

## Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confiança |
|------|-----------|-----------|-----------|
| Segurança | Token não é decodificado à mão; a lib do Supabase valida | `context.ts:22` | 🟢 |
| Disponibilidade | Sem credencial, o client usa URL placeholder e a auth não funciona | `supabase.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado credenciais válidas
Quando o sign-in devolve sessão
Então a próxima chamada auth.me traz o usuário do banco

Dado sign-up sem sessão imediata
Quando a API do Supabase não devolve session
Então a UI pede para entrar em seguida e não navega para o painel

Dado um procedimento protegido sem header
Quando a chamada ocorre
Então o código é UNAUTHORIZED
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| JWT + upsert | Must | Toda gravação depende |
| Admin por env | Must | Única autorização elevada |
| Reset de senha | Should | Existe na tela |
| OAuth social | Won't | Não há provider no código |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `client/src/pages/Login.tsx` | `Login` | 🟢 |
| `client/src/lib/supabase.ts` | `supabase` | 🟢 |
| `client/src/_core/hooks/useAuth.ts` | `useAuth` | 🟢 |
| `server/_core/context.ts` | `createContext` | 🟢 |
| `server/_core/supabase.ts` | `supabase`, `supabaseAdmin` | 🟢 |
