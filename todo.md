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

## Evolução Estrutural v4 — Separação Custos vs Reservas
- [x] Atualizar modelos de dados no store: adicionar Reservas Estratégicas, campo temParcelaAtiva nos custos
- [x] Criar nova fórmula: Custo por Sessão = (Custos Operacionais + Depreciação) ÷ Sessões (sem reservas)
- [x] Implementar Lucro Operacional = Receita - (Custos Operacionais + Depreciação)
- [x] Implementar Lucro Disponível = Lucro Operacional - Reservas Estratégicas
- [x] Adicionar lógica condicional de Depreciação vs Parcela Ativa (bloquear depreciação se parcela ativa)
- [x] Criar seção de Reservas Estratégicas (fundo reposição, cursos, mentorias, emergência, férias, expansão)
- [x] Implementar pergunta condicional ao cadastrar: "Este valor é obrigatório para funcionamento?"
- [x] Implementar 3 alertas automáticos (reserva como custo, lucro sem reservas, parcela + depreciação)
- [x] Atualizar Score de Saúde Financeira com % do lucro destinado a reservas
- [x] Atualizar Home/Dashboard com Lucro Operacional e Lucro Disponível
- [x] Atualizar Precificação com nova fórmula
- [x] Atualizar Simulação com nova lógica
- [x] Atualizar Indicadores com novas métricas
- [x] Atualizar Relatório PDF com Composição do Lucro e Reservas
- [x] Não alterado: UI visual, Serviços, Planos de Tratamento, Relatórios Mensais

## Correções v5
- [x] Corrigir aluguéis duplicados nos custos operacionais (name mapping + deduplication)
- [x] Adicionar rodapé "Feito por Allison Braz — FisioMind" no sidebar e no conteúdo principal

## Unificação Leads + OAuth v6
- [x] Adicionar campo whatsapp e source à tabela users no banco
- [x] Registrar automaticamente como lead quem fizer login OAuth (auto-link por email)
- [x] Unificar painel admin "Central de Contatos" com filtros por origem (Banner/Login/Ambos)
- [x] Permitir exportar todos os contatos unificados em CSV
- [x] Pesquisar e apresentar estratégias de monetização
- [x] 15 testes vitest passando (leads + contacts + auth)
