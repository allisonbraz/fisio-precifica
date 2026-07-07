# PRD — FisioPrecifica

> **Documento vivo** — atualizar a cada release ou mudança estratégica relevante.
> **Última atualização:** 2026-05-01
> **Versão do documento:** 1.0
> **Autor:** Allison Braz (FisioMind)
> **Status do produto:** Em produção (https://fisio-precifica.vercel.app/)

---

## 1. Sumário Executivo

**O que é:** FisioPrecifica é uma calculadora estratégica de precificação para fisioterapeutas. Não é só uma "calculadora de preço" — é um sistema que ensina o profissional a entender seus custos reais, definir margem com base em objetivos financeiros, escolher o regime tributário correto e construir uma agenda lucrativa sem desgaste.

**Para quem:** Fisioterapeutas autônomos (iniciantes ou experientes) e donos de clínicas pequenas e médias que sabem atender, mas não sabem cobrar. Pessoas que faturam mais do que parecem e ganham menos do que mereciam.

**Por que existe:** Porque a maioria dos fisioterapeutas cobra "no chute". Não consideram custos fixos rateados, depreciação de equipamentos, reservas para férias e 13º, impostos por regime, ou sequer sabem qual é o ponto de equilíbrio do consultório. O resultado é um setor inteiro trabalhando 40-60h/semana, ganhando menos de R$8k/mês, com medo de aumentar preço.

**Como funciona:** App web (PWA-ready) com 13 telas que guiam o profissional desde o cadastro de custos até o cálculo final do preço de cada serviço, com dashboards de saúde financeira, simulações what-if e relatórios mensais. Tudo persiste por usuário (Supabase Auth + PostgreSQL), funciona em desktop e mobile.

**Modelo de negócio (3 canais de venda):**

1. **Bônus da Mentoria Fisioterapeuta Inabalável** (R$1.997) — acesso vitalício incluído
2. **Bundle com o Curso Precificação Inteligente** (R$297) — acesso + tutorial em vídeo
3. **Acesso direto ao app** (R$200, anual com renovação reduzida) — para quem quer só a ferramenta

**Stack:** React 19 + Vite 7 + tRPC 11 + Supabase (Auth + PostgreSQL) + Drizzle ORM, deploy Vercel.

**Status atual:** v2.1.0 em produção. Funcional, estável, com isolamento de dados por usuário, landing page com calculadora rápida, progresso guiado e modelo de precificação refatorado para fórmula de margem sobre receita (DRE-consistente).

---

## 2. Visão de Produto

### 2.1. Visão de longo prazo

> "Ser a ferramenta de gestão financeira mais usada por fisioterapeutas no Brasil — o passaporte de saída do amadorismo na cobrança."

### 2.2. Missão

Dar ao fisioterapeuta o controle financeiro que a faculdade não ensinou: saber exatamente quanto custa atender, quanto precisa cobrar para viver bem, e como provar isso para si mesmo com números que param em pé.

### 2.3. Princípios de produto

| Princípio | Descrição |
|-----------|-----------|
| **Educacional, não opinativo** | O app não diz "cobre R$200". Mostra os números e explica como chegamos a esse valor para o profissional decidir com consciência. |
| **Honestidade contábil** | Hierarquia DRE real (Receita Bruta → Impostos → Custos Operacionais → Reservas → Lucro Disponível). Sem "lucro fantasma". |
| **Acessível ao iniciante, profundo para o experiente** | Calculadora rápida na landing (3 campos) → app completo com 5 camadas de precificação. |
| **Funciona offline-first** | localStorage primeiro, sync server depois. Nunca trava por falta de internet. |
| **Sem lock-in** | Export/import de dados (JSON). O profissional é dono dos próprios números. |

### 2.4. Anti-positioning (o que o FisioPrecifica NÃO é)

- ❌ Não é um software de prontuário ou agenda clínica (não substitui Doutor.Vet, iClinic, etc.)
- ❌ Não é um ERP ou sistema fiscal (não emite NF, não faz DRE contábil oficial)
- ❌ Não é uma planilha "pronta" — é um sistema vivo que evolui com o profissional
- ❌ Não é um curso de marketing — é a base **financeira** sobre a qual o marketing pode ser construído

---

## 3. Personas

### 3.1. Persona Primária — "O Recém-formado Inseguro"

| Campo | Detalhe |
|-------|---------|
| **Nome fictício** | Lucas, 26 anos |
| **Contexto** | Formado há 1-3 anos, atende em casa de pacientes, ainda sem clínica própria |
| **Dor central** | Cobra R$80-120/sessão porque "é o que todo mundo cobra na minha cidade" |
| **Medo** | Aumentar preço e perder os poucos pacientes que tem |
| **Trigger de compra** | Mês fechou no vermelho mesmo trabalhando muito; viu post no Instagram do @allisonbraz |
| **Jornada esperada no app** | Calculadora rápida (landing) → choque ao ver que cobra abaixo do custo → cadastra custos → descobre preço justo → começa a aplicar gradualmente |

### 3.2. Persona Secundária — "O Experiente que Cobra Errado"

| Campo | Detalhe |
|-------|---------|
| **Nome fictício** | Roberto, 41 anos |
| **Contexto** | 15 anos de profissão, consultório próprio, especialista em coluna |
| **Dor central** | Atende muito bem, tem fila de espera, mas não sobra dinheiro no fim do mês |
| **Medo** | Descobrir que está trabalhando "de graça" há anos |
| **Trigger de compra** | Comprou a mentoria Fisioterapeuta Inabalável e ganhou o app como bônus |
| **Jornada esperada** | Cadastra custos detalhados (equipamentos, sala, secretária) → descobre que reservas estavam zeradas → reformula tabela → ajusta com pacientes existentes usando script da mentoria |

### 3.3. Persona Terciária — "A Dona de Clínica Pequena"

| Campo | Detalhe |
|-------|---------|
| **Nome fictício** | Ana, 35 anos |
| **Contexto** | Clínica com 3 fisioterapeutas (incluindo ela), 1 secretária, atende convênio + particular |
| **Dor central** | Convênio paga pouco, particular cobra preço "comparado com convênio". Não sabe o ponto de equilíbrio da clínica. |
| **Medo** | Demitir alguém ou cortar convênio sem ter certeza dos números |
| **Trigger de compra** | Viu o curso Precificação Inteligente e percebeu que precisava entender o jogo |
| **Jornada esperada** | Cadastra custos da clínica (incluindo salários e proventos) → simula cenários (cortar convênio X, aumentar particular Y) → descobre faixa segura de operação |

---

## 4. Modelo de Negócio

### 4.1. Estratégia de Distribuição (Funil)

```
TOPO — Aula Gratuita (30min, educativa + pitch)
  │
  ├── Calculadora Rápida na Landing (sem login, captura curiosidade)
  │
MEIO — Curso Precificação Inteligente (R$297)
  │   • App incluído gratuitamente
  │   • 17 aulas, 5 módulos, ~3h20
  │   • Self-service, gravado
  │
  └── Para quem quer SÓ o app: R$200 (acesso anual)
  │
TOPO PREMIUM — Mentoria Fisioterapeuta Inabalável (R$1.997)
      • App incluído como bônus vitalício
      • 12 semanas ao vivo, 30 vagas/turma
      • Métodos V.A.L.O.R.™ + AVANÇO
```

### 4.2. Canais de Venda do FisioPrecifica

| Canal | Preço | O que o cliente recebe | Justificativa |
|-------|-------|------------------------|---------------|
| **Bônus Mentoria** | R$0 (incluído em R$1.997) | Acesso vitalício + grupo + suporte direto | App é a materialização prática do método V.A.L.O.R. (pilares V e O) |
| **Bundle Curso + App** | R$297 | App por 1 ano + curso completo gravado + tutorial de uso | App sem o curso é "ferramenta sem manual"; curso sem o app é "teoria sem prática" |
| **App standalone** | R$200/ano (renovação ~R$120) | Acesso ao app + tutorial básico em vídeo | Captura quem quer só a ferramenta. Renovação reduzida porque o cliente já está educado. |

### 4.3. Lógica de Precificação dos Canais

- **Não há plano mensal.** Recorrência mensal não faz sentido para esse perfil de cliente — usa o app intensamente nos primeiros 60 dias e depois esporadicamente. Anual reduz fricção e aumenta LTV.
- **R$200 é cravado como âncora de valor.** Mais barato que a mentoria por design (justifica upsell), mais caro que uma planilha do Excel (justifica o investimento em produto).
- **Renovação reduzida (~R$120/ano)** porque o custo de aquisição já foi pago no ano 1 e a churn de quem renova tende a ser baixíssima (já reorganizou os números, não quer recomeçar).

### 4.4. Pagamento e Liberação de Acesso

**Plataforma de checkout (a definir):** Greenn ou Hotmart (provável). Decisão final pendente — ver Roadmap §8.

**Fluxo de liberação esperado:**
1. Cliente compra na plataforma (Greenn/Hotmart)
2. Plataforma dispara webhook para o backend do FisioPrecifica
3. Backend identifica o produto comprado (mentoria, curso+app, ou app standalone)
4. Cria/atualiza usuário no Supabase com flag `accessTier` e `expiresAt`
5. Email de boas-vindas com link de primeiro acesso (definir senha)

**Tiers de acesso planejados:**

| Tier | Origem | Duração | Features |
|------|--------|---------|----------|
| `mentoria` | Compra mentoria | Vitalícia | Tudo + selo "Aluno Mentoria" |
| `curso` | Compra curso+app | 1 ano (renovável) | Tudo |
| `standalone` | Compra app direto | 1 ano (renovável reduzido) | Tudo |
| `trial` | Cadastro direto sem compra | 14 dias | Tudo, depois lock soft (ver gota d'água, sem aprofundar) |
| `legado` | Usuários atuais (pré-paywall) | Vitalícia | Tudo (compromisso de não cobrar de quem já usa) |

> **Decisão pendente:** o app continuará tendo um modo "calculadora rápida" público sem login (na landing), independente do tier — isso é parte da estratégia de aquisição.

---

## 5. Estado Atual do Produto (Snapshot v2.1.0)

### 5.1. Funcionalidades em produção

#### Páginas (13)

| Rota | Página | Função |
|------|--------|--------|
| `/` | Home | Landing pública (visitante) ou Dashboard (logado) |
| `/login` | Login | Auth email+senha (Supabase) |
| `/perfil` | Perfil | Dados profissionais, geração de PDF, cartão compartilhável |
| `/custos` | Custos | Custos fixos, depreciação, variáveis + Reservas (4 abas) |
| `/precificacao` | Precificação | Cálculo de preço por margem ou valor |
| `/servicos` | Serviços | Tipos de serviço + planos de tratamento |
| `/simulacao` | Simulação | What-if de preços e cenários |
| `/indicadores` | Indicadores | KPIs financeiros + radar chart |
| `/relatorios` | Relatórios | Registros mensais + histórico |
| `/configuracoes` | Configurações | Export/import/reset de dados |
| `/admin/leads` | Leads (admin) | Lista de contatos capturados (apenas admin) |

#### Modelo de Precificação v2

**Fórmula:** `Preço = CustoTotalPorSessão / (1 - margem% - imposto%)` (margem sobre receita, DRE-consistente)

**5 camadas de preço:**
1. Custos Variáveis (por sessão)
2. Custos Fixos (rateados por sessão)
3. Reservas Estratégicas (férias, 13º, emergência)
4. Impostos (% sobre receita)
5. Margem de Lucro (% sobre receita)

**Hierarquia de Lucro (DRE):**
```
Receita Bruta
  - Impostos
= Receita Líquida
  - Custos Operacionais (fixos + variáveis)
= Lucro Operacional
  - Reservas Estratégicas
= Lucro Disponível
```

**5 regimes tributários suportados:** MEI (5%), Simples Nacional (6%), Lucro Presumido (14.33%), Autônomo PF (15%), Personalizado.

**Reservas com 2 modos:** Fixo (R$ valor/mês) ou Percentual (% da receita estimada). Circularidade resolvida via estimativa de receita pré-cálculo.

#### Métricas calculadas

- Taxa de Ocupação (sessões realizadas / capacidade)
- Ponto de Equilíbrio (sessões/mês para cobrir custos)
- Valor/Hora efetivo
- Score de Saúde Financeira (média de 5 dimensões: margem, ocupação, equilíbrio, diversificação, planos)

#### UX & Conversão

- Landing pública com Calculadora Rápida (3 campos, sem login)
- Progresso guiado no dashboard (4 etapas detectadas automaticamente)
- Gate progressivo em páginas avançadas (orienta sem bloquear)
- Cartão profissional compartilhável (Canvas API → PNG, Web Share API)
- Sidebar reorganizado em grupos (Essencial / Ferramentas / Rodapé)

### 5.2. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, Vite 7, TypeScript 5.9, shadcn/ui (Radix), wouter, framer-motion, recharts |
| Backend | Express 4 + tRPC 11, drizzle-orm 0.44 |
| Database | PostgreSQL (Supabase, pooler `aws-1-sa-east-1`) |
| Auth | Supabase Auth (email+senha, sem confirmação) |
| Deploy | Vercel (SPA + serverless function `api/trpc.js` via esbuild) |
| Styling | Tailwind CSS 4.1, design tokens OKLCH, fontes Outfit + Source Sans 3 |
| State | React Context + localStorage + sync server com debounce 2s |

### 5.3. Histórico de Releases

| Data | Release | Principais entregas |
|------|---------|---------------------|
| 2026-03-16 | Migração | MySQL → PostgreSQL/Supabase, Manus SDK → Supabase Auth, deploy Vercel funcional |
| 2026-03-17 | 1.4.0 | Refatoração modelo precificação (margem sobre receita), regime tributário, isolamento de dados por usuário, perfil expandido, cartão compartilhável |
| 2026-03-18 | 2.1.0 | Landing com calculadora rápida, progresso guiado, sidebar reorganizado, gate progressivo, reservas como aba |

### 5.4. Limitações Atuais Conhecidas

- ⚠️ **Sem paywall implementado** — todo cadastro hoje tem acesso completo
- ⚠️ **Sem login social** (Google) — apenas email+senha
- ⚠️ **Sem geração de relatório PDF** ainda (só cartão profissional PNG)
- ⚠️ **Sem histórico de versões** dos próprios dados (não dá para "voltar" depois de mexer)
- ⚠️ **Sem multi-usuário em clínica** (cada conta é isolada — clínica precisa criar 1 conta para o dono)
- ⚠️ **Sem integração com plataformas de pagamento** — toda liberação é manual hoje

---

## 6. Diferenciais Competitivos

### 6.1. Comparativo com alternativas atuais

| Alternativa | Limitação | Vantagem do FisioPrecifica |
|-------------|-----------|---------------------------|
| **Planilha do Excel** | Estática, fórmulas frágeis, não evolui, ninguém entende | Sistema vivo, fórmulas testadas, evolui com o produto, dashboards prontos |
| **"Cobrar pela média do mercado"** | Perpetua o problema setorial | Calcula com base nos SEUS custos reais |
| **Calculadoras genéricas online** | Não consideram fisioterapia, regimes tributários BR, planos de tratamento | Feita para fisioterapeuta brasileiro, com regimes BR, planos, durações reais |
| **Software de gestão clínica** (iClinic, Doutor) | Foco em prontuário/agenda, não em precificação estratégica | Foco 100% em precificação e saúde financeira |
| **Contador** | Caro mensalmente, não traduz "quanto cobrar" | Não substitui contador, mas dá ao profissional autonomia para entender o próprio negócio |

### 6.2. Diferenciais únicos (USPs)

1. **Único calculadora brasileira que considera regime tributário** (MEI, SN, LP, PF) com alíquotas reais.
2. **Hierarquia DRE-consistente** — o profissional vê Lucro Operacional separado de Lucro Disponível (sem "lucro fantasma" misturado com reservas).
3. **Reservas estratégicas em 2 modos** (fixo e percentual) — adapta-se a quem prefere "guardar X por mês" ou "guardar Y% do que entrar".
4. **Score de Saúde Financeira em 5 dimensões** — visão sistêmica, não só preço.
5. **Funciona offline-first** — localStorage prioritário, sync server em background.
6. **Construído por um fisioterapeuta para fisioterapeutas** — não é genérico.
7. **Integrado a um curso e a uma mentoria** — não é só ferramenta, é parte de um sistema de transformação.

---

## 7. Posicionamento e Mensagens de Marketing

### 7.1. Mensagem central (uma frase)

> "Pare de cobrar no chute. Saiba exatamente quanto custa atender, quanto precisa cobrar para viver bem, e prove isso com números que param em pé."

### 7.2. Mensagens de venda por canal

#### Para a aula gratuita (topo de funil)

> "A maioria dos fisioterapeutas trabalha 60 horas por semana e ganha menos do que o aluguel da sala. Não porque atende mal — atende muito bem. Mas porque cobra errado. Nesta aula gratuita, você vai entender por que isso acontece e ver na prática a ferramenta que está mudando isso."

#### Para o curso Precificação Inteligente (R$297)

> "17 aulas que você assiste no seu tempo, com a ferramenta que materializa cada lição. Em 1 fim de semana você sai com sua tabela de preços reformulada — e com a ferramenta para mantê-la viva pelo resto da carreira. Acesso vitalício à plataforma de aulas + 1 ano de FisioPrecifica."

#### Para o app standalone (R$200/ano)

> "A calculadora estratégica que substitui sua planilha do Excel. Cadastra seus custos, escolhe seu regime tributário, define sua margem, e descobre o preço justo de cada serviço. Funciona online e offline, no celular e no computador, com seus dados sincronizados na nuvem. R$200/ano. Renovação reduzida para alunos."

#### Para a mentoria (R$1.997)

> "Mentoria 1-1 ao vivo, 12 semanas, com método V.A.L.O.R. + acesso vitalício ao FisioPrecifica + ao curso completo. Não é mais uma calculadora — é a transformação de um profissional invisível em referência valorizada."

### 7.3. Frases-chave (banco de copy)

- "O contador faz seus impostos. O fisioterapeuta faz tudo o resto."
- "Você cobra pelo que vale ou pelo que tem coragem?"
- "Reservas, impostos, depreciação, ponto de equilíbrio. Quatro coisas que você não aprendeu na faculdade — e que decidem se você fecha o mês no azul."
- "Sua planilha não consegue te dizer quanto cobrar. Ela te diz quanto você cobrou."
- "Não é caro. É sub-precificado."

### 7.4. Objeções esperadas e respostas

| Objeção | Resposta |
|---------|----------|
| "É só uma calculadora, posso fazer no Excel" | Pode. Mas o Excel não vai te ensinar a separar Lucro Operacional de Lucro Disponível, não vai aplicar 5 regimes tributários, não vai te alertar quando sua margem ficar negativa, e não vai sincronizar nos seus 3 dispositivos. |
| "R$200 é caro para um app" | É 1/4 de uma sessão valorizada. Quanto você perderia em 1 ano cobrando errado? |
| "Vou ter trabalho para cadastrar tudo" | 30 minutos no início do mês. Depois roda sozinho. |
| "Eu não entendo de números" | Por isso o app foi feito. Não precisa entender — precisa cadastrar. As contas o sistema faz. |
| "Já tenho um contador" | Ótimo. O FisioPrecifica não substitui contador — substitui a planilha do Excel que ele te mandou montar. |

---

## 8. Roadmap de Evolução

### 8.1. Iniciativa 1 — Paywall e Integração com Plataforma de Pagamento (PRIORIDADE MÁXIMA)

**Objetivo:** Permitir vender o app de forma autônoma (curso, mentoria, standalone).

**Escopo (Epic candidato):**
- Decidir entre Greenn vs Hotmart (critério: taxas, qualidade do webhook, base de afiliados)
- Implementar webhook receiver no backend (`/api/webhook/payment`)
- Criar tabela `subscriptions` no schema (userId, tier, source, expiresAt, externalId)
- Implementar middleware de tier-checking nos endpoints tRPC sensíveis
- Tela de "Acesso expirado" com CTA de renovação
- Email de boas-vindas pós-compra (link mágico para definir senha)
- Email de aviso de expiração (30 dias antes, 7 dias antes, no dia)
- Painel admin para ver assinaturas, criar grants manuais (cortesia, mentoria)

**Dependências:** Decisão da plataforma; conta criada na plataforma escolhida.

**Critério de sucesso:** Cliente compra na plataforma → recebe email em <5min → consegue acessar o app sem ação manual do Allison.

### 8.2. Iniciativa 2 — Material de Marketing e Landing de Vendas

**Objetivo:** Ter uma página de vendas dedicada (separada da landing-app) que converte tráfego frio.

**Escopo:**
- Landing de vendas em `/comprar` (ou subdomínio `vendas.fisio-precifica.vercel.app`)
- Vídeo de demonstração (3-5min) — Allison usando o app na tela
- Depoimentos em texto + vídeo (mínimo 5)
- Comparativo visual com planilha do Excel
- FAQ com objeções respondidas
- Botão de checkout integrado à plataforma escolhida
- Pixel/analytics para tracking de conversão (Meta Pixel + GA4)

**Dependências:** Iniciativa 1 (paywall).

### 8.3. Iniciativa 3 — Login Social (Google)

**Objetivo:** Reduzir fricção de cadastro, especialmente em mobile.

**Escopo:**
- Habilitar Google OAuth no Supabase
- Botão "Entrar com Google" na tela de login
- Tratamento de merge de contas (se email Google = email já cadastrado)

**Esforço estimado:** Pequeno (1-2 dias). Supabase tem suporte nativo.

### 8.4. Iniciativa 4 — Geração de Relatório PDF

**Objetivo:** Cliente exportar PDF profissional com diagnóstico financeiro completo (para enviar ao contador, ao sócio, ou para guardar).

**Escopo:**
- Botão "Gerar Relatório PDF" em `/relatorios` ou `/indicadores`
- PDF com: capa, dados do profissional, custos, precificação atual, indicadores, score, recomendações
- Layout profissional (branding FisioPrecifica)
- Possível feature premium (tier acima de standalone) — a decidir

### 8.5. Iniciativa 5 — Histórico e Versionamento de Dados

**Objetivo:** Cliente conseguir "voltar" para uma versão anterior dos dados (ex: "deixei minha tabela velha, quero ver como estava 3 meses atrás").

**Escopo:**
- Snapshot mensal automático dos dados de precificação
- Tela de histórico em `/configuracoes`
- Botão "Restaurar" (com confirmação)

### 8.6. Iniciativa 6 — Multi-usuário para Clínicas (LONG-TERM)

**Objetivo:** Permitir clínica com múltiplos fisioterapeutas terem dados compartilhados, com permissões diferentes.

**Escopo:**
- Conceito de "Workspace" (clínica) com membros
- Tier `clinica` (R$X/ano por workspace, com até N membros)
- Permissões (owner, fisioterapeuta, secretária)
- Visão consolidada da clínica + visão individual por profissional

**Esforço estimado:** Grande (refactor de schema). Considerar para 2027.

### 8.7. Iniciativa 7 — Indicadores Comparativos (LONG-TERM)

**Objetivo:** Mostrar ao usuário "como você está em relação a outros fisioterapeutas similares" (anonimizado).

**Escopo:**
- Coleta opt-in de dados anonimizados
- Benchmarks por região, especialidade, tempo de carreira
- Tela de comparativo (com cuidado para não desmotivar quem está abaixo)

### 8.8. Resumo do Roadmap (priorizado)

| # | Iniciativa | Prioridade | Esforço | Quando |
|---|-----------|-----------|---------|--------|
| 1 | Paywall + Integração pagamento | 🔴 Crítica | Médio (2-3 sem) | Q3 2026 |
| 2 | Landing de vendas | 🔴 Crítica | Médio (1-2 sem) | Q3 2026 (paralelo) |
| 3 | Login Google | 🟡 Alta | Pequeno (1-2 dias) | Q3 2026 |
| 4 | Relatório PDF | 🟡 Alta | Médio (1-2 sem) | Q4 2026 |
| 5 | Histórico/versionamento | 🟢 Média | Pequeno-Médio | Q4 2026 |
| 6 | Multi-usuário clínica | 🟢 Média | Grande | 2027 |
| 7 | Indicadores comparativos | 🔵 Baixa | Médio | 2027+ |

---

## 9. Métricas de Sucesso

### 9.1. North Star Metric

**Número de fisioterapeutas com tabela de preços ativamente atualizada no app** (cadastraram custos + definiram preço + acessaram nos últimos 30 dias).

> Justificativa: medir "venda" sozinho não captura valor entregue. Medir "uso ativo" é o sinal de que o produto está cumprindo a missão.

### 9.2. KPIs do Produto

| KPI | Meta 6 meses | Meta 12 meses |
|-----|--------------|---------------|
| Usuários cadastrados (total) | 500 | 2.000 |
| Usuários ativos (último mês) | 150 | 600 |
| Compras pagas (curso+app+standalone) | 100 | 400 |
| Compras mentoria (com app como bônus) | 30 | 90 |
| NPS (Net Promoter Score) | >40 | >60 |
| Taxa de renovação anual | — | >70% |
| Churn (cancelamento/expiração sem renovar) | — | <30% |

### 9.3. KPIs Financeiros (estimativa conservadora)

> Cenário projetado para 12 meses considerando funil completo operando.

| Origem | Volume estimado | Ticket | Receita anual estimada |
|--------|----------------|--------|----------------------|
| Mentoria (R$1.997) | 90 | R$1.997 | R$179.730 |
| Curso + App (R$297) | 300 | R$297 | R$89.100 |
| App standalone (R$200) | 100 | R$200 | R$20.000 |
| Renovações app (R$120) | 50 (a partir do mês 12) | R$120 | R$6.000 |
| **Total** | | | **~R$295.000** |

> Estes números são metas/projeções, não promessas. Devem ser revisitados a cada 90 dias com dados reais.

### 9.4. Métricas Qualitativas (saúde do produto)

- Tempo médio até primeiro cálculo de preço completo (esperado: <30min)
- % de usuários que cadastram custos completos vs apenas calculadora rápida
- Volume e categoria de feedback recebido (no app, no Instagram, no grupo da mentoria)
- Casos de "antes e depois" documentados (depoimentos)

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Paywall reduz conversão de signup** | Alta | Médio | Manter calculadora rápida pública; oferecer trial 14 dias; comunicar valor antes do paywall |
| **Concorrente lança calculadora similar gratuita** | Média | Alto | Diferencial é a integração com curso/mentoria + profundidade BR; reforçar moat com conteúdo |
| **Mudança de regras tributárias (ex: reforma)** | Alta | Alto | Manter regimes como dados configuráveis; comunicação proativa quando muda |
| **Supabase fica caro com escala** | Média | Médio | Plano atual gratuito serve até ~10k MAU; planejar migração se passar disso |
| **Vercel rate limits / cold start** | Baixa | Baixo | Função serverless já otimizada; monitorar com Vercel Analytics |
| **Cliente vaza dados (LGPD)** | Baixa | Alto | Já tem RLS no Supabase, isolamento por userId. Documentar política de privacidade. Avaliar termo de uso. |
| **Greenn/Hotmart muda taxa ou política** | Média | Médio | Não amarrar exclusivo; arquitetar webhook agnóstico (mesmo endpoint serve qualquer plataforma) |
| **Churn alto na renovação anual** | Alta | Alto | Conteúdo recorrente para alunos (newsletter, atualizações do app); comunidade; renovação reduzida como incentivo |
| **Dependência operacional do Allison** | Alta | Alto | Documentação (este PRD), automação de onboarding (webhook), suporte via FAQ + email canalizado |

---

## 11. Política de Dados e Privacidade

### 11.1. Dados coletados

| Dado | Origem | Uso | Compartilhamento |
|------|--------|-----|------------------|
| Email, nome, senha | Cadastro | Auth, comunicação | Nenhum |
| Dados profissionais (CPF/CNPJ, endereço, redes) | Perfil | Geração de cartão/PDF | Nenhum |
| Custos, receitas, preços | Uso do app | Cálculos, persistência | Nenhum (isolado por userId via RLS) |
| WhatsApp, IP, UserAgent | Lead capture (legado) | Marketing direto | Nenhum |

### 11.2. Compromissos LGPD

- Dado é do usuário; export disponível em `/configuracoes`
- Direito ao esquecimento: usuário pode pedir exclusão por email
- RLS no Supabase garante isolamento (1 usuário não vê dado de outro)
- Sem compartilhamento com terceiros (analytics anonimizados ok; dados financeiros não)

### 11.3. Termos de Uso e Política de Privacidade

⚠️ **PENDENTE:** documentos formais ainda não publicados. **Tarefa para o lançamento do paywall.**

---

## 12. Apêndices

### A. Glossário

| Termo | Definição |
|-------|-----------|
| **FisioPrecifica** | O app/produto descrito neste documento |
| **Fisioterapeuta Inabalável** | Mentoria de gestão (R$1.997) que tem o FisioPrecifica como bônus |
| **Curso Precificação Inteligente** | Curso gravado (R$297) que vende o app vinculado |
| **V.A.L.O.R.™** | Método de posicionamento da mentoria (Visão, Autoridade, Linguagem, Oferta, Rotina) |
| **AVANÇO** | Método de organização interna da mentoria |
| **DRE** | Demonstração do Resultado do Exercício (estrutura contábil de lucro) |
| **Lucro Disponível** | O que sobra para o profissional depois de tudo (impostos, custos, reservas) |
| **Reserva Estratégica** | Provisão mensal para férias, 13º, emergência |
| **Tier** | Nível de acesso ao app (mentoria, curso, standalone, trial, legado) |
| **Webhook** | Notificação HTTP automática enviada pela plataforma de pagamento ao backend |

### B. Referências

- Site em produção: https://fisio-precifica.vercel.app/
- Repositório: github.com/allisonbraz/fisio-precifica
- Arquitetura técnica: `docs/ARCHITECTURE.md`
- Estrutura do curso: `docs/curso/curso-precificacao-inteligente.md`
- Stories de desenvolvimento: `docs/stories/`
- Releases: `docs/releases/`
- Changelog: `CHANGELOG.md`

### C. Contatos

- **Product Owner / Founder:** Allison Braz — allisonbraz@gmail.com
- **Instagram:** @allisonbraz
- **WhatsApp:** (64) 99627-7870

---

## Histórico do Documento

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | 2026-05-01 | Allison + @pm Morgan | Primeira versão consolidada do PRD |

---

*Documento mantido por Allison Braz (FisioMind) com suporte do agente PM Morgan (AIOX framework).*
