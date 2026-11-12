# Motor de preços

## Visão Geral

Funções puras que transformam um documento de precificação em preços de sessão, de serviço e de plano, mais lucro, ponto de equilíbrio e alertas. É o núcleo que o CRM de clínica e o pacote `pricing-engine` precisam preservar. 🟢

## Responsabilidades

- Mensalizar custos anuais.
- Separar custo operacional, depreciação elegível, variável e reserva.
- Recusar preço de tabela quando a meta de sessões não cabe na agenda.
- Calcular piso, sustentável e estratégico com percentuais no denominador.
- Simular um preço já escolhido e dizer se o lucro disponível é não negativo.
- Derivar preço de serviço e de plano a partir do estratégico.
- Emitir alertas de parcela, reserva e margem.

## Regras de Negócio

- A especificação normativa de cada igualdade está em `../domain.md`. Este arquivo não redefine número. 🟢
- `calcularPrecoMinimo` devolve o estratégico. 🟢
- Depreciação com `temParcelaAtiva` não soma. 🟢
- Denominador `<= 0,05` produz `base * 10`, não uma divisão. 🟢
- Margem, imposto e percentuais de custo/reserva são frações. Desconto de plano é 0–100. 🟢
- Não há preço de aparelho neste módulo. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|--------------------|
| RF-01 | Calcular os três preços | Must | Testes de ordem e do caso 100/0,60 |
| RF-02 | Devolver 0 se a meta é inviável | Must | Meta acima da capacidade |
| RF-03 | Simular lucro e viabilidade | Must | Preço baixo → `viavel` falso |
| RF-04 | Ponto de equilíbrio com `ceil` ou `Infinity` | Must | Contribuição ≤ 0 |
| RF-05 | Preço de serviço e plano | Must | Multiplicador, custo extra, desconto |
| RF-06 | Sugestão de sessões com intervalo de 10 min só entre sessões | Should | Teste do +10 no numerador |
| RF-07 | Alertas | Should | Textos e limiar de 15% |
| RF-08 | Métricas do painel ancoradas no estratégico | Should | `useMetrics` não lê `precoDefinido` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência | Confiança |
|------|--------------------|-----------|-----------|
| Performance | Cálculo síncrono em memória, sem IO | `calculations.ts` sem import de rede | 🟢 |
| Segurança | Nenhuma. Quem chama é a UI | ausência de checagem de papel | 🟢 |

## Critérios de Aceitação

```gherkin
Dado fixos de 1000, 10 sessões, imposto 0,10, reserva percentual 0,10 e margem 0,20
Quando calculo o preço mínimo
Então o valor é 100 / 0,60

Dado margem 0,50 e imposto 0,50 no cenário do teste de safety cap
Quando calculo o preço mínimo
Então o valor é o custo por sessão vezes 10

Dado sessoesMeta 0
Quando calculo o preço mínimo
Então o valor é 0
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Três preços e simulação | Must | Todo o produto chama isso |
| Serviços e planos | Must | Tela de serviços |
| Alertas e rótulos de faixa | Should | UI; a fórmula não depende |
| Landing simplificada | Won't | Não faz parte deste módulo |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `client/src/lib/calculations.ts` | funções exportadas | 🟢 |
| `client/src/lib/types.ts` | `DadosPrecificacao` e filhos | 🟢 |
| `client/src/lib/alerts.ts` | `gerarAlertas` | 🟢 |
| `client/src/lib/useMetrics.ts` | `useMetrics` | 🟢 |
| `client/src/lib/labels.ts` | regimes e faixas | 🟢 |
