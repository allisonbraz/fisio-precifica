# Extração do pricing-engine, Design Técnico

## Estado depois da extração

O corte abaixo foi aplicado em `shared/pricing-engine`. O registro das profissões está em `profiles/registro.ts`. Fisioterapia é o único perfil com números. Fonoaudiologia, terapia ocupacional, nutrição, psicologia e educação física entram na lista com `🔴 LACUNA`. Ver `../addenda/001-pricing-engine.md`.

## Corte proposto

```
pricing-engine/                 pacote TS puro
  document.ts                   tipos DadosPrecificacao, sem _perfil
  calculate.ts                  o que hoje é calculations.ts
  migrate.ts                    as transformações de loadData que mudam número
  profile.ts                    interface PricingProfile
  profiles/fisioterapia.ts      defaults e rótulos atuais
  profiles/fonoaudiologia.ts    catálogo próprio, mesma calculate.ts
  profiles/terapia-ocupacional.ts
  produtos/                     opcional, não faz parte do primeiro corte
    aparelho.ts                 futuro calcularPrecoVendaAparelho

apps/fisio-precifica            host atual
  ui/                           páginas
  sync/                         DataContext, tRPC, localStorage
  profile-bind.ts               escolhe o perfil fisioterapia

apps/crm                        host futuro
  modulo-precificacao/          mesmas funções, outra casca
  pacientes, agenda, caixa      fora do pacote
```

🟡 a árvore é proposta desta spec. 🟢 cada arquivo citado do host existe e está acoplado do jeito descrito.

## Interface do perfil

Um perfil não altera o denominador. Ele fornece:

| Campo | Exemplo fisioterapia | O que não é |
|-------|----------------------|-------------|
| `id` | `fisioterapia` | não é o `supabaseId` |
| `catalogoCustosFixos` | as 14 linhas + 3 depreciações de `store.ts` | não é regra |
| `catalogoVariaveis` | gel, descartável, taxa de cartão | idem |
| `catalogoReservas` | férias, 13º, emergência | idem |
| `catalogoServicos` | sessão, avaliação, domiciliar, pilates | idem |
| `regimes` | simples 0,06, presumido 0,1433, autonomo 0,15, personalizado | sugestão, não motor fiscal |
| `rotulos` | `LABELS` | texto |
| `conselho` | CREFITO no texto de ajuda | fono usaria o conselho dela; TO, o dela |

O que permanece igual nos três perfis, porque está na fórmula e não no catálogo:

- Três preços, cap 0,05, meta viável, depreciação bloqueada por parcela, margem como fração da receita.
- Agenda: dias × sessões/dia. O intervalo de 10 minutos continua constante até a pergunta 10 ser respondida. 🔴

## O que o host continua fazendo

| Concern | Onde está hoje | No CRM |
|---------|----------------|--------|
| Login Supabase | `autenticacao/` | o CRM já terá; não duplicar |
| jsonb por profissional | `pricing_data` | pode ser a mesma tabela ou uma coluna no cadastro do profissional do CRM |
| Debounce e pending | `sincronizacao/` | reutilizar a política se o módulo editar offline |
| Zod do save | `api/` | acrescente `schemaVersion` quando existir; não afrouxe as faixas 0–1 |
| Telas | `interface/` | podem ser reaproveitadas como módulo ou reescritas, desde que chamem o pacote |
| Admin de leads | `contatos/` | não faz parte do pricing-engine |

## Fluxo de uma chamada no CRM

1. O CRM carrega o profissional e o perfil da profissão.
2. `migrateDocument` normaliza JSON antigo.
3. O módulo chama `calcularPrecoEstrategico` e as irmãs.
4. A UI mostra piso, sustentável e estratégico.
5. O host grava o documento de volta pelo mecanismo dele. O pacote não abre conexão.

## O que precisa mudar no código atual para o corte ser honesto

1. Tirar o barrel `store.ts` que reexporta o motor junto com localStorage. Quem importa preço não pode puxar `window`. 🟢 o barrel existe.
2. Extrair `migrateDocument` de dentro de `loadData`, que hoje assume `localStorage`.
3. Parar de embutir `_perfil` no mesmo objeto que o motor lê. O motor ignora a chave, mas o tipo do pacote não deve exigi-la. 🟢 o motor não lê `_perfil`.
4. Decidir se `useMetrics` vira `deriveMetrics(data)` pura. O hook fica no app e chama a função. 🟡
5. `alerts.ts` chama `formatarMoeda`. Injetar um formatador ou devolver só códigos (`DEPRECIACAO_COM_PARCELA`, `MARGEM_ABAIXO_15`) e deixar a frase no perfil. 🟡 recomendação; hoje a frase está em português fixo.
6. Não mover `Landing.tsx` para o pacote. A fórmula de lá é outra.
7. Acrescentar `schemaVersion` só depois da resposta humana. Default sugerido por esta spec, não pelo código: começar em `1` no dia do corte. 🔴
8. Testes de cálculo viajam com o pacote. Testes de sync e de leads ficam no host.

## Módulo produtos (não implementar agora)

Quando o perfil fonoaudiologia precisar vender ou locar aparelho, o módulo opcional exporta algo com o papel de `calcularPrecoVendaAparelho`, recebido do repo irmão, sem alterar a assinatura do preço de sessão. O documento pode ganhar uma coleção `produtos` versionada. Até lá, o campo não existe e o Zod não deve ser "afrouxado" para aceitá-lo em silêncio além do passthrough que já existe. 🟡 o passthrough já aceitaria a chave; um agente não deve passar a calculá-la.

## Dependências

- Nenhuma de runtime além de TypeScript.
- O host traz React e Supabase.

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Fórmula já é pura | `calculations.ts` | 🟢 |
| Catálogo não é puro | `store.ts` defaults | 🟢 |
| Três profissões, uma fórmula | pedido do dono + ausência de ramo por profissão no motor | 🟡 o pedido; 🟢 a ausência de ramo |

## Estado Interno

O pacote não guarda estado. Perfil é dado. Documento é dado. 🟢 como consequência do desenho atual.

## Observabilidade

Nenhuma nova. O host loga sync. 🟢

## Riscos e Lacunas

- 🔴 Rateio entre profissionais da mesma sala não tem fórmula. Não inventar divisão de aluguel.
- 🔴 Convênio e TUSS não têm campo.
- 🟡 Publicar o pacote no npm versus mantê-lo em workspace do monorepo do CRM. Os dois honram este corte. O código não escolhe.
