# ADR-001 — JWT do Supabase no lugar do OAuth da plataforma anterior

- **Status:** aceito, já no código
- **Data inferida:** commit `2b724b6` (mensagem: replace Manus OAuth with Supabase Auth)
- **Confiança:** 🟢 o estado atual; 🟡 a data exata não foi relida do `git log` com timestamp nesta extração

## Contexto

O app nasceu acoplado a um OAuth de plataforma (Manus), com `users.openId`.

## Decisão

Conta é e-mail e senha no Supabase. O browser manda `Authorization: Bearer <access_token>`. O servidor chama `supabase.auth.getUser` e faz upsert em `users`.

## Consequências

- O CRM futuro, se também usar Supabase, reaproveita a sessão.
- Papel de admin ficou amarrado a `ADMIN_EMAIL`, não a uma tabela.
- Restou código Forge (`notification.ts`, `storage.ts`) da plataforma antiga.
