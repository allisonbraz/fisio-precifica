# Sincronização

## Visão Geral

O documento vive primeiro no `localStorage` e, com sessão, é espelhado em `pricing_data` com atraso de 2 segundos. Falha de rede não apaga o trabalho. 🟢

## Responsabilidades

- Hidratar o estado a partir do local, aplicando migrações de `loadData`.
- Quando autenticado, buscar o remoto uma vez por montagem (`refetchOnMount: 'always'`).
- Não deixar o remoto velho cobrir edição ainda não confirmada.
- Gravar local na hora e agendar `pricing.save` com `{ ...data, _perfil }`.
- Repetir em 5 segundos se `success` for falso ou se a chamada lançar.
- No logout, preservar o local se o último status não for `synced`.
- Ao trocar de conta na mesma aba, zerar o documento local e buscar de novo.

## Regras de Negócio

- `remoteDataLoaded` só fica verdadeiro depois de um load com sucesso, mesmo que `data` seja null. Antes disso, nenhum save. 🟢
- Pending é a chave `fisio_precifica_sync_pending` = `'1'`. 🟢
- Conta diferente: `resetData()`, limpa pending, refetch. Logout para user null não entra nesse ramo. 🟢
- MEI no JSON remoto vira `personalizado` no merge. Variável sem `modo` vira `mensal`. 🟢
- Import JSON exige `custosFixos` e `custosVariaveis`. Não passa de novo pelo migrador até o próximo `loadData`. 🟡 `importarDados` devolve o parse cru; o `importData` do contexto só faz `setData`. Na próxima abertura, `loadData` migra. Se a pessoa continuar na sessão, o objeto importado pode estar no formato antigo até recarregar. 🟢 o código de import.
- Export não inclui perfil. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério |
|----|-----------|------------|----------|
| RF-01 | Save local síncrono com a edição | Must | `saveData` no efeito |
| RF-02 | Debounce de 2s | Must | timeout 2000 |
| RF-03 | Pending bloqueia overwrite | Must | `hasPendingLocalSync` |
| RF-04 | Retry 5s | Should | timeout 5000 |
| RF-05 | Logout preserva se não sincronizou | Must | `Layout.handleLogout` |
| RF-06 | Troca de conta limpa o local | Must | efeito de e-mail |

## Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confiança |
|------|-----------|-----------|-----------|
| Disponibilidade | App abre sem banco, com defaults locais | `loadData` | 🟢 |
| Consistência | Last-write-wins, sem versão | `savePricingData` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado load remoto ainda em voo
Quando o estado local muda
Então syncNow retorna false e não há POST

Dado save com success false
Quando 5 segundos passam
Então há nova tentativa

Dado duas contas em sequência na mesma aba
Quando o e-mail muda
Então o estado volta ao default antes do fetch da conta nova
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Espelho com pending | Must | Perda de dado é o bug que os commits recentes atacam |
| Export/import | Should | Backup manual |
| Sync em tempo real entre abas | Won't | Não há BroadcastChannel |

## Rastreabilidade de Código

| Arquivo | Símbolo | Cobertura |
|---------|---------|-----------|
| `client/src/lib/sync.ts` | flags e status | 🟢 |
| `client/src/contexts/DataContext.tsx` | `DataProvider` | 🟢 |
| `client/src/lib/store.ts` | `loadData`, `saveData`, `clearAllLocalData` | 🟢 |
