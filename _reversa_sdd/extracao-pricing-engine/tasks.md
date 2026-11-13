# Extração do pricing-engine, Tarefas de Implementação

Estas tarefas são o delta para um ciclo futuro (`/reversa-forward`). Não foram executadas. Não autorizam editar o app nesta entrega.

## Pré-requisitos

- [ ] Respostas de `../questions.md` itens 1, 5, 6, 10 e 14, ou aceite explícito dos defaults marcados 🔴
- [ ] `calculations.test.ts` como rede de segurança

## Tarefas

- [ ] T-01, Criar o pacote com `calculate.ts` e `document.ts` movidos sem alterar resultado
  - Origem: `client/src/lib/calculations.ts`, `types.ts`
  - Critério de pronto: os testes numéricos atuais passam importando o pacote
  - Confiança: 🟢 o comportamento a preservar

- [ ] T-02, Extrair `migrateDocument` de `loadData`
  - Origem: `client/src/lib/store.ts` linhas 149–286
  - Critério de pronto: markup > 0,50, MEI, pacotes→planos e impostos legados
  - Confiança: 🟢

- [ ] T-03, Introduzir `PricingProfile` e mover defaults e `REGIMES_TRIBUTARIOS` para `profiles/fisioterapia`
  - Origem: `store.ts` defaults, `labels.ts`
  - Critério de pronto: documento novo do app continua igual ao `defaultData` atual
  - Confiança: 🟢

- [ ] T-04, Deixar fono e TO como perfis com catálogo vazio ou próprio, mesma `calculate.ts`
  - Origem: nenhuma função por profissão hoje
  - Critério de pronto: não referenciam aparelho
  - Confiança: 🟡 o conteúdo do catálogo dessas profissões não está no código

- [ ] T-05, No host, trocar imports para o pacote e manter sync, auth e telas
  - Origem: `DataContext.tsx`, páginas
  - Critério de pronto: save/load inalterados no fio
  - Confiança: 🟢

- [ ] T-06, Não criar `produtos/aparelho.ts` até uma história própria trazer a regra do fono-precifica
  - Origem: ausência neste repo
  - Critério de pronto: o pacote de sessão publica sem esse export
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Caso 100/0,60 continua válido depois do move
- [ ] TT-02, Default do perfil fisioterapia gera a mesma capacidade 176 e a mesma meta 80
- [ ] TT-03, Importar o pacote num teste Node sem `window` e sem React

## Ordem Sugerida

1. T-01 e TT-01, sem perfil ainda.
2. T-02, porque JSON antigo existe em produção. 🟡 produção não foi lida.
3. T-03 e T-05 juntos, para o app não quebrar o boot.
4. T-04 quando houver catálogo real das outras profissões.
5. T-06 fica de pé como proibição, não como implementação.

## Lacunas Pendentes (🔴)

- Número de `schemaVersion`.
- Se o CRM grava o mesmo jsonb.
- Catálogo real de fonoaudiologia e terapia ocupacional.
- Regra de venda e locação de aparelho, que não deve ser adivinhada.
