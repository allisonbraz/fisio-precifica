# Relacionamentos

| De | Para | Cardinalidade | Implementação | Confiança |
|----|------|---------------|---------------|-----------|
| leads.userId | users.id | N:1 opcional | FK Drizzle / SQL 0000 | 🟢 |
| users.email | leads.email | emparelhamento lógico | `UPDATE leads SET userId` quando o e-mail do login coincide, igualdade exata | 🟢 |
| users.email | pricing_data.ownerEmail | 1:1 lógico | sem FK. Unique em `ownerEmail`. Não há unique em `users.email` | 🟢 |
| pricing_data.data.planosTratamento.tipoServicoId | tiposServico.id | N:1 lógico | string dentro do JSON | 🟢 |
| registro.servicosVendidos.tipoServicoId | tiposServico.id | N:1 lógico | string | 🟢 |
| registro.planosVendidos.planoTratamentoId | planosTratamento.id | N:1 lógico | string | 🟢 |

Ao trocar e-mail (`updateUserEmail`), as três pontas lógicas são atualizadas em sequência, sem transação explícita no código. Se o segundo update falhar, o Auth do Supabase já pode ter o e-mail novo e o Postgres o antigo, ou o contrário. 🟢 não há `db.transaction` nesse método. 🔴 o que fazer no retry.

`createLead` no conflito não preenche `userId`. O vínculo espera um login posterior. 🟢
