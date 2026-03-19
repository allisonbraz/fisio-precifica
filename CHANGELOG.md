# Changelog — FisioPrecifica

Todas as mudanças relevantes do projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

---

## [2.1.0] — 2026-03-18

### Adicionado
- **Landing page com Calculadora Rápida** — Visitantes não logados veem uma landing page com proposta de valor, seções "Como funciona" e "Benefícios", e uma calculadora que calcula o preço mínimo por sessão em 3 campos (custo mensal, sessões, margem) sem precisar criar conta.
- **Progresso guiado no dashboard** — Barra de progresso animada com 4 etapas (custos, margem, preço, serviços) que desaparece quando tudo está preenchido. Substitui o wizard modal descartável.
- **Gate progressivo nas páginas avançadas** — Banner contextual em Serviços, Simulação, Reservas e Relatórios que orienta o usuário a preencher custos e precificação primeiro. Não bloqueia — apenas guia.
- **Reservas como 4ª aba em Custos** — Reservas Estratégicas agora é uma aba dentro da página de Custos (Operacionais / Depreciação / Variáveis / Reservas), reduzindo a navegação.

### Alterado
- **Sidebar reorganizado** — Itens agrupados em "Essencial" (Painel, Custos, Precificação, Indicadores), "Ferramentas" (Serviços, Simulação, Relatórios), e rodapé (Meu Perfil, Configurações). Reduzido de 10 para 7 itens visíveis.
- **"Início" renomeado para "Painel"** no sidebar.
- **"Material descartável por sessão"** renomeado para **"Materiais de uso único por sessão"** com descrição melhorada: valor deve ser o total mensal (custo por sessão × nº de sessões).
- **Rota `/reservas`** redireciona para `/custos`.
- **Roteamento** — Visitantes sem login veem a Landing page; logados veem o Dashboard.

### Corrigido
- **Configurações** — "Seus dados ficam salvos localmente" → "Seus dados ficam salvos na sua conta" (dados sincronizam com servidor).
- **Relatórios** — "Os cálculos de lucro não incluem impostos" → "Os cálculos de impostos são estimativas baseadas no regime tributário selecionado" (app já inclui impostos).

### Arquivos modificados/criados
- `client/src/pages/Landing.tsx` — Nova landing page com calculadora rápida
- `client/src/components/ProgressGate.tsx` — Componente de gate progressivo
- `client/src/components/Layout.tsx` — Sidebar reorganizado com agrupamento
- `client/src/pages/Home.tsx` — Progresso guiado adicionado ao dashboard
- `client/src/pages/Custos.tsx` — Aba Reservas integrada
- `client/src/pages/Reservas.tsx` — Prop `asTab` para uso dentro de Custos
- `client/src/pages/Servicos.tsx` — ProgressGate adicionado
- `client/src/pages/Simulacao.tsx` — ProgressGate adicionado
- `client/src/pages/Relatorios.tsx` — ProgressGate adicionado + disclaimer corrigido
- `client/src/pages/Configuracoes.tsx` — Texto de armazenamento corrigido
- `client/src/App.tsx` — Roteamento Landing vs Dashboard
- `client/src/lib/store.ts` — Renomeação custo variável + migração

---

## [1.4.0] — 2026-03-17

### Segurança
- **Isolamento de dados por usuário** — Endpoints `pricing.load` e `pricing.save` agora exigem autenticação (`protectedProcedure`). O email é extraído do token JWT do usuário autenticado, não mais do input da requisição. Antes, qualquer pessoa podia acessar dados de qualquer email.
- **Seção "Contatos Cadastrados" restrita ao admin** — Antes era visível na aba Configurações para todos os usuários (retornava erro 403 ao clicar). Agora o componente só renderiza quando `user.role === 'admin'`.

### Corrigido
- **Dados de outro usuário aparecendo ao trocar de conta** — localStorage agora é resetado ao detectar troca de conta. Dados locais são limpos e recarregados do servidor para o novo usuário.
- **Tooltip "Associação Profissional"** — Removido "COFFITO" da descrição. COFFITO é o órgão federal (já coberto pelo item CREFITO acima).
- **Mensagem de confirmação por e-mail no signup** — Como a confirmação por e-mail foi desabilitada no Supabase, o signup agora redireciona direto para o app quando a sessão é criada automaticamente.

### Alterado
- **Reservas Estratégicas** — Item "Férias e 13º (provisão)" separado em dois itens independentes:
  - "Férias (provisão)" — com descrição focada em férias + 1/3 constitucional
  - "13º salário (provisão)" — com descrição focada no 13º
- Migração automática: usuários existentes com o item antigo terão ele substituído pelos dois novos.

### Arquivos modificados
- `server/routers.ts` — `publicProcedure` → `protectedProcedure`, email vem do contexto auth
- `client/src/contexts/DataContext.tsx` — Reset de dados ao trocar conta, queries sem param email
- `client/src/lib/store.ts` — Tooltip corrigido, reservas separadas, migração de dados
- `client/src/pages/Configuracoes.tsx` — Seção Contatos condicional ao admin
- `client/src/pages/Login.tsx` — Redirect automático pós-signup

---

## [1.3.0] — 2026-03-16

### Corrigido
- Labels do gráfico radar em Indicadores agora mostram texto completo

---

## [1.2.0] — 2026-03-16

### Adicionado
- Reformulação completa do modelo de precificação e UX (Stories 1.1–1.8)
- Migração de MySQL para PostgreSQL/Supabase
- Autenticação unificada com Supabase Auth (email + senha)
- Botão de login/logout no sidebar e header mobile

### Removido
- Manus OAuth substituído por Supabase Auth
- LeadGate registration substituído por login Supabase

---

## [1.1.0] — 2026-03-15

### Adicionado
- 7 melhorias de UX + cleanup de componentes não usados
- Central de Contatos unificada com filtros por origem e exportação CSV
- Campos `whatsapp` e `source` na tabela `users`

---

## [1.0.0] — 2026-03-14

### Adicionado
- Evolução Estrutural: separação formal entre Custos Operacionais, Depreciação/Amortização e Reservas Estratégicas
- Score de Saúde Financeira com 5 dimensões
- Simulação com cenários de ocupação
- Separação clara Custo vs Preço por Sessão
- Banco de dados para leads com painel admin
- Gate de cadastro, captura de leads, custos anuais com divisão automática
- Perfil Profissional com geração de relatório PDF
- Planos de tratamento (substituindo "pacotes")
