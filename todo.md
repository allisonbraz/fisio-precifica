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
