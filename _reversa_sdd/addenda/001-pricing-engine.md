# Adendo — pricing-engine compartilhado

> A extração pedida em `extracao-pricing-engine/` foi feita em `shared/pricing-engine`. As fórmulas de `domain.md` continuam valendo. Este adendo só diz onde o código mora agora.

## Onde está

| Peça | Caminho |
|------|---------|
| Fórmulas | `shared/pricing-engine/calculate.ts` |
| Tipos do documento | `shared/pricing-engine/types.ts` |
| Registro das profissões | `shared/pricing-engine/profiles/registro.ts` |
| Como acrescentar uma profissão | `shared/pricing-engine/README.md` |
| Reexport do app | `client/src/lib/calculations.ts` |
| Catálogo que o app abre | perfil `fisioterapia`, usado por `client/src/lib/store.ts` e `labels.ts` |
| Produtos / aparelho | `shared/pricing-engine/produtos.ts` — interface, sem fórmula |

## Perfis

| Id | Situação |
|----|----------|
| `fisioterapia` | Completo. Mesmos defaults de antes. |
| `fonoaudiologia` | 🔴 LACUNA |
| `terapia-ocupacional` | 🔴 LACUNA |
| `nutricao` | 🔴 LACUNA |
| `psicologia` | 🔴 LACUNA |
| `educacao-fisica` | 🔴 LACUNA. Apelido de interface: personal. Sem preço de aula. |

O perfil não altera piso, sustentável nem estratégico. `criarDocumentoInicial` recusa perfil incompleto.

## O que ainda espera decisão

Itens 1, 5, 6, 8, 10 e 13 de `questions.md`: versão do JSON, preço praticado versus estratégico, fórmula da landing, faixa de 15% versus `MARGIN_BANDS`, intervalo de 10 minutos como parâmetro, e se o aparelho entra na sessão.
