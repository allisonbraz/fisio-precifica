# Interface

## Visão Geral

SPA em Wouter com landing pública, login e um miolo autenticado de precificação. O mapa fiel está em `../ui/telas.md`. 🟢

## Responsabilidades

- Mostrar a landing quando não há sessão.
- Guiar o primeiro uso (onboarding) e lembrar a base que falta (ProgressGate) sem bloquear.
- Editar custos, preço, serviços, simulação, indicadores, relatórios e perfil.
- Esconder Contatos de quem não é admin.

## Regras de Negócio

- Edição nas telas de preço e custo exige `isRegistered` (user ou lead local). Sem isso, toast e a função volta. 🟢 amostras em `Precificacao.tsx`.
- ProgressGate olha valor > 0 e `precoDefinido > 0`, não as flags `etapasConcluidas`. 🟢
- `/reservas` redireciona para `/custos`. 🟢
- A calculadora da landing **não** usa o motor. Fórmula em `../domain.md`. 🟢
- Margem e preço na precificação se reescrevem, com teto de 80% ao derivar margem do preço, e arredondamento em centavos ao derivar preço da margem. 🟢
- Preço sugerido pela simulação só aplica se estiver entre 30 e 9999, e ainda pede confirmação. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério |
|----|-----------|------------|----------|
| RF-01 | Landing para anônimo | Must | `App.tsx` |
| RF-02 | Quatro abas de custos incluindo reservas | Must | `Custos.tsx` |
| RF-03 | Três preços visíveis e edição bidirecional | Must | `Precificacao.tsx` |
| RF-04 | Serviços e planos | Must | `Servicos.tsx` |
| RF-05 | Registro mensal simples e completo | Should | `Relatorios.tsx` |
| RF-06 | Onboarding de 4 passos, uma vez por navegador | Should | flag local |

## Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confiança |
|------|-----------|-----------|-----------|
| Acessibilidade | Alguns controles têm aria-label (slider da landing, overlay do menu) | amostras | 🟡 cobertura não auditada tela a tela |
| UX | `MotionConfig reducedMotion="user"` | `App.tsx` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um visitante sem sessão
Quando abre /precificacao
Então vê a landing, não o formulário de preço

Dado um profissional com custo preenchido e precoDefinido 0
Quando abre simulação
Então o ProgressGate aparece e a página continua utilizável

Dado margem alterada para 20
Quando o handler roda com meta viável
Então precoDefinido recebe o estratégico arredondado em 2 casas
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Custos e precificação | Must | Caminho do onboarding |
| Relatórios e indicadores | Should | Não bloqueiam o preço |
| Tema escuro completo | Could | Há ThemeContext; o default é light |

## Rastreabilidade de Código

| Arquivo | Cobertura |
|---------|-----------|
| `client/src/App.tsx` | 🟢 |
| `client/src/components/Layout.tsx` | 🟢 |
| `client/src/pages/*.tsx` | 🟢 rotas; 🟡 detalhe visual de Indicadores, Perfil e Legal |
