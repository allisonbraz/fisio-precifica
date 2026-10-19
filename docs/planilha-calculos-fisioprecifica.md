# Planilha de Cálculos — FisioPrecifica

Este modelo reúne todas as contas utilizadas pelo FisioPrecifica para precificar sessões, avaliar a operação mensal e formar preços de serviços e pacotes.

> **Convenção:** percentuais devem ser inseridos no formato decimal nas fórmulas (por exemplo, 6% = `0,06`). A alíquota tributária é uma estimativa e deve ser validada com o contador.

## 1. Dados operacionais

| Campo | Símbolo | Como preencher | Cálculo / uso |
|---|---:|---|---|
| Dias úteis por mês | `D` | Número de dias de atendimento | Base para capacidade e horas mensais |
| Horas de trabalho por dia | `H` | Horas efetivamente disponíveis | `Horas mensais = D × H` |
| Duração padrão da sessão (min) | `T` | Duração média de uma sessão | Base para valor-hora e sugestão de agenda |
| Sessões por dia | `SPD` | Quantidade possível por dia | `Capacidade máxima = D × SPD` |
| Meta de sessões por mês | `S` | Sessões que se pretende realizar | Base de rateio de custos e formação de preço |
| Alíquota efetiva de impostos | `I` | Percentual sobre faturamento | Entra no denominador dos preços e na DRE |
| Margem de lucro desejada | `M` | Percentual da receita | Entra somente no preço estratégico |
| Preço em análise por sessão | `P` | Preço atual ou cenário | Usado na simulação mensal |

### Contas operacionais

```text
Horas trabalhadas no mês = D × H
Capacidade máxima mensal = D × SPD
Taxa de ocupação = S ÷ Capacidade máxima mensal
Valor-hora = P ÷ T × 60
Sugestão de sessões por dia = ARREDONDAR.PARA.BAIXO((H × 60) ÷ (T + 10); 0)
```

O intervalo adicional de 10 minutos na sugestão de agenda representa a margem entre atendimentos usada pelo aplicativo.

---

## 2. Custos fixos e depreciação

Cadastre uma linha para cada item: aluguel, salários, pró-labore, softwares, conselho profissional, seguro, equipamentos etc.

| Item | Valor informado | Frequência | É depreciação? | Tem parcela ativa? | Valor mensal calculado |
|---|---:|---|---|---|---:|
| Exemplo: aluguel | R$ 0,00 | Mensal ou anual | Sim/Não | Sim/Não | Fórmula abaixo |

```text
Valor mensal do item =
  se frequência = anual: Valor informado ÷ 12
  se frequência = mensal: Valor informado

Custos operacionais fixos = soma dos itens que não são depreciação
Depreciação mensal = soma dos itens de depreciação sem parcela ativa
Custos fixos totais (F) = Custos operacionais fixos + Depreciação mensal
Custo fixo por sessão = F ÷ S
```

Itens de depreciação que ainda possuem parcela ativa não são somados à depreciação pelo modelo atual, evitando dupla contagem.

---

## 3. Custos variáveis

Cadastre cada custo usando somente uma das três bases abaixo.

| Item | Base de cálculo | Valor / percentual | Fórmula mensal |
|---|---|---:|---|
| Material, comissão fixa etc. | Mensal ou anual | `CVm` | Mensal: valor; anual: valor ÷ 12 |
| Material por atendimento | Por sessão | `CVu` | `CVu × S` |
| Taxa de cartão, comissão percentual etc. | % da receita | `CVp` | `CVp × Receita mensal` |

```text
Custos variáveis mensais fixos (VM) = soma dos itens na base mensal/anual
Custo variável unitário (VU) = soma dos itens na base por sessão
Percentual variável sobre receita (VP) = soma dos percentuais dos itens na base % da receita

Custos variáveis totais no cenário = VM + (VU × S) + (VP × Receita mensal)
Custo variável por sessão no cenário = Custos variáveis totais ÷ S
```

Não inclua impostos sobre faturamento nesta seção: eles são calculados separadamente pela alíquota `I`.

---

## 4. Reservas estratégicas

Cadastre reservas de emergência, férias, 13º equivalente, substituição, investimento e outras. Cada uma pode ser fixa ou percentual da receita.

| Reserva | Modo | Valor / percentual | Fórmula mensal |
|---|---|---:|---|
| Emergência | Fixo mensal/anual | `RF` | Mensal: valor; anual: valor ÷ 12 |
| Férias + 1/3 | Fixo sugerido | — | `Pró-labore ÷ 12 × 1,33` |
| 13º equivalente | Fixo sugerido | — | `Pró-labore ÷ 12` |
| Investimento | % da receita | `RP` | `RP × Receita mensal` |

```text
Reservas fixas mensais (RF) = soma das reservas em valor
Percentual de reservas sobre receita (RP) = soma das reservas percentuais
Reservas totais no cenário = RF + (RP × Receita mensal)
Reserva por sessão = Reservas totais ÷ S
```

Como orientação do produto, reservas abaixo de 15% da receita pedem atenção; a referência indicada é 20% a 27%. Acima de 35%, revise a competitividade do preço resultante.

---

## 5. Formação dos preços de referência

Antes das fórmulas, defina:

```text
Base operacional por sessão = ((F + VM) ÷ S) + VU
Base sustentável por sessão = ((F + VM + RF) ÷ S) + VU
```

| Referência | O que cobre | Fórmula |
|---|---|---|
| Piso operacional | Custos obrigatórios, variáveis e impostos; sem reservas e sem lucro | `Base operacional ÷ (1 − I − VP)` |
| Preço sustentável | Operação, impostos e reservas; sem margem de lucro | `Base sustentável ÷ (1 − I − VP − RP)` |
| Preço estratégico | Operação, impostos, reservas e margem desejada | `Base sustentável ÷ (1 − I − VP − RP − M)` |

O preço estratégico é o preço mínimo histórico do aplicativo. A margem é sempre calculada sobre a receita, não como markup sobre custo.

### Proteção para percentuais inviáveis

Se o denominador de qualquer fórmula de preço for menor ou igual a `0,05`, o modelo aplica a seguinte proteção:

```text
Preço protegido = Base × 10
```

Revise impostos, taxas variáveis, reservas percentuais e margem quando isso ocorrer.

---

## 6. Simulação mensal de preço

Para qualquer preço em análise `P`:

```text
Receita mensal = P × S
Impostos = Receita mensal × I
Custo operacional mensal = F + VM + (VU × S) + (VP × Receita mensal)
Reservas mensais = RF + (RP × Receita mensal)
Custo total mensal = Custo operacional mensal + Reservas mensais
Lucro operacional = Receita mensal − Impostos − Custo operacional mensal
Lucro disponível = Lucro operacional − Reservas mensais
Margem disponível = Lucro disponível ÷ Receita mensal
Viabilidade = Lucro disponível ≥ 0
```

### Leitura por sessão

```text
Imposto por sessão = P × I
Custo operacional por sessão = (F ÷ S) + (VM ÷ S) + VU + (VP × P)
Custo total por sessão = Custo operacional por sessão + (RF ÷ S) + (RP × P)
Lucro disponível por sessão = P − Imposto por sessão − Custo total por sessão
```

---

## 7. Ponto de equilíbrio

O ponto de equilíbrio indica quantas sessões são necessárias para cobrir custos, impostos e reservas no preço analisado `P`.

```text
Custos fixos para equilíbrio = F + VM + RF
Margem de contribuição por sessão = [P × (1 − I − VP − RP)] − VU
Ponto de equilíbrio (sessões) = ARREDONDAR.PARA.CIMA(
  Custos fixos para equilíbrio ÷ Margem de contribuição por sessão;
  0
)
```

Se a margem de contribuição for zero ou negativa, não há ponto de equilíbrio viável naquele preço.

---

## 8. Preço por serviço e por plano

| Cálculo | Fórmula |
|---|---|
| Preço de serviço específico | `Preço estratégico × multiplicador do serviço + custo adicional` |
| Preço cheio do plano | `Preço unitário × quantidade de sessões` |
| Preço final do plano | `Preço unitário × quantidade de sessões × (1 − desconto percentual)` |

Exemplo: se o preço unitário for R$ 150,00, um plano de 10 sessões com 10% de desconto será `150 × 10 × (1 − 0,10) = R$ 1.350,00`.

---

## 9. Registro mensal para acompanhamento

Para cada mês, registre:

| Mês | Sessões realizadas | Receita total | Custos fixos | Custos variáveis | Lucro | Ticket médio | Observações |
|---|---:|---:|---:|---:|---:|---:|---|
| AAAA-MM | 0 | R$ 0,00 | R$ 0,00 | R$ 0,00 | Fórmula | Fórmula | — |

```text
Custos totais do mês = Custos fixos + Custos variáveis
Lucro do mês = Receita total − Custos totais do mês
Ticket médio = Receita total ÷ Sessões realizadas
```

> Este material reproduz as fórmulas presentes em `client/src/lib/calculations.ts` do FisioPrecifica. Ele é educacional e não substitui orientação contábil ou fiscal profissional.
