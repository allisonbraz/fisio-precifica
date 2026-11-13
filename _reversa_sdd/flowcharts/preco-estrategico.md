# Fluxo do preço estratégico

```mermaid
flowchart TD
  start[Documento DadosPrecificacao] --> cap[capacidade = max dias,0 vezes max sessoes por dia,0]
  cap --> viavel{meta maior que 0 e menor ou igual a capacidade?}
  viavel -->|nao| zero[devolve 0]
  viavel -->|sim| comp[separa fixos, variavel mensal, unitario, percentuais e reservas fixas]
  comp --> base["base = (fixos + variaveis mensais + reservas fixas) / sessoes + unitario"]
  base --> den["divisor = 1 - imposto - pct variavel - pct reserva - margem"]
  den --> prot{divisor maior que 0,05?}
  prot -->|sim| div[preco = base / divisor]
  prot -->|nao| cap10[preco = base vezes 10]
```

O piso usa a mesma proteção, com base sem reservas fixas e denominador sem reserva e sem margem. O sustentável é o estratégico com margem 0. 🟢 `calculations.ts`.

Números de referência travados por teste:

- Fixo mensal 1000, 10 sessões, imposto 0,10, reserva percentual 0,10, margem 0,20, sem variável → estratégico = 100 / 0,60.
- Margem 0,50 e imposto 0,50 → denominador estoura o limiar → preço = custo por sessão × 10, no cenário do teste em que o custo por sessão equivale à base.
