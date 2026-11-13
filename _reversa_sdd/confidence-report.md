# Relatório de confiança

> Reviewer, sobre a extração de 2026-11-12. Método Reversa aplicado manualmente (ver `README.md`). Nível `completo`. Não houve suíte de regressão `_reversa_forward/`: primeira extração, passo de regressão semântica fica silencioso, como o orquestrador prevê.

## Contagem qualitativa

Não há um linter de marcas no repositório. A contagem abaixo é a leitura humana das marcas escritas nos artefatos, não um parse automático. 🟡 a soma exata; 🟢 a distribuição.

| Marca | Onde se concentra | Leitura |
|-------|-------------------|---------|
| 🟢 CONFIRMADO | Fórmulas, rotas, schema, sync, telas, falha de lint de outubro/2026 | A maior parte do contrato de preço e da API |
| 🟡 INFERIDO | Papel da connection string, intenção da landing divergente, effectivo do rate limit na Vercel, sugestão híbrida do Scout vs feature gravada | Não bloqueia reimplementar o motor |
| 🔴 LACUNA | Estado real do Postgres, `schemaVersion`, LGPD do consentimento, rateio multi-profissional, desenho do módulo `produtos`, logs de CI de julho | Listadas em `questions.md` |

Veredito: **dá para um agente reimplementar o motor e o sync a partir destes arquivos**, desde que não invente resposta para os itens 🔴. Não dá para afirmar que o banco de produção já está no formato do `schema.ts`.

## Checagens do reviewer

| Checagem | Resultado |
|----------|-----------|
| Fórmula do estratégico cita denominador e cap 0,05 | ok, `domain.md` e testes |
| `calcularPrecoMinimo` = estratégico, não piso | ok |
| Três preços devolvem 0 se a meta não cabe | ok |
| Auth é Bearer Supabase, não cookie de sessão própria | ok |
| Posse do JSON é e-mail | ok |
| fono `calcularPrecoVendaAparelho` não foi especificada como se existisse aqui | ok, só como módulo futuro |
| Código do app não foi alterado por esta extração | ok, só `_reversa_sdd/` |

## Próximos passos sugeridos pelo framework

- `/reversa-forward` quando for a hora de extrair o pacote ou encaixar no CRM, usando `extracao-pricing-engine/` como delta, não como licença para mudar o app agora.
- `/reversa-docs` se quiserem o mini-site HTML. Não foi gerado: a encomenda pede os contratos em markdown.
- Responder `questions.md` antes de gravar `schemaVersion` ou de aplicar a migração 0001.
