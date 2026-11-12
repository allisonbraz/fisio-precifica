# Tokens de design

> Design System, extraído de `client/src/index.css` e do `DESIGN.md` já existente. Os valores numéricos estão 🟢 no CSS. A intenção de marca está 🟢 no `DESIGN.md` (documento do próprio repo, não inferência desta extração).

## Posicionamento

App financeiro de um profissional sozinho. Clima de caderno de planejamento. Não é dashboard de fintech. 🟢 `DESIGN.md`.

## Cor (oklch)

| Token | Valor em `:root` | Uso |
|-------|------------------|-----|
| `--primary` | `oklch(0.62 0.12 45)` | CTA, preço |
| `--primary-foreground` | `oklch(0.98 0.005 85)` | Texto sobre primary |
| `--accent` | `oklch(0.62 0.06 155)` | Positivo, saudável |
| `--destructive` | `oklch(0.58 0.22 27)` | Prejuízo, alerta |
| `--background` | `oklch(0.97 0.008 85)` | Fundo |
| `--foreground` | `oklch(0.25 0.03 45)` | Texto |
| `--muted-foreground` | `oklch(0.50 0.02 45)` | Texto secundário |
| `--card` | `oklch(0.995 0.002 85)` | Cartão |
| `--border` / `--input` | `oklch(0.90 0.01 85)` | Borda |
| `--ring` | igual ao primary | Foco |
| `--radius` | `0.75rem` | Base |
| charts 1–5 | terracota, sage, dourado, terracota claro, sage escuro | séries |

Classes utilitárias `terracotta` e `sage` existem no tema Tailwind (`@theme inline`) e no gradiente do logo. 🟢 `index.css` e `Layout.tsx`.

Regras do `DESIGN.md` que um agente visual deve manter: sem preto ou branco puros, sem gradiente roxo-azul, único gradiente aceito é terracota→sage.

## Tipografia

| Função | Família pedida |
|--------|----------------|
| Título | Outfit 400/600/700 |
| Corpo | Source Sans 3 |
| Mono | Fira Code, não para moeda |

🟢 `DESIGN.md`. 🟡 esta extração não reabriu o `<link>` das fontes para confirmar o carregamento.

Moeda na UI passa por `formatarMoeda` → `Intl` pt-BR, BRL, 2 casas. 🟢

## Layout

Sidebar 260px no componente (`w-[260px]`). O `DESIGN.md` fala 240px. 🟢 o código; o doc de design está 20px atrás. 🟡 qual dos dois o CRM deve copiar. O código ganha até alguém atualizar o DESIGN.md.

Espaçamento em escala Tailwind de 4px. Cards com raio grande (`rounded-2xl` / `rounded-3xl` nas telas). 🟢 amostras em Layout e Landing.

## Componentes

shadcn/Radix em `client/src/components/ui/*`: button, card, dialog, alert-dialog, input, label, progress, select, slider, switch, tabs, textarea, tooltip, sonner.

Peças próprias: `CurrencyInput`, `StatCard`, `PageHeader`, `ConfirmAction`, `ProgressGate`, `LeadGate`, `OnboardingWizard`.
