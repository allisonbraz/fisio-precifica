# Regras de negócio no banco

Quase nenhuma regra de preço mora no Postgres. O banco garante forma bruta e unicidade. 🟢

| Regra | Onde | Confiança |
|-------|------|-----------|
| Um documento de preço por `ownerEmail` | unique | 🟢 |
| Um lead por `email` | unique index | 🟢 |
| Papel só `user` ou `admin` | enum | 🟢 |
| `supabaseId` único | unique | 🟢 no schema atual |
| Lead pode existir sem user | FK nula | 🟢 |
| RLS descrito em `rls-policies.sql` | arquivo à parte, não está na pasta de migrations do Drizzle journal como passo automático | 🟡 se produção já aplicou o arquivo |
| Sem check de valor ≥ 0 | — | 🟢 ausência; quem barra é o Zod |
| Sem trigger de `updatedAt` | o app seta na aplicação | 🟢 |

## Procedures

Não há stored procedure, function SQL de negócio, view nem materialized view no repositório. 🟢

A query de contatos unificados é SQL montado em `db.ts`, não um objeto do banco.
