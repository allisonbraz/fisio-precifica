# Contatos e leads

## Visão Geral

Dois canais de contato: o procedimento público `leads.register` (banner legado) e a conta Supabase. O admin vê a união dos dois, enriquecida com o perfil que está dentro do JSON de preço. 🟢

## Responsabilidades

- Registrar lead com consentimento obrigatório no input.
- Unir por e-mail normalizado (`LOWER(TRIM)`).
- Mostrar WhatsApp, Instagram e especialidades do `_perfil` quando existirem.
- Permitir trocar o e-mail no Auth e nas tabelas.

## Regras de Negócio

- Upsert de lead atualiza nome, WhatsApp e source. Não mexe em IP, userAgent nem createdAt. 🟢
- User sem lead entra na lista como contato `user-`. Lead com user vira origem com sufixo ` + login`. 🟢 SQL em `db.ts`.
- `users.whatsapp` é fallback se o lead não tem número. O app não escreve essa coluna; o número novo está no perfil. 🟢
- Troca de e-mail: 404 se o atual não existe, 409 se o novo já é de outro user, 500 se não há service role ou se o Auth recusa. Depois atualiza users, pricing_data e leads. Comparação exata, não normalizada. 🟢
- A tela admin mora em `/admin/leads` (`Leads.tsx`), não numa rota `/contatos`. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério |
|----|-----------|------------|----------|
| RF-01 | Register com consentimento | Must | Zod literal true |
| RF-02 | Lista unificada paginada | Must | `getUnifiedContacts` |
| RF-03 | Exportação em blocos de 500 | Should | `getUnifiedContactsForExport` |
| RF-04 | Troca de e-mail | Should | códigos 404, 409, 500 |
| RF-05 | Link `wa.me` só com dígitos | Could | `Leads.tsx` |

## Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confiança |
|------|-----------|-----------|-----------|
| Segurança | Só admin lê a lista | `adminProcedure` | 🟢 |
| Privacidade | IP e user agent são guardados no lead | schema | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um lead e um user com o mesmo e-mail em caixas diferentes
Quando o admin lista contatos
Então a união trata como a mesma chave

Dado a troca de e-mail com a caixa diferente da gravada
Quando changeEmail roda com igualdade exata
Então pode responder 404 mesmo que a lista mostre a pessoa
```

O segundo cenário é consequência das duas comparações. 🟢 os dois códigos; 🟡 não há teste automatizado desse desencontro.

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Isolar a lista no admin | Must | Dado pessoal |
| Register | Should | A landing atual não chama |
| Troca de e-mail | Should | Operação |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `server/db.ts` | `createLead`, `getUnifiedContacts`, `updateUserEmail` | 🟢 |
| `server/routers.ts` | `leads`, `contacts` | 🟢 |
| `client/src/pages/Leads.tsx` | página | 🟢 |
