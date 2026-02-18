# TODO

## Bug Fix
- [x] Investigar por que descrições e CREFITO não aparecem na página de Custos
- [x] Corrigir o problema - migração robusta por nome + adição de itens faltantes

## Banco de Dados para Leads
- [x] Adicionar feature web-db-user ao projeto
- [x] Criar tabela de leads no banco
- [x] Criar API endpoint para salvar leads
- [x] Atualizar frontend para enviar leads ao servidor
- [x] Criar painel admin para visualizar/exportar leads
- [x] Escrever testes vitest para leads (10 testes passando)

## Correção de Nomenclatura (Preço vs Custo)
- [x] Separar claramente "Custo por Sessão" (mínimo para não ter prejuízo) de "Preço por Sessão" (valor definido pelo profissional)
- [x] Corrigir no relatório PDF: mostrar custo por sessão E preço definido separadamente (2 caixas lado a lado)
- [x] Corrigir na página de Precificação (2 cards: custo vs preço)
- [x] Corrigir no Dashboard/Home (cards separados)
- [x] Corrigir em Indicadores e Simulação (variáveis renomeadas)
- [x] Verificar consistência em todo o app (grep confirmou 0 referências a "Preço Mínimo")

## Melhorias v3
- [x] 1. Corrigir gráfico Receita vs Custo na Simulação (linhas de Receita, Lucro, Custo Mensal + referência "Seu Preço")
- [x] 1b. Adicionar cenários de taxa de ocupação (plena 100%, 70-80%, faltas 10%)
- [x] 1c. Mostrar % acima/abaixo do custo por sessão nos cenários de preço
- [x] 2. Clarificar Score de Saúde Financeira (explicação das 5 dimensões + legenda de cores)
- [x] 3. Mover jornada de trabalho para Precificação (Horas/dia, Dias úteis, Sessões/dia)
- [x] 4. Reordenar custos fixos: Pró-labore, Salários, CREFITO, Associação primeiro
- [x] 5. Explicar Lucro: "O que sobra para: Reinvestir, Criar reserva, Crescer, Dividendos"
- [x] 6. Faixas de margem na Precificação: <15% arriscada, 15-30% saudável, >30% excelente
- [x] 6b. Corrigir migração de observações antigas (stale) nos custos
