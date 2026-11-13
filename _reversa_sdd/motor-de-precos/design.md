# Motor de preços, Design Técnico

A matemática normativa, com premissas e migrações, está em `../domain.md`. Um agente que reimplementar o módulo deve copiar aquelas igualdades e manter `calculations.test.ts` verde. Abaixo está a interface que esse módulo expõe hoje.

## Interface

| Símbolo | Assinatura resumida | Retorno |
|---------|---------------------|---------|
| `getValorMensal` | `({ valor, frequencia })` | number |
| `calcularTotalCustosOperacionais` | `(CustoFixo[])` | number |
| `calcularTotalDepreciacao` | `(CustoFixo[])` | number |
| `calcularTotalCustosFixos` | `(CustoFixo[])` | number |
| `calcularTotalReservas` | `(reservas, receita = 0)` | number |
| `calcularTotalReservasFixas` | `(reservas)` | number |
| `calcularPercentualReservasReceita` | `(reservas)` | fração |
| `calcularCustosVariaveisMensais` | `(CustoVariavel[])` | number |
| `calcularCustosVariaveisPorSessao` | `(CustoVariavel[])` | number |
| `calcularPercentualCustosVariaveis` | `(CustoVariavel[])` | fração |
| `calcularTotalCustosVariaveis` | `(custos, sessoes = 0, receita = 0)` | number |
| `calcularCustoOperacionalMensal` | `(data, preco = 0, sessoes = meta)` | number |
| `calcularCustoTotalMensal` | `(data, preco = precoDefinido)` | number |
| `calcularCustoFixoPorSessao` | `(data)` | number |
| `calcularCustoVariavelPorSessao` | `(data, preco = precoDefinido)` | number |
| `calcularReservaPorSessao` | `(data, preco = precoDefinido)` | number |
| `calcularCustoTotalPorSessao` | `(data, preco = precoDefinido)` | number |
| `calcularCustoOperacionalPorSessao` | `(data, preco = precoDefinido)` | number |
| `calcularPrecoPisoOperacional` | `(data)` | number |
| `calcularPrecoSustentavel` | `(data)` | number |
| `calcularPrecoEstrategico` | `(data)` | number |
| `calcularPrecoMinimo` | `(data)` | alias do estratégico |
| `calcularMargemDoPreco` | `(data, preco)` | fração |
| `calcularLucroOperacional` | `(data, preco)` | number |
| `calcularLucroDisponivel` | `(data, preco)` | number |
| `calcularPercentualReservas` | `(data, preco)` | 0–100, ou 0 se lucro ≤ 0 |
| `calcularPrecoServico` | `(data, servico)` | number |
| `calcularPrecoPlano` | `(precoUnitario, plano)` | number |
| `simularPreco` | `(data, preco)` | struct; `margem` em pontos percentuais |
| `calcularPontoEquilibrio` | `(data, preco)` | inteiro ou `Infinity` |
| `metaDeSessoesEhViavel` | `(data)` | boolean |
| `calcularCapacidadeMaxima` | `(data)` | number |
| `calcularTaxaOcupacao` | `(data)` | pontos percentuais |
| `calcularValorHora` | `(data, preco, duracao?)` | number |
| `calcularHorasTrabalhadas` | `(data)` | number |
| `sugerirSessoesPorDia` | `(horas, duracaoMinutos)` | inteiro |
| `gerarAlertas` | `(data, preco)` | lista |
| `useMetrics` | `(data)` | hook React; não entra no pacote puro |

`componentes` e `dividirComProtecao` são internas. 🟢

## Fluxo Principal

1. Quem chama entrega um `DadosPrecificacao` já migrado (`store.loadData` ou o merge do `DataContext`).
2. Se a meta não cabe na agenda, piso, sustentável e estratégico devolvem 0.
3. A base do estratégico soma fixos, variáveis mensais e reservas fixas, divide pelas sessões e soma o variável unitário.
4. O denominador é `1 - imposto - percentual variável - percentual de reserva - margem`.
5. Se o denominador é maior que 0,05, divide. Senão, multiplica a base por 10.
6. Serviço = estratégico × multiplicador + custo adicional. Plano = unitário × sessões × (1 − desconto/100).

## Fluxos Alternativos

- **Simulação:** não usa o denominador invertido. Aplica o preço dado sobre a meta, mesmo que a meta seja inviável para os preços de tabela. O ponto de equilíbrio também não consulta a viabilidade.
- **Painel:** `useMetrics` finge que o preço praticado é o estratégico.
- **Landing:** não chama este módulo.

## Dependências

- Só `types.ts` para o núcleo.
- `alerts.ts` formata moeda com `formatters.ts`.
- `useMetrics` depende de React.

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Sem IO | arquivo não importa rede nem React | 🟢 |
| Margem no denominador | linhas 117–123 | 🟢 |
| Nome legado `calcularPrecoMinimo` | linhas 126–129 | 🟢 |

## Estado Interno

Nenhum. 🟢

## Observabilidade

Nenhum log no motor. 🟢

## Riscos e Lacunas

- 🔴 Não há `calcularPrecoVendaAparelho`. Não acrescentar aqui até existir o módulo `produtos`.
- 🟡 Duas funções de margem usam escalas diferentes. Ver `../domain.md`.
