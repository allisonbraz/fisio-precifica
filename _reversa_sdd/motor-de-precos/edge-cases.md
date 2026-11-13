# Motor de preços — casos de borda

`doc_level` completo não exige este arquivo. Ele existe porque a fórmula tem mais de dois limites que um agente erra fácil. Normativo continua sendo `../domain.md`.

| Caso | Resultado | Confiança |
|------|-----------|-----------|
| `sessoesMeta` 0 | preços de tabela 0; variável por sessão ainda devolve o unitário | 🟢 |
| Meta acima da capacidade | preços de tabela 0 | 🟢 |
| `diasUteis` ou `sessoesporDia` negativos | capacidade trata como 0 via `Math.max` | 🟢 |
| Denominador ≤ 0,05 | `base * 10` | 🟢 |
| `preco` 0 ou negativo em `calcularMargemDoPreco` | 0 | 🟢 |
| Lucro operacional ≤ 0 em `calcularPercentualReservas` | 0, não um percentual negativo | 🟢 |
| Contribuição ≤ 0 no ponto de equilíbrio | `Infinity` | 🟢 |
| Duração 0 no valor-hora | 0 | 🟢 |
| `por_sessao` anual | não divide por 12 | 🟢 |
| Depreciação com parcela | fora da soma | 🟢 |
| `viavel` com lucro disponível 0 | verdadeiro | 🟢 |
| Desconto de plano 100 | preço do plano 0 | 🟢 a fórmula; 🟡 se a UI deixa digitar 100 (o Zod deixa) |
| Multiplicador 0 | preço do serviço = só `custoAdicional` | 🟢 |
