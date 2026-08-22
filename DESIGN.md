# Design System — FisioPrecifica

> Especificação visível e opinativa. Tudo que `/impeccable audit|polish|critique` deve validar contra esta lista.

## Brand positioning

FisioPrecifica é um **app financeiro para um profissional sozinho**, não uma plataforma SaaS B2B. O visual precisa parecer um **caderno de planejamento sério**, aberto, com marcações à mão e tabelas limpas — não um dashboard corporativo, não uma "fintech colorida" (sem laranja-rosa roxo-genérico, sem ícones de dinheiro feliz).

Referências visuais permitidas (apenas como clima, não para copiar): planilha bem feita de contador, caderno Moleskine aberto em página de orçamento, app de Notion em modo "minimal", newsletter do Tortoise & Hare. **Não** se parece com: Stripe, Linear, Vercel, Notion AI, ChatGPT, ou qualquer dashboard de "AI startup".

## Color system (já em `client/src/index.css`, manter)

Paleta única, **toda em oklch**, **dois eixos** de hue: 45 (terracota/laranja queimado = dinheiro real, terra, "mão na massa") e 155 (sage/verde-oliva = saúde, crescimento, "respiro").

| Token | oklch | Uso |
|---|---|---|
| `--primary` | `0.62 0.12 45` | CTA, marca, números-chave (preço calculado). |
| `--accent` | `0.62 0.06 155` | Positivo: lucro, break-even atingido, "saudável". |
| `--destructive` | `0.58 0.22 27` | Negativo: prejuízo, reserva estourada, alerta. |
| `--background` | `0.97 0.008 85` | Fundo da página (off-white quente). |
| `--card` | `0.995 0.002 85` | Cards (mais branco que o fundo, sutil). |
| `--foreground` | `0.25 0.03 45` | Texto principal (tintado, nunca preto puro). |
| `--muted-foreground` | `0.50 0.02 45` | Texto secundário (também tintado). |
| `--border` | `0.90 0.01 85` | Bordas (1px, sutis). |

**Regras:**

- ❌ Nunca usar `#000` ou `#fff` puros — sempre tinted (foreground = 0.25, muted = 0.50).
- ❌ Nunca texto cinza sobre fundo `--primary` ou `--accent` — usar `*-foreground` (sempre branco-quente).
- ❌ Nunca gradiente roxo→azul. O único gradiente aceitável é o `text-gradient` terracota→sage já em uso.
- ✅ Ok usar fundo creme (`background`) com cards brancos; isso reforça a estética "papel".
- ✅ Ok usar `--accent` (sage) para variações sutis (ex.: "saudável" / "atingido") em vez de só verde CSS genérico.

## Typography

Duas famílias. **Não adicionar Inter, Roboto, SF Pro, system-ui sem fallback explícito.**

| Função | Família | Fonte |
|---|---|---|
| Headings (h1–h6) | `Outfit` | geométrica humanista, peso 400/600/700 |
| Body, UI | `Source Sans 3` | humanista, peso 400/500/600 |
| Mono / números em tabela | `Fira Code` | apenas para código ou IDs, **não** para valores monetários |

**Hierarquia (escala base 1.250, major-second):**

- h1: 2rem / 1.2 / 700, tracking -0.01em
- h2: 1.5rem / 1.25 / 600
- h3: 1.25rem / 1.3 / 600
- body: 1rem / 1.55 / 400
- small: 0.875rem / 1.5 / 400
- caption: 0.75rem / 1.4 / 500, uppercase opcional, tracking +0.02em

**Regras:**

- Linhas de corpo: máx 65–75 caracteres (β=70).
- Números monetários grandes: usar `font-variant-numeric: tabular-nums` e peso 600.
- NUNCA headings em uppercase.
- NUNCA `font-weight: 900` ou extrablack.

## Layout & spacing

Escala de espaçamento **4px base** (multiplos: 4, 8, 12, 16, 24, 32, 48, 64, 96). Usar tokens Tailwind (`gap-2`, `p-4`, `py-6`, etc.).

- Container máx: `1280px`, padding lateral `1rem / 1.5rem / 2rem` (mobile / sm / lg+).
- Grid de dashboard: 12 colunas, gap 16px em desktop, 12px em mobile.
- Cards: padding interno `p-6` (24px), `rounded-xl` (12px), sombra `sm` (nunca glow).
- Sidebar: 240px desktop, drawer mobile.

**Regras anti-slop:**

- ❌ Cards aninhados (card dentro de card). Se precisar de agrupamento, usar **separador** (`<Separator />` ou `border-t`) e tipografia.
- ❌ Toda seção como card flutuante sobre fundo cinza. A página deve ter **uma superfície**, com cards quando fizer sentido.
- ❌ Padding generoso sem propósito (`py-24` só porque sim).
- ✅ Usar **linha de base visual** consistente: títulos de seção com `mb-6`, label de campo com `mb-2`.

## Components

- **Button** (shadcn) — variantes: `default` (primary), `secondary` (bg muted), `outline` (border), `ghost`, `destructive`. Sem variante "gradient".
- **Input / NumberInput** — borda `border-input`, foco `ring-ring/50`, **altura mínima 40px** (touch target).
- **Card** — usado para agrupar **uma decisão** ou **um conjunto de métricas**. Não para embrulhar texto corrido.
- **StatCard** — número grande (≥2rem) + label pequeno (`caption`), variação positiva em `--accent`, negativa em `--destructive`. **Sem** ícone decorativo obrigatório.
- **Table** — para listagens longas (custos, serviços, registros mensais). Zebra suave (`even:bg-muted/30`).
- **Empty state** — ícone **opcional** (lucide), título curto (1 linha), 1 frase explicando o que fazer, 1 botão. **Sem** ilustração stock.
- **Toast/Sonner** — sucesso em sage, erro em destructive. Não usar toast motivacional.

## Iconography

**Lucide** apenas. Sem emoji em UI. Sem ícone quadrado-arredondado acima de heading (anti-pattern detectado).

Tamanho: `h-4 w-4` inline, `h-5 w-5` em botão, `h-6 w-6` em destaque. **Nunca** acima de 32px sem propósito claro.

## Motion

Framer Motion ok, mas com parcimônia:

- **Easings permitidos:** `ease-out` (entrada), `ease-in-out` (reordenação). Nada de `bounce`, `elastic`, `back`.
- **Duração padrão:** 150–250ms. Nunca >400ms para UI.
- **Usar motion para:** transições de página (fade 150ms), accordion/collapsible, hover sutil (translate-y-0.5 em cards clicáveis), toast.
- **Não usar motion para:** scroll-triggered reveal, parallax, "wow" genérico.

## Responsiveness

- **Mobile-first.** Lucas atende paciente no celular entre consultas.
- Breakpoints: `sm 640 / md 768 / lg 1024 / xl 1280`.
- Tabelas viram cards em `<md`.
- Sidebar vira drawer com backdrop.
- Touch target mínimo: 40×40px (regra de dedo).

## Accessibility

- Contraste mínimo 4.5:1 para body, 3:1 para heading ≥18px.
- Foco visível (`outline-ring/50`).
- Labels em todo input (não só placeholder).
- Live region para toasts/alertas financeiros.

## Content patterns

- **Números monetários:** `R$ 1.234,56` (Intl pt-BR). Sempre 2 casas quando for valor monetário. 0 casas para inteiros (ex.: "R$ 1.500").
- **Percentuais:** `12,5%` com vírgula.
- **Datas:** `21 ago 2026` ou `21/08/2026` em tabela — **não** "August 21, 2026".
- **Labels de seção:** português, sem artigo indefinido. "Custos fixos", não "Os custos fixos".
- **CTAs:** verbo no infinitivo. "Calcular preço", "Cadastrar custo", "Exportar dados". Não "Clique aqui".

## Don'ts (resumo para `/impeccable audit`)

- ❌ Inter / Roboto / Arial / SF Pro
- ❌ Gradientes roxo→azul, glow escuro, glassmorphism
- ❌ Cards aninhados, ícones quadrados sobre heading
- ❌ Texto cinza sobre fundo colorido
- ❌ Easing bounce/elastic
- ❌ Mockup de dashboard "fake" na landing
- ❌ "Trusted by N+", social proof inflado
- ❌ Headings em uppercase
- ❌ Mock data sem disclaimer explícito
- ❌ Stock photo de pessoa sorrindo com estetoscópio
- ❌ Tailwind `bg-gray-500` ou `text-gray-500` puros (sempre tinted via tokens)