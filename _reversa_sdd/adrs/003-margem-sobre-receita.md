# ADR-003 — Margem sobre a receita, com percentuais no denominador

- **Status:** aceito
- **Evidência:** `dividirComProtecao` e a migração `margemLucro > 0.50` em `store.ts`. Stories 1.1–1.8 no commit `396c1ae` reformulam o modelo.
- **Confiança:** 🟢

## Contexto

Markup sobre o custo (`custo * (1 + m)` ou margem antiga capaz de passar de 1) não reserva imposto e comissão que incidem sobre o preço.

## Decisão

```
preco = base / (1 - imposto - variavelPercentual - reservaPercentual - margem)
```

com piso do denominador em 0,05, abaixo do qual o preço vira `base * 10`.

## Consequências

- A landing ainda mostra a versão sem imposto. Os dois números divergem de propósito ou por atraso. 🟡 intenção da divergência.
- `calcularPrecoMinimo` passou a significar o preço estratégico, não o piso. O nome antigo permanece por compatibilidade.
