# ADR-002 — Postgres e um jsonb por profissional

- **Status:** aceito
- **Evidência:** commit `977ef24` (MySQL → PostgreSQL/Supabase) e `pricing_data.data`
- **Confiança:** 🟢

## Contexto

Custos, serviços e registros mudaram de forma várias vezes (markup → margem, pacotes → planos, MEI removido).

## Decisão

Três tabelas relacionais para identidade e lead. O trabalho de precificação inteiro vai num jsonb substituído por completo a cada save.

## Alternativa que o código não tomou

Tabelas `custos`, `servicos`, `registros` com FK para o user. Isso facilitaria relatório cross-clínica e dificultaria as migrações que hoje vivem em `loadData`.

## Consequências

- O motor recebe um objeto, não um grafo SQL.
- Conflito de duas abas é last-write-wins. Não há versão.
- Extrair o pacote não exige extrair o schema.
