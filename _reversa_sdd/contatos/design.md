# Contatos e leads, Design Técnico

## Interface

Procedimentos em `../openapi/trpc-procedures.yaml`.

`UnifiedContact`: `id` (`lead-<id>` ou `user-<id>`), `nome`, `email`, `whatsapp`, `instagram`, `especialidades`, `source`, `hasOAuth`, `createdAt`, `lastSignedIn`. 🟢 interface em `db.ts`.

## Fluxo Principal

1. Admin abre `/admin/leads`.
2. `contacts.list` pagina.
3. A página busca e mostra badge de origem.
4. Export chama `exportAll`.
5. Troca de e-mail abre modal e chama `changeEmail`.

## Fluxos Alternativos

- **Banco fora:** lista vazia e total 0, sem erro para o admin. 🟢 `getUnifiedContacts`.
- **Perfil sem `_perfil`:** Instagram e especialidades ficam string vazia. WhatsApp cai no que o SQL já trouxe. 🟢

## Dependências

- Auth admin.
- JSON `_perfil`.
- Service role só na troca de e-mail.

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| União por e-mail, não por id | SQL `UNION` | 🟢 |
| Enriquecimento do perfil só na página corrente | segundo select por e-mails da página | 🟢 |
| Consentimento não persistido | ausência de coluna | 🟢 |

## Estado Interno

Nada no servidor além das tabelas. A busca da UI é filtro client-side da página carregada. 🟡 confirmar se a página filtra só o que já baixou. `Leads.tsx` usa `includes` em memória sobre `items`. Não há query de busca no servidor. 🟢 o grep de filtro na página.

## Observabilidade

Erros de SQL em `createLead` são logados e relançados. A listagem não tem log próprio. 🟢

## Riscos e Lacunas

- 🔴 Onde guardar o consentimento.
- 🟢 Troca de e-mail sem transação (`../database/relationships.md`).
- 🟡 A lista local `fisioprecifica_leads_list` não alimenta esta tela.
