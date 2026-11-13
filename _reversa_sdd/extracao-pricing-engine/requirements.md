# Extração do pricing-engine

## Visão Geral

Contrato do corte que separa a fórmula compartilhada da casca FisioPrecifica, para três perfis (fisioterapia, fonoaudiologia, terapia ocupacional) e para um módulo de precificação dentro de um CRM React + Supabase. Não descreve código que já exista com esse nome. Descreve o que o código atual obriga a mudar. 🟢 os pontos de acoplamento; 🟡 o desenho do pacote, porque ninguém o publicou ainda.

## Responsabilidades

- Dizer o que entra no pacote puro.
- Dizer o que fica no perfil.
- Dizer o que fica no host (este app ou o CRM).
- Reservar um módulo opcional `produtos` sem especificá-lo.

## Regras de Negócio

- O pacote não importa React, Wouter, tRPC, Supabase nem Drizzle. 🟢 hoje `calculations.ts` já cumpre isso.
- O pacote não contém o catálogo CREFITO/Pilates. Isso é perfil `fisioterapia` em `store.ts`. 🟢
- O pacote não fala com `pricing.save`. Persistência é do host. 🟢
- O pacote não implementa `calcularPrecoVendaAparelho`. Essa função existe no repositório irmão fono-precifica e entra, no futuro, como módulo opcional `produtos` (venda e locação de aparelho). Até lá, os três perfis precificam sessão com a mesma fórmula. 🟢 ausência neste repo.
- Nomes de campo atuais (`sessoesMeta`, `crefito`) podem ganhar alias no perfil. Trocar o nome no JSON sem `schemaVersion` quebra documentos já gravados. 🟢 o risco; 🔴 o número da versão.
- Prontuário, agenda de pacientes, convênio e faturamento não entram no pacote. Sessão aqui é volume mensal. 🟡 limite de produto pedido pelo dono, não uma entidade do código.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|--------------------|
| RF-01 | Mover `calculations.ts` e os tipos que ele lê para o pacote, com os testes | Must | `calculations.test.ts` verde fora do app |
| RF-02 | Perfil com catálogo default, rótulos de regime e textos de ajuda | Must | FisioPrecifica continua abrindo com os mesmos defaults |
| RF-03 | Host continua dono de auth, sync e jsonb | Must | Este app não ganha segundo banco |
| RF-04 | `schemaVersion` no documento antes de um segundo perfil gravar | Must | Pergunta 1 de `../questions.md` respondida |
| RF-05 | Módulo `produtos` isolado, import opcional | Could | O pacote de sessão carrega sem ele |
| RF-06 | CRM chama as funções puras e mostra as telas deste app, ou um subconjunto | Should | Não reimplementa a fórmula na UI |

## Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confiança |
|------|-----------|-----------|-----------|
| Compatibilidade | Migrações de `loadData` precisam rodar no host ou numa função `migrateDocument` exportada | `store.ts` | 🟢 |
| Fronteira | `useMetrics` fica no app, ou vira função pura `deriveMetrics` sem hook | o arquivo usa `useMemo` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o pacote instalado sem React
Quando o perfil fisioterapia monta o documento default e chama calcularPrecoEstrategico
Então o número é o mesmo que o app calcula hoje para esses defaults

Dado o perfil fonoaudiologia sem catálogo de aparelho
Quando o host calcula uma sessão
Então a função de venda de aparelho não é exigida

Dado um JSON antigo com margemLucro maior que 0,50
Quando migrateDocument roda
Então a margem vira m / (1 + m) antes do cálculo
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Extrair funções puras + tipos + testes | Must | Único núcleo comprovado |
| Perfis de catálogo | Must | Senão a fono herda Pilates |
| Produtos / aparelho | Could | Repo irmão, fora deste código |
| Normalizar o jsonb em tabelas | Won't neste corte | ADR-002; o host pode fazer depois |

## Rastreabilidade de Código

| Arquivo | Por que muda na extração | Cobertura |
|---------|--------------------------|-----------|
| `client/src/lib/calculations.ts` | muda de pasta, não de fórmula | 🟢 |
| `client/src/lib/types.ts` | idem | 🟢 |
| `client/src/lib/store.ts` | partir defaults e migração | 🟢 |
| `client/src/lib/labels.ts` | rótulos viram perfil | 🟢 |
| `client/src/lib/alerts.ts` | pode ir junto se a moeda for injetada | 🟡 |
| `server/routers.ts` | Zod precisa aceitar `schemaVersion` quando ela existir | 🔴 ainda não existe |
