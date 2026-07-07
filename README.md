# FisioPrecifica

Aplicação SaaS para fisioterapeutas calcularem precificação de sessões com base em custos reais, reservas estratégicas e margem de lucro.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19, Vite 7, TypeScript, Tailwind CSS 4 |
| UI | shadcn/ui (Radix), Framer Motion, Recharts, Lucide |
| Routing | Wouter |
| API | tRPC v11, SuperJSON, TanStack Query v5 |
| Auth | Supabase Auth (JWT Bearer) |
| Database | PostgreSQL, Drizzle ORM |
| Deploy | Vercel (SPA + Serverless) |
| Testes | Vitest |

## Setup

### Pré-requisitos

- Node.js 18+
- pnpm (via corepack: `corepack enable`)
- PostgreSQL
- Conta Supabase (para autenticação)

### Passos

1. **Instalar dependências:**
   ```bash
   pnpm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Preencha os valores no .env
   ```

3. **Criar/migrar banco de dados:**
   ```bash
   pnpm db:push
   ```

4. **Iniciar em modo desenvolvimento:**
   ```bash
   pnpm dev
   ```

5. **Acessar:** http://localhost:5000

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Dev server (client + API) com hot reload |
| `pnpm build` | Build de produção (Vite + esbuild) |
| `pnpm start` | Inicia servidor de produção |
| `pnpm check` | Type-check sem emitir |
| `pnpm test` | Roda testes com Vitest |
| `pnpm format` | Formata código com Prettier |
| `pnpm db:push` | Gera e aplica migrações do Drizzle |

## Estrutura

```
fisio-precifica/
├── client/              # React SPA
│   └── src/
│       ├── components/  # Componentes UI (shadcn + custom)
│       ├── contexts/    # DataContext, ThemeContext
│       ├── hooks/       # Custom hooks
│       ├── lib/         # Lógica de negócio, tipos, store, cálculos
│       └── pages/       # Páginas da aplicação
├── server/              # Express + tRPC backend
│   ├── _core/           # Infraestrutura (context, env, supabase, vite)
│   ├── db.ts            # Camada de acesso ao banco
│   └── routers.ts       # Rotas tRPC
├── shared/              # Tipos e constantes compartilhados
├── drizzle/             # Schema, migrações, relations
└── patches/             # Patches pnpm (wouter)
```

## Funcionalidades

- Cadastro de custos fixos e variáveis
- Depreciação de equipamentos
- Reservas estratégicas (emergência, férias, substituição)
- Cálculo de preço mínimo por sessão (margem sobre receita)
- Simulador de cenários de preço
- Tipos de serviço e planos de tratamento
- Registros mensais com KPIs (break-even, ocupação, valor/hora)
- Dashboard com relatórios financeiros
- Landing page com calculadora rápida (captura de leads)
- Painel admin unificado de contatos
