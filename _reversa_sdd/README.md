# Especificações Reversa — FisioPrecifica

Contratos operacionais do app **FisioPrecifica** (`fisio-pricing`), extraídos do código em 12/11/2026 para um agente de IA evoluir o sistema sem redescobrir as regras no fonte.

Idioma: **pt-BR**. Nível: **completo**. Organização: **por feature** (`granularity = feature`).

Escala de confiança, em toda afirmação que importa:

| Marca | Significado |
|-------|-------------|
| 🟢 CONFIRMADO | Lido no código, com arquivo e linha quando a regra é sensível |
| 🟡 INFERIDO | Deduzido de padrão, nome ou histórico; pode estar errado |
| 🔴 LACUNA | O código não decide; precisa de validação humana |

## Como o Reversa rodou

O [Reversa](https://github.com/sandeco/reversa) (Macedo & da Costa) **não possui um analisador que emite estas specs sozinho**. O CLI (`npx reversa install`) só copia skills para `.agents/skills/`, cria `.reversa/` e um arquivo de engine (`.cursorrules` / `AGENTS.md`). A análise é feita pelo agente que já está no ambiente, seguindo Scout → Archaeologist → Detective → Architect → Writer → Data Master → Design System.

Nesta sessão o método e os templates (`requirements.md`, `design.md`, `tasks.md`, artefatos transversais, escala 🟢🟡🔴) foram **aplicados manualmente**. Motivos:

1. O install é interativo e escreveria configuração (`.cursorrules`, `.agents/skills/`, `.reversa/`). A encomenda pede só documentação, sem alterar código, config ou dependências do app.
2. Não há modo `npx reversa analyze` que gere `_reversa_sdd/` sem um agente.
3. O Visor oficial parte de screenshots. As telas abaixo foram lidas dos componentes React, não de capturas. 🟡

A pasta de saída é a padrão do framework: `_reversa_sdd/`. Nenhum arquivo fora dela foi modificado.

Entrevista única (modo autônomo, respostas já dadas pelo pedido):

| Decisão | Valor |
|---------|--------|
| Projeto | FisioPrecifica |
| Idioma das specs | Português (pt-BR) |
| `doc_level` | `completo` — o pedido pede fórmulas, fluxos, modelo, API, C4 e extração de pacote |
| Organização | `feature` — as features de produto são a unidade que um agente consegue reimplementar |
| Lacunas | Registradas em `questions.md`, sem parar a extração |

## Para que serve

O FisioPrecifica vai virar o **módulo de precificação** de um app de gestão de clínica (remix de um CRM de fisioterapia em React + Supabase) e, em paralelo, um pacote compartilhado `pricing-engine` com perfis para fisioterapia, fonoaudiologia e terapia ocupacional. Estas specs separam o que é regra de preço do que é casca do produto.

Um repositório irmão, **fono-precifica**, tem a função extra `calcularPrecoVendaAparelho` (venda e locação de aparelho auditivo). Isso entra aqui só como módulo futuro opcional **produtos**. Nada foi alterado para suportá-lo.

## Índice

### Síntese

| Arquivo | Agente Reversa | Conteúdo |
|---------|----------------|----------|
| [soul.md](soul.md) | Soul Extractor | Propósito, entidades e decisões fundadoras |
| [confidence-report.md](confidence-report.md) | Reviewer | Contagem de confiança e veredito |
| [gaps.md](gaps.md) | Reviewer | Lacunas e problemas conhecidos, inclusive o CI |
| [questions.md](questions.md) | Reviewer | Perguntas para validação humana |

### Superfície e código

| Arquivo | Agente | Conteúdo |
|---------|--------|----------|
| [inventory.md](inventory.md) | Scout | Pastas, linguagens, entry points |
| [dependencies.md](dependencies.md) | Scout | Dependências com versão |
| [code-analysis.md](code-analysis.md) | Archaeologist | Módulos, fluxos e estruturas |

### Negócio

| Arquivo | Agente | Conteúdo |
|---------|--------|----------|
| [domain.md](domain.md) | Detective | Glossário, **todas as fórmulas** e premissas |
| [state-machines.md](state-machines.md) | Detective | Sessão, sync, onboarding, registro mensal |
| [permissions.md](permissions.md) | Detective | Matriz de papéis |
| [adrs/](adrs/) | Detective | Decisões retroativas |

### Arquitetura

| Arquivo | Agente | Conteúdo |
|---------|--------|----------|
| [architecture.md](architecture.md) | Architect | Visão, dívidas, costura com o CRM futuro |
| [c4-context.md](c4-context.md) | Architect | C4 contexto |
| [c4-containers.md](c4-containers.md) | Architect | C4 containers |
| [c4-components.md](c4-components.md) | Architect | C4 componentes |
| [erd-complete.md](erd-complete.md) | Architect | ERD com o JSON de precificação |
| [database/](database/) | Data Master | Dicionário, relações, regras no banco |
| [design-system/tokens.md](design-system/tokens.md) | Design System | Tokens oklch e tipografia |
| [ui/telas.md](ui/telas.md) | Visor (adaptado) | Telas e fluxos a partir do código |
| [flowcharts/preco-estrategico.md](flowcharts/preco-estrategico.md) | Writer | Fluxo da fórmula |
| [sequences/auth-e-sync.md](sequences/auth-e-sync.md) | Writer | Sequência JWT + sync |

### Contratos por feature

Cada pasta tem `requirements.md`, `design.md` e `tasks.md`.

| Pasta | O que um agente reimplementa |
|-------|------------------------------|
| [motor-de-precos/](motor-de-precos/) | Funções puras de preço, alertas e métricas |
| [autenticacao/](autenticacao/) | Supabase Auth, JWT no tRPC, papéis |
| [sincronizacao/](sincronizacao/) | localStorage, debounce, pending, logout |
| [api/](api/) | Procedimentos tRPC |
| [interface/](interface/) | Rotas, telas e gates |
| [contatos/](contatos/) | Leads e central administrativa |
| [extracao-pricing-engine/](extracao-pricing-engine/) | O que mudar para o pacote compartilhado e o módulo do CRM |

### API, histórias e rastreio

| Arquivo | Conteúdo |
|---------|----------|
| [openapi/trpc-procedures.yaml](openapi/trpc-procedures.yaml) | Catálogo dos procedimentos (não é REST) |
| [user-stories/](user-stories/) | Histórias dos fluxos principais |
| [traceability/code-spec-matrix.md](traceability/code-spec-matrix.md) | Arquivo → spec |
| [traceability/spec-impact-matrix.md](traceability/spec-impact-matrix.md) | Quem quebra quem |

## Ordem de leitura para o próximo agente

1. `soul.md` e `domain.md` — o que o preço significa.
2. `motor-de-precos/design.md` — contrato para reimplementar o cálculo.
3. `extracao-pricing-engine/design.md` — o que sai do app e o que fica.
4. `sincronizacao/design.md` e `api/design.md` — o que o CRM precisa continuar honrando.
5. `gaps.md` — o que não copiar sem decidir.
