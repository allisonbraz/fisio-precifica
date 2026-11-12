# ADR-006 — Catálogo de fisioterapia separado da fórmula, na prática, não no pacote

- **Status:** implícito, ainda não extraído
- **Evidência:** defaults em `store.ts` versus funções genéricas em `calculations.ts`
- **Confiança:** 🟡 como decisão consciente; 🟢 como fato da estrutura

## Contexto

O produto vai ganhar perfis de fonoaudiologia e terapia ocupacional, e um módulo opcional de produtos (venda/locação de aparelho, função `calcularPrecoVendaAparelho` no repo irmão).

## Decisão observada

A matemática não cita CREFITO. O catálogo cita. Ninguém ainda moveu isso para um perfil nomeado.

## Consequências

Copiar `store.ts` inteiro para o pacote compartilhado leva Pilates e CREFITO para a fonoaudiologia. O corte certo está em `extracao-pricing-engine/`.
