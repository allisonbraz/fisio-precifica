# FisioPrecifica — Relatório de Auditoria Técnica Consolidado

**Data:** 2026-03-15
**Projeto:** fisio-precifica (allisonbraz/fisio-precifica)
**Auditor:** Orion — AIOX Brownfield Discovery

---

## Sumário Executivo

| Fase | Score (1-10) | Principal achado |
|------|:------------:|------------------|
| **Arquitetura** | 5/10 | Dois entry points de servidor incompatíveis; ausência de CI/CD e testes insuficientes |
| **Dados** | 6/10 | Schema mínimo (2 tabelas), sem índices, sem RLS, dados de negócio em localStorage |
| **Frontend/UX** | 7/10 | UI polida com design system coerente, mas 70+ componentes UI não utilizados e imagem CDN hardcoded |

**Score Consolidado: 6.0/10**

---

## Fase 1: Arquitetura do Sistema

### Stack

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| **Runtime** | Node.js (ESM) | 18+ |
| **Framework Frontend** | React | 19.2.1 |
| **Framework Backend** | Express + tRPC | Express 4.21, tRPC 11.6 |
| **Roteamento** | wouter (patched) | 3.3.5 (patch aplicado em 3.7.1) |
| **Build** | Vite + esbuild | Vite 7.1.7 |
| **ORM** | Drizzle ORM | 0.44.5 |
| **DB** | MySQL | via mysql2 3.15 |
| **CSS** | Tailwind CSS v4 | 4.1.14 |
| **UI Library** | Radix UI + shadcn/ui | Múltiplos packages |
| **Package Manager** | pnpm | 10.4.1 |
| **TypeScript** | TypeScript | 5.9.3 |
| **Testes** | Vitest | 2.1.4 |
| **Auth** | OAuth via Manus SDK + jose JWT | jose 6.1.0 |

### Estrutura

```
fisio-precifica/
├── client/              # Frontend React (SPA)
│   ├── src/
│   │   ├── components/  # 12 custom + 70+ UI (shadcn)
│   │   ├── pages/       # 12 páginas
│   │   ├── contexts/    # DataContext, ThemeContext
│   │   ├── hooks/       # 3 custom hooks
│   │   └── lib/         # store.ts (660 LOC), trpc.ts, utils.ts
│   └── public/
├── server/              # Backend Express + tRPC
│   ├── _core/           # Infra (oauth, trpc, env, cookies, sdk, llm, map, etc.)
│   ├── routers.ts       # App router
│   ├── db.ts            # Database queries
│   ├── storage.ts       # S3-like storage
│   └── index.ts         # Production entry point (DIFERENTE de _core/index.ts)
├── shared/              # Tipos e constantes compartilhados
├── drizzle/             # Schema + migrations
└── patches/             # wouter patch
```

### Débitos Arquiteturais

| # | Débito | Severidade | Descrição |
|---|--------|:----------:|-----------|
| A1 | **Dois entry points de servidor** | **P1** | `server/index.ts` é um servidor estático simples (SPA serve). `server/_core/index.ts` é o real dev server com tRPC + OAuth. Em produção, o build usa `server/_core/index.ts` mas `server/index.ts` existe solto sem integração com o router de API. Possível deploy incorreto. |
| A2 | **Dados críticos em localStorage** | **P0** | TODOS os dados de precificação (custos, reservas, serviços, planos) são armazenados exclusivamente no `localStorage` do browser. Não existe persistência server-side. Limpar cache = perder tudo. Sem backup. Sem sync entre dispositivos. |
| A3 | **Sem CI/CD** | **P1** | Nenhum arquivo de pipeline (GitHub Actions, etc.). Sem lint automático, sem testes em PR, sem deploy automatizado. |
| A4 | **Testes insuficientes** | **P1** | Apenas 3 arquivos de teste no server (`auth.logout.test.ts`, `contacts.test.ts`, `leads.test.ts`). Zero testes no frontend. Zero testes de integração. |
| A5 | **Plugin Manus acoplado** | **P2** | `vite-plugin-manus-runtime` e `vite-plugin-manus-debug-collector` estão hardcoded no build. São plugins de ambiente de desenvolvimento Manus que não fazem sentido em produção ou outros ambientes. |
| A6 | **Versões flutuantes** | **P2** | Todas as dependências usam `^` (caret ranges). Em produção, isso pode causar breaks inesperados. O `pnpm-lock.yaml` mitiga parcialmente. |
| A7 | **wouter patcheado** | **P2** | Patch manual em `patches/wouter@3.7.1.patch` indica incompatibilidade não resolvida upstream. |
| A8 | **Sem environment validation** | **P2** | `ENV` object em `env.ts` usa `??` com strings vazias como fallback. Não valida presença de variáveis obrigatórias no startup. Falhas silenciosas. |
| A9 | **Dependência `add` no devDependencies** | **P3** | Package `add` (v2.0.6) provavelmente adicionado por acidente (`pnpm add add`). |
| A10 | **Lazy DB sem retry** | **P2** | `getDb()` tenta conexão uma vez e guarda null em caso de falha. Sem retry, sem health check, sem reconexão. |

---

## Fase 2: Dados

### Schema

Apenas **2 tabelas** no MySQL:

| Tabela | Colunas | PK | Unique | FK |
|--------|:-------:|:--:|:------:|:--:|
| `users` | 9 | `id` (auto) | `openId` | — |
| `leads` | 8 | `id` (auto) | — | `userId` (sem constraint formal) |

### Migrations

3 migrations Drizzle:
- `0000`: Criação da tabela `users`
- `0001`: Criação da tabela `leads`
- `0002`: Adição de `whatsapp`/`source` em users, `userId`/`source` em leads

### Débitos de Dados

| # | Débito | Severidade | Descrição |
|---|--------|:----------:|-----------|
| D1 | **Dados de negócio NÃO persistidos** | **P0** | Custos, reservas, serviços, planos, registros mensais — tudo no `localStorage`. O banco só guarda users e leads. O core da aplicação (precificação) não tem persistência real. |
| D2 | **Sem índices explícitos** | **P1** | Nenhum index definido além dos implícitos (PK, UNIQUE). Queries de leads ordenam por `createdAt` sem index. |
| D3 | **FK sem constraint** | **P1** | `leads.userId` referencia `users.id` mas sem `FOREIGN KEY` constraint no schema. Integridade referencial não garantida pelo banco. |
| D4 | **Unified contacts carrega TUDO** | **P1** | `getUnifiedContacts()` faz `SELECT *` de leads E users, depois merge em memória. Sem paginação no DB. Com 10K+ registros, causa OOM. |
| D5 | **Sem RLS/segurança de dados** | **P2** | Rotas admin protegidas por middleware tRPC, mas sem Row Level Security no banco. Acesso direto ao DB bypassa tudo. |
| D6 | **Secrets possivelmente expostos** | **P1** | `OWNER_OPEN_ID`, `JWT_SECRET`, `DATABASE_URL` são env vars sem validação de presença. Sem `.env.example`. Sem rotação de secrets. |
| D7 | **Email como chave de merge sem unique** | **P2** | `leads.email` não é unique. Múltiplos leads com mesmo email são possíveis. O merge em `getUnifiedContacts` usa `.has()` map, pegando apenas o primeiro. |
| D8 | **Sem soft delete** | **P3** | Nenhuma tabela tem campo `deletedAt`. Dados removidos são perdidos permanentemente. |

---

## Fase 3: Frontend/UX

### Inventário de Componentes

| Tipo | Quantidade | LOC estimado |
|------|:----------:|:------------:|
| **Páginas** | 12 | ~3.500 |
| **Componentes custom** | 12 (AIChatBox, CurrencyInput, DashboardLayout, ErrorBoundary, Layout, LeadGate, ManusDialog, Map, PageHeader, StatCard, etc.) | ~1.200 |
| **Componentes UI (shadcn)** | 70+ | ~5.000 |
| **Hooks** | 5 (useAuth, useComposition, useMobile, usePersistFn + useSidebar) | ~200 |
| **Contexts** | 2 (DataContext, ThemeContext) | ~400 |

### Componentes NÃO utilizados (potencial)

Os seguintes componentes UI (shadcn) estão instalados mas podem não estar em uso em nenhuma página:
- `aspect-ratio`, `carousel`, `collapsible`, `context-menu`, `drawer`, `hover-card`, `input-otp`, `kbd`, `menubar`, `navigation-menu`, `pagination`, `resizable`, `toggle-group`

### Acessibilidade (WCAG)

| Critério | Status | Detalhe |
|----------|:------:|---------|
| Contraste | Parcial | Design system usa cores sage/terracotta com bom contraste, mas não verificado formalmente |
| Keyboard nav | Parcial | Radix UI fornece keyboard nav nativa, mas páginas custom não testadas |
| Screen reader | Parcial | Labels presentes no LeadGate, mas aria-labels inconsistentes em outros componentes |
| Focus management | OK | Radix UI gerencia focus automaticamente |
| Motion | Risco | `framer-motion` usado extensivamente sem `prefers-reduced-motion` check |

### Design System

| Aspecto | Status | Detalhe |
|---------|:------:|---------|
| Tokens de cor | Implementado | Palette terracotta/sage/golden/cream via CSS custom properties |
| Tipografia | Implementado | Font heading separada, type scale consistente |
| Spacing | Consistente | Grid 4px, rounded-xl/2xl/3xl padronizados |
| Dark mode | Parcial | `ThemeProvider` existe com `defaultTheme="light"`, dark mode provavelmente suportado via Tailwind |

### Débitos Frontend

| # | Débito | Severidade | Descrição |
|---|--------|:----------:|-----------|
| F1 | **Imagem hero hardcoded de CDN temporário** | **P0** | `Home.tsx` linha 57 contém URL de imagem do `manuscdn.com` com token temporário (`Expires=1798761600`). Quando expirar, a imagem do dashboard quebra. |
| F2 | **70+ componentes UI potencialmente não utilizados** | **P2** | shadcn/ui instalou muitos componentes que não parecem estar em uso. Aumenta bundle size desnecessariamente (tree-shaking mitiga parcialmente). |
| F3 | **DashboardLayout não usado** | **P1** | `DashboardLayout.tsx` tem menu items hardcoded genéricos ("Page 1", "Page 2") e usa `useAuth()`. O app real usa `Layout.tsx` em vez dele. Código morto. |
| F4 | **Componentes Manus residuais** | **P2** | `ManusDialog.tsx`, `AIChatBox.tsx`, `debug-collector.js` são componentes do ambiente Manus que não fazem sentido em produção standalone. |
| F5 | **Sem responsividade testada** | **P2** | Classes responsive (`sm:`, `lg:`) estão presentes mas sem testes formais. Grid system usado é adequado. |
| F6 | **Sem prefers-reduced-motion** | **P2** | `framer-motion` animations em todas as páginas sem fallback para usuários que preferem reduzir motion. |
| F7 | **store.ts monolítico (660 LOC)** | **P2** | Toda lógica de negócio, cálculos, validação, formatação, alertas em um único arquivo. Dificulta teste unitário e manutenção. |
| F8 | **LeadGate bloqueia edição mas permite visualização** | **P3** | Pattern de growth hacking funcional, mas UX pode frustrar usuários mobile. Banner fixo na parte inferior consome espaço. |

---

## Consolidado: Débitos Priorizados

### P0 — Corrigir Imediatamente

| ID | Débito | Fase | Impacto |
|----|--------|:----:|---------|
| D1 | Dados de negócio em localStorage (sem persistência real) | Dados | Perda total de dados ao limpar cache |
| A2 | Duplicata de D1 — dados críticos sem backend | Arq. | — |
| F1 | Imagem hero de CDN temporário com token expirável | Front | Dashboard hero quebra quando token expira |

### P1 — Corrigir Neste Sprint

| ID | Débito | Fase | Impacto |
|----|--------|:----:|---------|
| A1 | Dois entry points de servidor incompatíveis | Arq. | Deploy confuso, possível API indisponível em prod |
| A3 | Sem CI/CD | Arq. | Zero validação automática, risco de regressão |
| A4 | Testes insuficientes (3 arquivos server-only) | Arq. | Sem cobertura frontend, sem integração |
| D2 | Sem índices em queries de leads | Dados | Performance degradada com crescimento |
| D3 | FK sem constraint (leads.userId) | Dados | Integridade referencial não garantida |
| D4 | Unified contacts sem paginação no DB | Dados | OOM com volume alto |
| D6 | Env vars sem validação | Dados | Falhas silenciosas em deploy |
| F3 | DashboardLayout código morto | Front | Confusão para desenvolvedores |

### P2 — Próximo Sprint

| ID | Débito | Fase | Impacto |
|----|--------|:----:|---------|
| A5 | Plugins Manus acoplados | Arq. | Bundle desnecessário em prod |
| A6 | Versões flutuantes | Arq. | Risco de break em install |
| A7 | wouter patcheado | Arq. | Manutenção manual de patch |
| A8 | Sem environment validation | Arq. | Startup com config incompleta |
| A10 | Lazy DB sem retry/reconnect | Arq. | Falha permanente após erro transitório |
| D5 | Sem RLS no banco | Dados | Segurança fraca |
| D7 | Email sem unique em leads | Dados | Duplicatas possíveis |
| F2 | 70+ componentes UI potencialmente não usados | Front | Bundle bloat |
| F4 | Componentes Manus residuais | Front | Código morto, confusão |
| F5 | Sem testes de responsividade | Front | UX mobile incerta |
| F6 | Sem prefers-reduced-motion | Front | Acessibilidade |
| F7 | store.ts monolítico | Front | Manutenibilidade |

### P3 — Backlog

| ID | Débito | Fase | Impacto |
|----|--------|:----:|---------|
| A9 | Dependência `add` acidental | Arq. | Limpeza |
| D8 | Sem soft delete | Dados | Dados irrecuperáveis |
| F8 | LeadGate UX em mobile | Front | Menor impacto |

---

## Roadmap Sugerido

### Sprint 1: Fundação (P0 + P1 críticos)
1. **Persistir dados de precificação no servidor** — Criar tabelas para custos, reservas, serviços, planos. API tRPC para CRUD. Migrar de localStorage para server-side com sync.
2. **Mover imagem hero para storage próprio** — Upload para S3/storage service, substituir URL hardcoded.
3. **Consolidar entry points do servidor** — Remover `server/index.ts` ou integrá-lo com o router principal.
4. **Adicionar GitHub Actions** — Lint + typecheck + vitest em PRs.
5. **Validar env vars no startup** — Fail fast se variáveis obrigatórias estiverem ausentes.

### Sprint 2: Robustez (P1 restantes + P2 críticos)
1. **Adicionar índices** em `leads.createdAt`, `leads.email`.
2. **Adicionar FK constraint** em `leads.userId → users.id`.
3. **Paginar queries** de unified contacts no DB (LIMIT/OFFSET no SQL, não em memória).
4. **Remover código morto** — DashboardLayout, ManusDialog, AIChatBox, debug-collector.
5. **Remover plugins Manus** do build de produção.
6. **Adicionar testes frontend** — Pelo menos para store.ts (lógica de cálculo).

### Sprint 3: Qualidade (P2 + P3)
1. **Refatorar store.ts** — Separar em módulos: `calculations.ts`, `alerts.ts`, `formatters.ts`, `storage.ts`.
2. **Audit de componentes UI** — Remover shadcn components não utilizados.
3. **Unique constraint em leads.email** ou dedup no insert.
4. **Adicionar prefers-reduced-motion** nos wrappers de animação.
5. **Pin de versões** (remover `^`) ou usar renovate/dependabot.
6. **Resolver wouter patch** — Verificar se versão mais recente resolve o issue.

---

## Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Total de arquivos (sem node_modules) | ~110 |
| Arquivos de código fonte | ~95 |
| Tabelas no banco | 2 |
| Migrations | 3 |
| Testes existentes | 3 arquivos (server) |
| Páginas frontend | 12 |
| Componentes UI (shadcn) | 70+ |
| Total de débitos | 26 |
| P0 (críticos) | 2 (únicos) |
| P1 (sprint atual) | 8 |
| P2 (próximo sprint) | 12 |
| P3 (backlog) | 3 |
