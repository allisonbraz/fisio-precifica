# Motor de preços, Tarefas de Implementação

## Pré-requisitos

- [ ] Tipos `DadosPrecificacao` e filhos disponíveis
- [ ] Nenhuma variável de ambiente

## Tarefas

- [ ] T-01, Implementar mensalização, somas de fixo, depreciação condicional, variável em três modos e reserva fixa ou percentual
  - Origem: `client/src/lib/calculations.ts:3-49`
  - Critério de pronto: testes de soma e de parcela ativa verdes
  - Confiança: 🟢

- [ ] T-02, Implementar viabilidade da meta, `dividirComProtecao` e os três preços, com `calcularPrecoMinimo` como alias
  - Origem: `client/src/lib/calculations.ts:72-129` e `183-187`
  - Critério de pronto: caso 100/0,60, cap × 10, meta inviável = 0, ordem piso < sustentável < estratégico
  - Confiança: 🟢

- [ ] T-03, Implementar simulação, lucros, margem em fração, ponto de equilíbrio e agenda
  - Origem: `client/src/lib/calculations.ts:131-199`
  - Critério de pronto: `viavel`, `Infinity` e o intervalo de 10 minutos
  - Confiança: 🟢

- [ ] T-04, Implementar preço de serviço e de plano sem ler `precoDefinido` nem `validade`
  - Origem: `client/src/lib/calculations.ts:152-158`
  - Critério de pronto: multiplicador + custo extra; desconto em pontos
  - Confiança: 🟢

- [ ] T-05, Portar alertas e rótulos de regime como política de UI, não como fórmula
  - Origem: `client/src/lib/alerts.ts`, `labels.ts`
  - Critério de pronto: os quatro alertas disparam nas condições do arquivo
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Happy path dos três preços
- [ ] TT-02, Meta inviável e meta zero
- [ ] TT-03, Denominador abaixo de 0,05
- [ ] TT-04, Reserva percentual sem circularidade
- [ ] TT-05, `por_sessao` ignora frequência anual

## Ordem Sugerida

1. T-01 antes de T-02, porque o preço só soma o que T-01 separou.
2. T-03 depois de T-02.
3. T-04 e T-05 podem seguir em paralelo.

## Lacunas Pendentes (🔴)

- Não inventar cálculo de aparelho auditivo.
- Não escolher entre alerta de 15% e `MARGIN_BANDS` sem resposta em `../questions.md`.
