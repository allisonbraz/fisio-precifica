# Lacunas e problemas conhecidos

## CI

O workflow `.github/workflows/ci.yml` roda typecheck, lint, teste e build em todo push e pull request para `main`.

| Fato | Confiança |
|------|-----------|
| Todos os runs listados de `main` nesta leitura estão `failure`, do mais antigo visível (março/2026) ao merge de 19/10/2026 (run `39273644533`) | 🟢 `gh run list` |
| O run de 19/10/2026 quebra no passo **Lint**: 64 problemas (59 erros, 5 warnings). Regras que dominam o trecho final do log: `react-hooks/preserve-manual-memoization` (React Compiler via `eslint-plugin-react-hooks`) e `@typescript-eslint/no-unused-vars` / `no-explicit-any` / `prefer-const` | 🟢 log do run |
| Arquivos citados nesse trecho: `Precificacao.tsx`, `Reservas.tsx`, `Simulacao.tsx`, `server/_core/context.ts`, `server/db.ts`, `server/leads.test.ts`, `server/storage.ts` | 🟢 |
| Os logs dos runs de julho/2026 (por exemplo `28916664789`, 08/07/2026) respondem HTTP 410 e não puderam ser relidos | 🟢 a expiração |
| "O lint falha desde julho/2026" como data de início | 🟡 o pedido cita julho; os runs de julho falharam, mas o log expirou em segundos curtos (9–11 s na listagem), o que também cabe numa falha de install anterior ao lint. Outubro é lint com certeza. Março/2026 já falhava, então o CI não está verde desde antes de julho |

O aviso do runner também diz que Node 20 das actions está depreciado e foi forçado para Node 24. 🟢 log de outubro. Isso é aviso, não a causa dos 64 erros.

Nada desta extração altera o lint. Corrigir é mudança de código, fora do escopo.

## Produto e dados

| # | Lacuna | Marca |
|---|--------|-------|
| G1 | Landing calcula outro preço, sem imposto | 🟢 |
| G2 | `useMetrics` usa o estratégico, não `precoDefinido` | 🟢 |
| G3 | Duas escalas de margem (fração vs pontos) | 🟢 |
| G4 | `validade` do plano não afeta preço nem bloqueia uso | 🟢 |
| G5 | Preço de serviço ignora `precoDefinido` | 🟢 |
| G6 | `mei` existe no tipo e não no Zod nem na UI | 🟢 |
| G7 | Migração 0001 não executada; produção pode ter `openId` | 🔴 |
| G8 | RLS pode não valer para `DATABASE_URL` | 🟡 |
| G9 | Consentimento de marketing não é persistido | 🟢 |
| G10 | `users.whatsapp` não é escrito; o número vive no JSON | 🟢 |
| G11 | Sem `schemaVersion` | 🟢 ausência |
| G12 | Sem trava otimista; última aba ganha | 🟢 |
| G13 | Troca de e-mail sem transação | 🟢 |
| G14 | Admin não é rebaixado | 🟢 |
| G15 | Rate limit não é distribuído | 🟢 o código; 🟡 o prejuízo real |
| G16 | README cita porta 5000; o server começa em 3000 | 🟢 |
| G17 | Comentário do `Home.tsx` ainda descreve "custo por sessão = mínimo para não ter prejuízo", linguagem anterior aos três preços | 🟢 o comentário |
| G18 | Faixa de alerta (15%) ≠ `MARGIN_BANDS` (10/20/30) | 🟢 |
| G19 | Intervalo de 10 minutos é constante mágica | 🟢 |
| G20 | Depreciação não calcula valor do bem ÷ meses; a pessoa digita o fluxo | 🟢 |
| G21 | `storage.ts` e Forge seguem no repositório | 🟢 |
| G22 | Export JSON não inclui `_perfil` | 🟢 |
| G23 | Lista local `fisioprecifica_leads_list` não é a tabela `leads` | 🟢 |
| G24 | Módulo `calcularPrecoVendaAparelho` não existe aqui | 🟢 |

## O que não copiar para o CRM sem decidir

- A fórmula da landing.
- O papel admin por variável de ambiente.
- O SQL de RLS como se fosse a autorização real.
- Os defaults de Pilates e CREFITO dentro do pacote neutro.
- A função de aparelho auditivo, até existir o módulo `produtos`.
