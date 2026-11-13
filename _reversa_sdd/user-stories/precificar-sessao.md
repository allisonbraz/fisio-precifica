# Precificar a sessão

Como fisioterapeuta autenticado, quero informar custos, agenda, imposto e margem para obter piso, sustentável e estratégico, e gravar o preço que vou praticar.

## Critérios

```gherkin
Dado um documento com meta de sessões que cabe na agenda
E custos fixos mensalizados maiores que zero
Quando o motor calcula os três preços com margem maior que zero e sem percentuais que estourem o denominador
Então o piso é menor que o sustentável
E o sustentável é menor que o estratégico

Dado a meta acima de dias úteis vezes sessões por dia
Quando alguém pede o preço estratégico
Então o resultado é 0

Dado um preço praticado que deixa lucro disponível negativo
Quando a simulação roda
Então viavel é falso
```

Rastreio: `motor-de-precos/`. 🟢
