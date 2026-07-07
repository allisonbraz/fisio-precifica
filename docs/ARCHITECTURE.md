# FisioPrecifica — Documentação Técnica

> Calculadora de precificação inteligente para fisioterapeutas
> **Autor:** Allison Braz — FisioMind
> **URL:** https://fisio-precifica.vercel.app

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + Vite + TypeScript | 19 / 7 / 5.9 |
| UI | shadcn/ui (Radix) + Tailwind CSS | v4.1 |
| Animações | Framer Motion | 12.x |
| Gráficos | Recharts | 2.15 |
| Ícones | Lucide React | 0.453 |
| Roteamento | Wouter | 3.3 |
| Backend | Express + tRPC | 4 / 11 |
| ORM | Drizzle ORM | 0.44 |
| Banco de Dados | PostgreSQL (Supabase) | — |
| Autenticação | Supabase Auth (email+senha) | 2.99 |
| Deploy | Vercel (SPA + Serverless) | — |
| Package Manager | pnpm | 10.4 |

---

## Estrutura do Projeto

```
fisio-precifica/
├── api/
│   └── trpc.js              # Serverless function bundled (esbuild)
├── client/
│   ├── public/               # Assets estáticos
│   └── src/
│       ├── _core/hooks/      # useAuth
│       ├── components/
│       │   ├── ui/           # shadcn components (button, card, input, etc.)
│       │   ├── Layout.tsx    # Sidebar + mobile header
│       │   ├── LeadGate.tsx  # Banner para não-logados
│       │   ├── OnboardingWizard.tsx
│       │   ├── StatCard.tsx
│       │   ├── PageHeader.tsx
│       │   ├── CurrencyInput.tsx
│       │   ├── ConfirmAction.tsx
│       │   └── ErrorBoundary.tsx
│       ├── contexts/
│       │   ├── DataContext.tsx   # Estado global de precificação
│       │   └── ThemeContext.tsx  # Tema (light fixo)
│       ├── lib/
│       │   ├── store.ts         # Tipos + localStorage
│       │   ├── calculations.ts  # Cálculos financeiros
│       │   ├── alerts.ts        # Alertas e validações
│       │   ├── formatters.ts    # Formatação de moeda
│       │   ├── types.ts         # Tipos TypeScript
│       │   ├── trpc.ts          # Cliente tRPC
│       │   ├── supabase.ts      # Cliente Supabase
│       │   └── utils.ts         # Utilitários (cn, etc.)
│       ├── pages/               # 13 páginas (ver seção abaixo)
│       ├── App.tsx              # Router + providers
│       ├── main.tsx             # Entry point + tRPC config
│       └── index.css            # Tailwind + design tokens
├── server/
│   ├── _core/
│   │   ├── index.ts           # Express server (dev)
│   │   ├── context.ts         # tRPC context (auth)
│   │   ├── trpc.ts            # Procedures (public/protected/admin)
│   │   ├── env.ts             # Env vars
│   │   ├── supabase.ts        # Supabase server client
│   │   └── systemRouter.ts    # Health check
│   ├── db.ts                  # Database operations
│   ├── routers.ts             # tRPC routers
│   ├── storage.ts             # File storage
│   └── vercel-entry.ts        # Vercel serverless entry
├── drizzle/
│   └── schema.ts              # 3 tabelas: users, leads, pricing_data
├── shared/
│   └── schema.ts              # Tipos compartilhados
├── vercel.json                # Deploy config
├── vite.config.ts             # Vite config
├── drizzle.config.ts          # Drizzle config
└── package.json
```

---

## Páginas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Home | Dashboard com métricas e gráficos (pie, bar) |
| `/login` | Login | Autenticação Supabase (email+senha) |
| `/perfil` | Perfil | Dados profissionais + geração de PDF |
| `/custos` | Custos | Custos fixos (operacionais + depreciação) e variáveis |
| `/precificacao` | Precificacao | Cálculo de preço por margem % ou valor fixo |
| `/servicos` | Servicos | Tipos de serviço e planos de tratamento |
| `/simulacao` | Simulacao | Simulação what-if de preços |
| `/indicadores` | Indicadores | KPIs financeiros com radar chart e score |
| `/reservas` | Reservas | Reservas estratégicas (7 categorias) |
| `/relatorios` | Relatorios | Registros mensais e gráfico de evolução |
| `/configuracoes` | Configuracoes | Export/import/reset de dados |
| `/admin/leads` | Leads | Lista de contatos (admin only) |
| `/404` | NotFound | Página não encontrada |

---

## Autenticação

**Provider:** Supabase Auth (email + senha, confirmação desabilitada)

### Fluxo

```
Visitante → vê app em modo visualização
         → banner "Entrar / Cadastrar" (LeadGate)
         → /login (signup ou login)
         → Supabase retorna JWT
         → Token enviado via Authorization header
         → Server valida com supabase.auth.getUser()
         → Upsert user no DB
         → isRegistered = true → edição liberada
```

### Roles
- `user` — acesso normal
- `admin` — acesso a `/admin/leads` (email = `ADMIN_EMAIL`)

### Arquivos
- `client/src/lib/supabase.ts` — Cliente frontend
- `client/src/_core/hooks/useAuth.ts` — Hook de autenticação
- `server/_core/supabase.ts` — Cliente server
- `server/_core/context.ts` — Validação do token

---

## Banco de Dados

**3 tabelas PostgreSQL (Supabase):**

### users
```sql
id          SERIAL PRIMARY KEY
supabaseId  UUID NOT NULL UNIQUE
name        TEXT
email       VARCHAR(320)
whatsapp    VARCHAR(30)
loginMethod VARCHAR(64) DEFAULT 'email'
source      VARCHAR(100) DEFAULT 'supabase'
role        ENUM('user','admin') DEFAULT 'user'
createdAt   TIMESTAMP DEFAULT NOW()
updatedAt   TIMESTAMP DEFAULT NOW()
lastSignedIn TIMESTAMP DEFAULT NOW()
```

### leads
```sql
id          SERIAL PRIMARY KEY
nome        VARCHAR(255) NOT NULL
email       VARCHAR(320) NOT NULL UNIQUE
whatsapp    VARCHAR(30) NOT NULL
ip          VARCHAR(45)
userAgent   TEXT
source      VARCHAR(100) DEFAULT 'banner'
userId      INTEGER REFERENCES users(id)
createdAt   TIMESTAMP DEFAULT NOW()
```

### pricing_data
```sql
id          SERIAL PRIMARY KEY
ownerEmail  VARCHAR(320) NOT NULL UNIQUE
data        JSONB NOT NULL
createdAt   TIMESTAMP DEFAULT NOW()
updatedAt   TIMESTAMP DEFAULT NOW()
```

---

## API (tRPC)

| Endpoint | Procedure | Descrição |
|----------|-----------|-----------|
| `auth.me` | public | Retorna user autenticado ou null |
| `leads.register` | public | Registra lead (nome, email, whatsapp) |
| `leads.list` | admin | Lista leads paginados |
| `leads.exportAll` | admin | Exporta todos os leads |
| `pricing.save` | public | Salva dados de precificação (JSONB) |
| `pricing.load` | public | Carrega dados de precificação por email |
| `contacts.list` | admin | Lista unificada leads+users |
| `contacts.exportAll` | admin | Exporta contatos unificados |

---

## Estado & Sync

### DataContext

Gerencia todo o estado de precificação com ~60 métodos:

```
DadosPrecificacao {
  custosFixos[]            # Custos fixos + depreciação
  custosVariaveis[]        # Custos variáveis
  reservasEstrategicas[]   # 7 categorias de reserva
  tiposServico[]           # Tipos de atendimento
  planosTratamento[]       # Pacotes com desconto
  registrosMensais[]       # Histórico financeiro
  sessoesMeta              # Meta de sessões/mês
  margemLucro              # Margem de lucro (0-10)
  precoDefinido            # Preço fixo por sessão
  horasTrabalho            # Horas/dia
  diasUteis                # Dias úteis/mês
  sessoesporDia            # Sessões/dia
}
```

### Persistência

```
Ação do usuário
  → setState (React)
  → localStorage (imediato)
  → setTimeout 2s (debounce)
  → tRPC pricing.save (servidor)
  → PostgreSQL pricingData.data (JSONB)
```

### Carga inicial
1. localStorage (instantâneo)
2. Server sync no mount (se autenticado)
3. Server data prevalece se existir

---

## Design System

### Tema: Warm Professional — Organic Modernism

**Cores (OKLCH):**
| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` (terracotta) | oklch(0.62 0.12 45) | Botões, CTAs, links |
| `--accent` (sage) | oklch(0.62 0.06 155) | Sucesso, secundário |
| `--golden` | oklch(0.75 0.10 85) | Avisos, destaques |
| `--background` (cream) | oklch(0.97 0.008 85) | Fundo geral |
| `--foreground` (brown) | oklch(0.25 0.03 45) | Texto principal |
| `--destructive` | oklch(0.58 0.22 27) | Erros, exclusões |

**Tipografia:**
- Heading: `Outfit` (Google Fonts)
- Body: `Source Sans 3` (Google Fonts)
- Mono: `Fira Code`

**Border Radius:** `0.75rem` (12px) — visual orgânico

**Componentes shadcn:** button, card, input, label, textarea, dialog, alert-dialog, select, slider, switch, tabs, tooltip, progress, sonner

---

## Deploy (Vercel)

### Build
```bash
vite build                           # Frontend → dist/public/
esbuild server/_core/index.ts ...    # Backend dev → dist/
esbuild server/vercel-entry.ts ...   # Serverless → api/trpc.js
```

### vercel.json
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist/public",
  "functions": {
    "api/trpc.js": { "memory": 256, "maxDuration": 30 }
  },
  "rewrites": [
    { "source": "/api/trpc/:path*", "destination": "/api/trpc" },
    { "source": "/((?!api|assets|.*\\.).*)", "destination": "/index.html" }
  ]
}
```

### Env Vars Necessárias
```
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
ADMIN_EMAIL=allisonbraz@gmail.com
```

> `VITE_*` são injetadas no build-time. As demais são server-side.

---

## Cálculos Financeiros

Todas as funções em `client/src/lib/calculations.ts`:

| Função | Descrição |
|--------|-----------|
| `calcularTotalCustosOperacionais()` | Soma custos fixos (exceto depreciação) |
| `calcularTotalDepreciacao()` | Soma depreciação (bloqueada se financiamento ativo) |
| `calcularTotalCustosVariaveis()` | Soma custos variáveis |
| `calcularTotalReservas()` | Soma reservas estratégicas |
| `calcularCustoTotalMensal()` | Fixos + Variáveis /mês |
| `calcularCustoTotalPorSessao()` | Custo mensal ÷ meta sessões |
| `calcularPrecoMinimo()` | Custo/sessão × (1 + margem%) |
| `calcularMargemDoPreco()` | Margem reversa a partir do preço |
| `calcularPontoEquilibrio()` | Mínimo de sessões para cobrir custos |
| `calcularValorHora()` | Preço/sessão ÷ duração |
| `calcularPrecoServico()` | Preço base × multiplicador + adição |
| `calcularPrecoPlano()` | Sessões × preço unitário - desconto |
| `simularPreco()` | Análise what-if completa |

**Frequência:** custos anuais são divididos por 12 automaticamente.
