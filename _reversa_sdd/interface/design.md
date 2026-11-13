# Interface, Design Técnico

## Interface

Rotas em `../ui/telas.md`. Navegação em três grupos no `Layout`: essencial, ferramentas, rodapé, mais admin.

Tema: tokens em `../design-system/tokens.md`.

## Fluxo Principal

Visitante → landing → login → painel → custos → precificação → serviços ou indicadores.

## Fluxos Alternativos

- **LeadGate:** faixa fixa se não há user. Some para autenticado. Não coleta mais o formulário de lead. 🟢
- **Onboarding:** modal até a flag ou até pular.
- **Simulação → precificação:** grava um preço candidato; a precificação confirma.

## Dependências

- `DataContext`, `useAuth`, motor, componentes shadcn.

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Landing substitui o router interno quando não há user | `App.tsx` | 🟢 |
| Reservas deixaram de ser rota | redirect | 🟢 |
| Sidebar 260px | `Layout.tsx` | 🟢 |

## Estado Interno

Estado de tela (passo do onboarding, aba, diálogo) é local do componente. O documento é do contexto. 🟢

## Observabilidade

Toasts sonner. Sem analytics de página no código. 🟢 ausência.

## Riscos e Lacunas

- 🟡 Flash do layout durante `auth.me`.
- 🟢 Comentário antigo no topo de `Home.tsx` descreve o modelo anterior.
- 🔴 Texto legal não foi transcrito. Quem evoluir a política deve ler `Legal.tsx`, não esta spec.
