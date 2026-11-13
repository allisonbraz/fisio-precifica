# ADR-004 — Cálculo no cliente, servidor só persiste

- **Status:** aceito
- **Evidência:** `calculations.ts` sem imports de IO; `pricing.save` grava o JSON que o client mandou, sem recalcular
- **Confiança:** 🟢

## Consequências

- Dá para extrair um pacote puro.
- O servidor não impede um client antigo de gravar um preço incoerente com a fórmula nova.
- Testes de Vitest no módulo puro são o oráculo. Não há recálculo de conferência na API.
