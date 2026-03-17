# Changelog — FisioPrecifica

Todas as mudanças relevantes do projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

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
