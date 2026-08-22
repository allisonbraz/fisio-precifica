# Product Context — FisioPrecifica

> Source of truth que `/impeccable` lê em todos os comandos. Mantenha curto, denso, opinativo.

## Product

FisioPrecifica é uma **calculadora estratégica de precificação para fisioterapeutas autônomos** brasileiros. Ajuda o profissional a sair do "chute" e construir um preço por sessão baseado em custos reais, regime tributário, reservas estratégicas e margem sobre receita (DRE-consistente). Web app (React 19 + Vite + Tailwind 4 + shadcn/ui + tRPC + Supabase + Postgres + Drizzle), deploy Vercel. https://fisio-precifica.vercel.app/

**Tagline:** "O preço justo, baseado nos seus números — não no chute."

## Surface type

**Product** (app UI interno). Há também uma **landing pública** (marketing de captação de leads com calculadora rápida de 3 campos) — tratar landing como **brand** no tom, mas reutilizar o mesmo design system do produto.

## Personas

- **Lucas (primária, 26, recém-formado):** atende em casa, cobra R$80-120 "porque todo mundo cobra". Não sabe quanto custa atender. Tem medo de aumentar e perder pacientes.
- **Roberto (secundária, 41, experiente):** consultório próprio, 15 anos de coluna. Fatura bem, sobra pouco. Quer provar que pode subir sem perder cliente.
- **Dona de clínica pequena/média:** precisa ratear custo de recepção, equipamento, aluguel entre profissionais.

Ambos compartilham: **não têm formação financeira**, acham planilha "chata", e **querem uma resposta clara em vez de mais uma teoria**.

## Goals (do produto)

1. Mostrar ao usuário o **preço mínimo por sessão** baseado nos custos dele — não em média de mercado.
2. Persuadir com **números honestos** (hierarquia DRE real: Receita Bruta → Impostos → Custos Operacionais → Reservas → Lucro Disponível).
3. Gerar mensalmente um **registro de saúde financeira** (break-even, ocupação, valor/hora).
4. Permitir **simular cenários** (e se eu subir 20%? e se eu atender mais 2 pacientes/dia?).
5. Captar leads pela landing com calculadora rápida de 3 campos → converter para o app pago.

## Non-goals

- ❌ Não é prontuário, agenda clínica, ERP, sistema fiscal/NF.
- ❌ Não emite DRE contábil oficial.
- ❌ Não é curso de marketing.
- ❌ Não substitui contador.

## Voice & tone

- **Educacional, não opinativo.** Nunca diz "cobre R$200". Mostra o cálculo e explica.
- **Direto, sem jargão desnecessário.** "Quanto sobra por hora trabalhada" vence "EBITDA por hora produtiva".
- **Confiante e empático**, não corporativo. O profissional precisa confiar que **alguém do lado dele** está calculando.
- **Brasileiro informal-profissional.** Pode usar "você", "tá", "pra". Nunca "tu".
- **Sem clichê de coach:** nada de "você merece", "liberdade financeira", "hack", "fórmula secreta".
- **Sem urgência artificial:** sem "última chance", "garanta já", cronômetro regressivo.

## Anti-references

Tudo que **pareça** um SaaS genérico / IA-template / "Notion clone" / "Stripe clone":

- ❌ **Inter** (e qualquer fonte overused tipo SF Pro, Roboto, Arial). Estamos em Outfit + Source Sans 3 — manter.
- ❌ **Gradientes roxo→azul**, glow escuro, glassmorphism, "AI-gradient".
- ❌ **Cards dentro de cards**, hero com card flutuante sobre foto genérica de reunião.
- ❌ **Ícone quadrado arredondado** acima de todo heading.
- ❌ **Texto cinza sobre fundo colorido** — sempre texto tinted (`text-primary-foreground`/`text-foreground`).
- ❌ **Easing bounce/elastic**, transições exageradas.
- ❌ **Mockup de dashboard "fake"** na landing (Lucas desconfia de números inventados).
- ❌ **"Trusted by 10.000+ empresas"** — esse produto é pra 1 profissional por vez. Sem social proof inflado.
- ❌ **Carrossel infinito de logos** na landing.
- ❌ **Copy motivacional vaga** ("Transforme sua carreira", "O futuro chegou").

## Channels

- App web autenticado (Supabase Auth) — desktop + mobile.
- Landing pública com calculadora rápida de 3 campos → captura e-mail → onboarding no app.
- Marketing via Instagram @allisonbraz (fisioterapeuta + educador financeiro) → landing.

## Pricing model (contexto de UI, não de cobrança)

3 canais de venda: (1) bônus vitalício na Mentoria Fisioterapeuta Inabalável R$1.997; (2) bundle com Curso R$297; (3) acesso direto ao app R$200/anual. UI mostra status do plano do usuário, nunca paywall agressivo dentro do app em si.

## Definition of done (do produto, não do design)

- O usuário cadastra custos fixos + variáveis + depreciação.
- Define regime tributário (Simples, Lucro Presumido, PF).
- Define reservas (emergência, férias, 13º, substituição).
- Vê preço mínimo por sessão calculado pela fórmula margem sobre receita.
- Pode simular cenários (preço, ocupação, mix de serviços).
- Vê dashboard mensal (break-even, ocupação, valor/hora, lucro disponível).
- Exporta/importa seus dados em JSON (sem lock-in).
- Funciona offline-first (localStorage → sync server).