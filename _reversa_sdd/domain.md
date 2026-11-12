# Domínio e regras de preço

> Detective. Fonte canônica da matemática: `client/src/lib/calculations.ts`. Tipos: `client/src/lib/types.ts`. Catálogo e migração local: `client/src/lib/store.ts`. Rótulos de regime: `client/src/lib/labels.ts`. Testes que travam o comportamento: `client/src/lib/calculations.test.ts`.

Toda fórmula abaixo está 🟢 no arquivo citado, salvo marca contrária.

## Glossário

| Termo | Significado no código | Unidade |
|-------|----------------------|---------|
| Sessão | Unidade de atendimento que se precifica | 1 |
| `sessoesMeta` | Quantas sessões o profissional pretende realizar no mês | inteiro ≥ 0 |
| `precoDefinido` | Preço que a pessoa decidiu praticar | R$ por sessão |
| Preço estratégico | Preço calculado que cobre custos, reservas, imposto e margem. `calcularPrecoMinimo` é alias dele | R$ por sessão |
| Piso operacional | Cobre custos obrigatórios e tributos. Sem reserva e sem lucro | R$ |
| Preço sustentável | Piso mais as reservas planejadas. Ainda sem margem | R$ |
| `margemLucro` | Fração da **receita** que deve sobrar depois de custos, reservas e imposto | 0 a 1, não "por cento" |
| `impostoPercentual` | Alíquota efetiva única sobre a receita bruta | 0 a 1 |
| `percentual` de custo variável ou reserva | Fração da receita bruta | 0 a 1 |
| `descontoPercentual` do plano | Desconto sobre o total do pacote | 0 a 100 |
| Receita bruta do mês | `preco * sessoesMeta` | R$ |
| Lucro operacional | Receita − imposto − custo operacional. Reservas ainda não saíram | R$ |
| Lucro disponível | Lucro operacional − reservas | R$ |
| Custo operacional | Fixos (incluindo depreciação elegível) + variáveis. Sem reservas | R$ |
| Depreciação | Linha de custo fixo com `isDepreciacao`. O app **não** divide valor do bem por vida útil; a pessoa informa o valor já mensal ou anual | R$ |
| Parcela ativa | `temParcelaAtiva` numa depreciação. Enquanto true e o item for depreciação, o valor **não entra** no total | flag |
| Capacidade | `diasUteis * sessoesporDia` | sessões/mês |
| Ocupação | `sessoesMeta / capacidade * 100` | 0 a 100+ |
| Regime | Rótulo (`simples`, `presumido`, `autonomo`, `personalizado`). Não calcula imposto sozinho; só sugere alíquota na UI | enum |
| Perfil profissional | Cartão da clínica, campo `_perfil` no JSON, fora de `DadosPrecificacao` | objeto |

`horasTrabalho` entra na sugestão de sessões por dia e em `calcularHorasTrabalhadas`. **Não entra no preço.** 🟢 `calculations.ts` `componentes()` não lê horas.

## Unidades que um agente não pode misturar

1. Imposto, margem, reserva percentual e custo variável percentual são frações. `0.06` é 6%. 🟢 Zod limita a `max(1)` em `server/routers.ts`.
2. Desconto de plano e a margem exibida em `simularPreco().margem` são pontos percentuais (0–100). 🟢
3. `calcularMargemDoPreco` devolve **fração** (lucro disponível / receita). `simularPreco().margem` devolve **percentual**. Os dois medem a mesma razão com escalas diferentes. 🟢
4. `formatarPercentual` espera um número já em 0–100, divide por 100 e formata com `style: 'percent'`. Passar `0.15` mostra 0,2%, não 15%. 🟢 `formatters.ts` linhas 12–18 e teste com `50`.
5. Custo `por_sessao` usa `custo.valor` cru. `frequencia: 'anual'` **não** divide por 12 nesse modo. A mensalização só vale para modo mensal (e para fixos e reservas fixas). 🟢 `calcularCustosVariaveisPorSessao`.

## Mensalização

```
getValorMensal(custo) =
  frequencia == 'anual' ? valor / 12 : valor
```

`frequencia` só tem `'mensal' | 'anual'`. Não há semanal nem diário. 🟢

## Custos fixos e depreciação

```
operacionais = soma getValorMensal(c) para c em custosFixos onde NÃO c.isDepreciacao
depreciacao   = soma getValorMensal(c) para c em custosFixos onde c.isDepreciacao E NÃO c.temParcelaAtiva
fixos         = operacionais + depreciacao
```

Regras:

- Item de depreciação com parcela ativa e valor > 0 some do cálculo e gera alerta `danger`. 🟢 `alerts.ts` linhas 14–20. O total já ignora o item mesmo sem o alerta.
- A parcela de financiamento em si, quando lançada como custo operacional (`temParcelaAtiva` no item que **não** é depreciação, id default `'13'`), **entra** no fixo. A regra de bloqueio só olha `isDepreciacao && temParcelaAtiva`. 🟢
- O texto de ajuda diz para não depreciar o mesmo bem que ainda tem parcela. O código não casa bem com bem: são linhas independentes. 🟡 a intenção; 🟢 o comportamento.
- Zerar um custo põe `valor = 0` e mantém a linha. Não há delete de custo fixo/variável/reserva no contexto. Serviços, planos e registros mensais têm remove. 🟢 `DataContext.tsx`.

## Custos variáveis

```
mensais      = soma getValorMensal(c) onde modo ausente OU modo == 'mensal'
unitario     = soma c.valor onde modo == 'por_sessao'
pctVariavel  = soma (c.percentual ou 0) onde modo == 'percentual_receita'

totalVariavel(sessoes, receita) =
  mensais + unitario * sessoes + pctVariavel * receita
```

Modo ausente em dado antigo vira `'mensal'` na carga (`DataContext` e `store.ts`). 🟢

Impostos que um dia foram linhas de custo variável (ids `'8'` e `'9'`, ou nome com imposto/DAS/IRPJ) são removidos na migração local se o valor for 0. Se o valor for > 0, a linha permanece com o sufixo "revisar possível duplicidade", porque a alíquota agora vive em `impostoPercentual`. 🟢 `store.ts` linhas 211–232.

## Reservas estratégicas

```
reservas(receita) = soma (
  modo == 'percentual' ? receita * (r.percentual ou 0)
                       : getValorMensal(r)
)
reservasFixas = soma getValorMensal onde modo != 'percentual'
reservasPct   = soma percentual onde modo == 'percentual'
```

`modo` ausente conta como fixo. 🟢 `calcularTotalReservasFixas` usa `modo !== 'percentual'`.

Reserva **não** é custo operacional. Sai depois do lucro operacional para formar o lucro disponível. 🟢 `calcularLucroDisponivel`.

## Viabilidade da meta

```
capacidade = max(0, diasUteis) * max(0, sessoesporDia)
metaViavel = sessoesMeta > 0 E capacidade > 0 E sessoesMeta <= capacidade
```

Se a meta não cabe na agenda, piso, sustentável e estratégico devolvem **0**. Não devolvem o preço "errado" da meta impossível. 🟢 linhas 183–186 e 100–123. Teste: "não calcula preços quando a meta excede a capacidade mensal".

Ocupação ainda é calculada mesmo nesse caso e pode passar de 100. 🟢 `calcularTaxaOcupacao` não consulta `metaDeSessoesEhViavel`.

## Proteção do denominador

```
dividirComProtecao(base, percentuais) =
  divisor = 1 - percentuais
  divisor > 0.05 ? base / divisor : base * 10
```

O limiar `0.05` não é alíquota fiscal. É um teto de segurança para não explodir o preço quando margem + imposto + percentuais passam de 95%. O teste com margem 0,50 e imposto 0,50 espera `custoPorSessao * 10`. 🟢

Consequência: acima do limiar o preço **deixa de garantir** a margem pedida. A UI da precificação ainda assim limita a margem resultante de um preço digitado a 80% (`Math.min(newMargem, 0.80)`). 🟢 `Precificacao.tsx` linha 177. O slider da landing vai de 5 a 60. 🟢

## Três preços

Seja `S = sessoesMeta` quando a meta é viável.

```
basePiso = (fixos + variaveisMensais) / S + unitario
piso     = dividirComProtecao(basePiso, imposto + pctVariavel)

baseCheio = (fixos + variaveisMensais + reservasFixas) / S + unitario
sustentavel = dividirComProtecao(baseCheio, imposto + pctVariavel + reservasPct)

estrategico = dividirComProtecao(baseCheio, imposto + pctVariavel + reservasPct + margemLucro)

precoMinimo = estrategico
```

Por que o percentual vai para o denominador: o percentual incide sobre a receita, e a receita é o próprio preço. Colocar `preco * percentual` no numerador criaria dependência circular. O teste "resolve reserva percentual no denominador sem circularidade" trava o caso fixo 1000, 10 sessões, imposto 0,10, reserva 0,10, margem 0,20 → `100 / 0,60`. 🟢

Ordem esperada com dados válidos e margem > 0: piso < sustentável < estratégico. 🟢 teste "ordena piso, sustentável e estratégico". Se margem e reservas percentuais forem 0 e não houver reserva fixa, sustentável e estratégico coincidem. 🟡 consequência algébrica, não há teste nomeado para o empate.

O que cada preço promete, em prosa:

| Preço | Cobre | Não cobre |
|-------|--------|-----------|
| Piso | Fixos, variáveis mensais, variável por sessão, variável percentual, imposto | Reservas, margem |
| Sustentável | O piso, mais reservas fixas e reservas percentuais | Margem |
| Estratégico | O sustentável, mais `margemLucro` da receita | Nada do modelo atual |

Premissas embutidas, todas 🟢 no código e 🟡 como política contábil (o código não cita norma):

- Imposto é um único percentual da receita bruta. Não há dedução de base, crédito, Fator R nem anexo do Simples. O texto do regime Simples diz para confirmar com o contador. `labels.ts` linhas 24–28.
- Pró-labore default é um custo fixo, não a margem. Se a pessoa lança pró-labore e ainda pede margem, os dois se somam na lógica do preço. 🟢 o default id `'1'`; 🟡 se isso é o desejado para o CRM.
- Depreciação e parcela do mesmo bem não são reconciliadas por identidade de ativo.
- Não há inflação, sazonalidade, inadimplência nem imposto sobre o lucro. A margem é "o que sobra da receita", não lucro contábil.
- Sessões do mês são iguais. Não há mix de serviços dentro do preço estratégico. O mix aparece só em `calcularPrecoServico` e no registro mensal completo.

## Resultados a um preço dado

Usados quando a pessoa já escolheu `preco` (em geral `precoDefinido`).

```
receita = preco * sessoesMeta
impostos = receita * impostoPercentual
custoOperacional = fixos + totalVariavel(sessoesMeta, receita)
reservas = reservas(receita)
lucroOperacional = receita - impostos - custoOperacional
lucroDisponivel = lucroOperacional - reservas
```

Por sessão, com `S > 0`:

```
fixoPorSessao = fixos / S          (0 se S <= 0)
variavelPorSessao = totalVariavel(S, preco * S) / S
                    (se S <= 0, devolve só o unitário por sessão)
reservaPorSessao = reservas(preco * S) / S     (0 se S <= 0)
custoTotalPorSessao = fixo + variavel + reserva, por sessão
```

`calcularCustoTotalMensal(data, preco = precoDefinido)` soma operacional e reservas nesse preço. `calcularCustoOperacionalMensal` aceita um número de sessões, mas o total mensal sempre usa `sessoesMeta`. 🟢 assinaturas nas linhas 51–59.

### Margem realizada

```
calcularMargemDoPreco = lucroDisponivel / receita     # fração; 0 se preco <= 0 ou meta <= 0
simularPreco.margem   = lucroDisponivel / receita * 100
simularPreco.viavel   = lucroDisponivel >= 0
```

`viavel` é verdadeiro com lucro disponível exatamente zero. 🟢

### Ponto de equilíbrio

```
fixosDoPE = fixos + variaveisMensais + reservasFixas
contribuicao = preco * (1 - imposto - pctVariavel - reservasPct) - unitario
PE = contribuicao > 0 ? ceil(fixosDoPE / contribuicao) : Infinity
```

O PE **não** exige meta viável. Pode ser calculado com meta acima da capacidade, desde que o preço informado tenha contribuição positiva. 🟢 `calcularPontoEquilibrio` não chama `metaDeSessoesEhViavel`.

O PE inclui reservas fixas no numerador. Reserva percentual reduz a contribuição, não entra como custo fixo. 🟢

### Agenda e valor-hora

```
horasTrabalhadas = diasUteis * horasTrabalho
capacidade = max(0, diasUteis) * max(0, sessoesporDia)
ocupacao% = capacidade > 0 ? sessoesMeta / capacidade * 100 : 0
valorHora = (duracaoMinutos ou duracaoPadraoMinutos ou 50) > 0
            ? preco / duracao * 60
            : 0
sugerirSessoesPorDia = horas <= 0 ou duracao <= 0
            ? 0
            : floor( (horas * 60 + 10) / (duracao + 10) )
```

O intervalo de 10 minutos existe **entre** sessões, não depois da última. Por isso o `+ 10` no numerador. Comentário e testes nas linhas 196–199 de `calculations.ts`. 🟢 O número 10 não é configurável.

`calcularCapacidadeMaxima` não olha duração nem horas. A pessoa pode informar 8 sessões/dia em 8 horas de 50 min, o que não cabe se houver intervalo. A sugestão é separada da capacidade. 🟢

## Serviços e planos

```
precoServico = precoEstrategico(data) * servico.multiplicadorPreco + servico.custoAdicional
precoPlano   = precoUnitario * plano.quantidadeSessoes * (1 - plano.descontoPercentual / 100)
```

O preço do serviço multiplica o **estratégico**, não o `precoDefinido`. 🟢 `calcularPrecoServico`. Se a pessoa pratica um preço diferente do estratégico, a tela de serviços não acompanha essa escolha. 🟢 a fórmula; 🟡 se a UI de serviços mostra isso como "preço sugerido" ou como preço de tabela. A página chama a função direto (`Servicos.tsx`).

`validade` do plano (meses, mínimo 1 no Zod) **não entra na fórmula**. 🟢 existe no tipo e no input; nenhuma função de cálculo a lê. 🔴 o que a validade deveria fazer (expirar pacote, não se sabe).

Não existe `calcularPrecoVendaAparelho` neste repositório. Essa função está no irmão fono-precifica e fica reservada a um módulo futuro `produtos` (venda e locação). 🟢 ausência aqui; o nome veio do pedido, não de um import deste repo.

## Simulação da landing (não é o motor)

`Landing.tsx` linhas 37–42, com slider de margem de 5 a 60:

```
custoPorSessao = custoMensal / sessoesMes
precoMinimo    = custoPorSessao / (1 - margemDesejada / 100)
lucroMensal    = (precoMinimo - custoPorSessao) * sessoesMes
```

Não há imposto, reserva, variável por sessão, capacidade nem `dividirComProtecao`. É uma isca de conversão. Um agente **não** deve unificar essa fórmula com o motor sem decisão humana. 🟢

## Métricas do painel (`useMetrics`)

O hook ancora custos variáveis percentuais, reservas percentuais, receita e lucro no **preço estratégico** (`calcularPrecoMinimo`), não em `precoDefinido`. 🟢 `useMetrics.ts` linhas 69–88.

`margemPercent` do hook é `margemLucro * 100`, a margem **pedida**, não a margem realizada do preço digitado. 🟢 linha 100.

`lucroPorSessao = precoEstrategico - custoTotalPorSessao(no estrategico) - impostoPorSessao`. O custo total por sessão já inclui variáveis e reservas percentuais calculadas sobre esse preço; o imposto é subtraído à parte. Não há dupla contagem do imposto. 🟢

## Alertas

`gerarAlertas(data, precoSessao)` em `alerts.ts`:

| Condição | Tipo | Texto-âncora |
|----------|------|----------------|
| Depreciação com parcela ativa e valor > 0 | danger | Equipamento com parcela ativa não pode ter depreciação |
| Lucro operacional > 0 e reservas = 0 | warning | não está formando reservas. O detalhe recomenda 10% a 20% do lucro operacional. Esse intervalo **não** é imposto pelo cálculo |
| Reservas > lucro operacional > 0 | danger | reservas excedem o lucro operacional |
| Margem realizada (`calcularMargemDoPreco` * 100) < 15 e há custo e preço | danger | abaixo de 15% |
| Preço > 0 e preço < custo total por sessão | danger | abaixo do custo |

A faixa de 15% do alerta não é a mesma de `MARGIN_BANDS` em `labels.ts` (arriscada até 10%, saudável até 20%, confortável até 30%, excelente acima). 🟢 os dois números coexistem. 🟡 qual faixa a interface deve obedecer no CRM.

`MARGIN_BANDS` e `OCCUPANCY_BENCHMARKS` são rótulos de UI, não entram na fórmula. Ocupação: até 40 abaixo do equilíbrio, 60 lucrativo subutilizado, 75 saudável, 85 alta performance, 100 quase no limite. 🟢 `labels.ts` linhas 38–44. "Abaixo do equilíbrio" aqui é texto de ocupação, não o ponto de equilíbrio em sessões.

## Regimes e alíquotas sugeridas

| Valor | Rótulo | Alíquota sugerida | Confiança |
|-------|--------|-------------------|-----------|
| `simples` | Simples Nacional | 0,06 | 🟢 default do documento novo |
| `presumido` | Lucro Presumido | 0,1433 | 🟢 sugestão; o texto admite que ISS varia |
| `autonomo` | Autônomo (pessoa física) | 0,15 | 🟢 sugestão |
| `personalizado` | Personalizado | 0 até a pessoa editar | 🟢 |
| `mei` | não está mais na lista | na carga, vira `personalizado` | 🟢 `store.ts` 264–266 e `DataContext.tsx` 172 |

O tipo TypeScript ainda inclui `'mei'`. 🟢 `types.ts` linha 103. O Zod do save **não** inclui `mei`. Um documento que ainda diga `mei` no fio seria rejeitado se não fosse reescrito antes. A carga local e a carga remota reescrevem. 🟢

Escolher regime na UI grava a alíquota sugerida e marca `etapasConcluidas.precificacao`. 🟢 `updateRegimeTributario`.

## Defaults de um documento novo

🟢 `store.ts` `defaultData`:

| Campo | Default |
|-------|---------|
| `sessoesMeta` | 80 |
| `margemLucro` | 0,15 |
| `precoDefinido` | 0 |
| `horasTrabalho` | 8 |
| `diasUteis` | 22 |
| `sessoesporDia` | 8 |
| `duracaoPadraoMinutos` | 50 |
| `regimeTributario` | `simples` |
| `impostoPercentual` | 0,06 |
| `planosTratamento`, `registrosMensais` | [] |
| `etapasConcluidas` | {} |

Capacidade default = 22 * 8 = 176. Meta 80 é viável. Ocupação default ≈ 45,45%. 🟢 aritmética dos defaults.

Serviços default: Sessão Individual (50 min, mult. 1), Avaliação Inicial (60, 1,5), Domiciliar (60, +R$ 30, mult. 1,8), Pilates Individual (50, 1,3), Pilates em Grupo (50, 0,6). 🟢

Custos e reservas nascem com valor 0 e textos de exemplo de fisioterapia (CREFITO, ABRAFITO, gel, eletrodos). São catálogo do perfil, não regra matemática. 🟢

## Migrações silenciosas do JSON local

Aplicadas em `loadData()` antes de calcular. Um agente que ler o JSON cru do servidor pode ver o formato antigo se o cliente ainda não regravou. 🟢

| Situação | O que o loader faz |
|----------|--------------------|
| `pacotes` sem `planosTratamento` | Renomeia |
| Nomes antigos de CREFITO e aluguel | Mapeia para o nome atual |
| "Cursos e capacitação" e "aquisição e manutenção de equipamentos" com valor > 0 | Saem dos fixos e só entram em reservas se `reservasEstrategicas` ainda não existir |
| Duplicata pelo nome | Fica o de maior `valor` |
| Linha default ausente | É reinserida |
| Observações de texto antigo ("anuidade ÷ 12", etc.) | Limpas |
| Reserva "Férias e 13º" combinada | Removida; os defaults separados são recolocados se faltarem |
| `margemLucro > 0,50` | Tratada como markup e convertida: `m / (1 + m)` |
| `regimeTributario == mei` | Vira `personalizado` |
| Campos novos ausentes | Duração 50, regime simples, imposto 0,06, etapas {} |

A deduplicação por nome pode fundir duas linhas legítimas com o mesmo rótulo. 🟡 efeito colateral, não há teste citado nesta leitura para o caso de dois custos homônimos intencionais.

## O que o domínio não faz

- Não precifica produto, aparelho, venda nem locação.
- Não rateia sala entre profissionais.
- Não conhece convênio, glosa, coparticipação nem tabela TUSS.
- Não fecha competência contábil. O registro mensal é um lançamento manual (`sessoesRealizadas`, `receitaTotal`, custos digitados). Não é recalculado pelo motor. 🟢 `RegistroMensal` e a ausência de função que o derive.
- Não converte ocupação em preço. Subir a ocupação não muda o estratégico, exceto se a pessoa mudar `sessoesMeta` (e a meta continuar viável). Mais sessões diluem o fixo. 🟢 a fórmula.
