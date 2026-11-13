# Interface, Tarefas de Implementação

## Pré-requisitos

- [ ] Motor e DataContext disponíveis
- [ ] Auth com user ou null

## Tarefas

- [ ] T-01, Reproduzir o switch de rotas, inclusive landing para anônimo e redirect de `/reservas`
  - Origem: `client/src/App.tsx`
  - Critério de pronto: tabela de `../ui/telas.md`
  - Confiança: 🟢

- [ ] T-02, Custos em quatro abas, zerar sem apagar linha, bloqueio visual de depreciação com parcela
  - Origem: `Custos.tsx`, `Reservas.tsx`
  - Critério de pronto: parcela ativa não entra no total (isso o motor garante; a UI só explica)
  - Confiança: 🟢

- [ ] T-03, Precificação bidirecional com teto de 80% e centavos
  - Origem: `Precificacao.tsx` `handleMargemChange` e `handlePrecoChange`
  - Critério de pronto: os dois handlers do arquivo
  - Confiança: 🟢

- [ ] T-04, Não reutilizar a fórmula da landing no miolo
  - Origem: `Landing.tsx` linhas 37–42
  - Critério de pronto: a landing continua isolada até decisão em `../questions.md`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Anônimo em `/` vê a landing
- [ ] TT-02, ProgressGate some só com custo > 0 e preço definido > 0
- [ ] TT-03, Admin vê o item Contatos; user não vê

## Lacunas Pendentes (🔴)

- Não tratar o texto de `Legal.tsx` como já especificado aqui.
