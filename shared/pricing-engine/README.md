# pricing-engine

Motor de preço compartilhado do FisioPrecifica. TypeScript puro: não importa React, tRPC, Supabase nem `localStorage`.

## O que calcula

As mesmas funções que estavam em `client/src/lib/calculations.ts`. O app reexporta esse módulo, então piso, sustentável, estratégico, simulação e ponto de equilíbrio não mudam de fórmula.

O perfil **não entra** na conta. Ele só descreve o documento inicial (catálogo, duração, meta, alíquota sugerida, rótulos).

## Perfis

A lista mora em `profiles/registro.ts`. O FisioPrecifica usa só `fisioterapia`.

| Id | Profissional | Conselho | Estado |
|----|----------------|----------|--------|
| `fisioterapia` | Fisioterapeuta | CREFITO | Catálogo e números de abertura iguais aos que o app já usava. |
| `fonoaudiologia` | Fonoaudiólogo | CRFa | 🔴 LACUNA. Catálogos vazios. |
| `terapia-ocupacional` | Terapeuta ocupacional | CREFITO | 🔴 LACUNA. A anuidade da fisio não foi copiada. |
| `nutricao` | Nutricionista | CRN | 🔴 LACUNA. |
| `psicologia` | Psicólogo | CRP | 🔴 LACUNA. |
| `educacao-fisica` | Educador físico (personal) | CREF | 🔴 LACUNA. |

`criarDocumentoInicial` só funciona no perfil completo. Nos outros, lança erro em vez de preencher com o default da fisio.

## Como acrescentar uma profissão

1. Inclua o id em `ProfissaoId`, em `profile.ts`.
2. Crie `profiles/<id>.ts`. Se ainda não houver números, use `perfilIncompleto(id, nome, nomeProfissional, siglaDoConselho)`. Não copie duração, meta, alíquota nem custos da fisioterapia.
3. Registre o perfil no objeto `registro` de `profiles/registro.ts` e na `listaPerfis`. O tipo `Record<ProfissaoId, PricingProfile>` não compila se o passo 3 for esquecido.
4. Rode os testes. O arquivo `profiles.test.ts` percorre `listaPerfis` e exige lacuna em todo perfil incompleto.

Quando os números existirem de verdade, troque o perfil para o formato de `profiles/fisioterapia.ts` (`catalogoCompleto: true` e parâmetros `status: 'confirmado'`). A fórmula em `calculate.ts` não muda.

## Produtos

`moduloProdutos` reserva o lugar de `calcularPrecoVendaAparelho` (venda e locação de aparelho, no repositório fono-precifica). A função não existe aqui.
