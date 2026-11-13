# Telas e fluxos

> Visor adaptado. Não houve screenshot. A descrição vem dos componentes e pode errar detalhe visual (espaçamento, cópia menor). A estrutura de rotas e os gates estão 🟢.

## Mapa de rotas

🟢 `client/src/App.tsx`.

| Rota | Quem vê | Componente |
|------|---------|------------|
| `/login` | todos | Login |
| `/privacidade`, `/termos` | todos | Legal |
| qualquer outra, sem user e com loading falso | visitante | Landing (substitui o miolo) |
| `/` | autenticado | Home |
| `/custos` | autenticado | Custos (4 abas, a última é Reservas) |
| `/precificacao` | autenticado | Precificação |
| `/servicos` | autenticado | Serviços e planos |
| `/simulacao` | autenticado | Simulação |
| `/indicadores` | autenticado | Indicadores |
| `/relatorios` | autenticado | Relatórios mensais |
| `/reservas` | autenticado | redirect duro para `/custos` |
| `/configuracoes` | autenticado | Import, export, reset, status de sync |
| `/perfil` | autenticado | Cartão profissional |
| `/admin/leads` | autenticado; a página deve se proteger, o menu só aparece para admin | Leads / contatos |
| resto | autenticado | NotFound |

O loading de `auth.me` mostra o layout autenticado por um instante mesmo sem user, porque o desvio para a landing exige `!loading && !user`. 🟢 linha 38. 🟡 flash de layout.

## Fluxo do visitante

1. Abre o site sem sessão → landing.
2. Hero, prova e calculadora rápida (custo mensal, sessões, margem 5–60%).
3. Resultado simplificado e link `wa.me` com o texto do preço. 🟢
4. "Entrar / Cadastrar" → `/login`.
5. Login, cadastro (nome, e-mail, senha mínima 6) ou reset.
6. Sessão pronta → `/` e `auth.me` invalidado.

## Fluxo guiado de quem entrou

1. Onboarding em 4 passos, se a flag local não existir: boas-vindas → custos → precificação → indicadores.
2. Sidebar Essencial: Painel, Custos, Precificação, Indicadores.
3. Ferramentas: Serviços, Simulação, Relatórios.
4. Rodapé: Meu Perfil, Configurações. Admin ganha Contatos.
5. ProgressGate nas ferramentas, se não houver custo com valor ou `precoDefinido`, avisa sem bloquear.

## Custos

Abas: operacionais, depreciação, variáveis, reservas. Dá para incluir linha, editar valor e frequência, zerar uma linha ou zerar o grupo. Depreciação tem toggle de parcela ativa; com parcela, a UI diz que a depreciação está bloqueada. 🟢 `Custos.tsx`.

Reservas aceitam modo fixo ou percentual. 🟢 a página `Reservas.tsx` é embutida na aba.

## Precificação

Mostra piso, sustentável e estratégico (`useMetrics`). A pessoa mexe na margem **ou** no preço; um recalcula o outro (teto de 80% quando o preço é que manda). Parâmetros de agenda: horas, dias úteis, sessões por dia, duração. Regime tributário aplica a alíquota sugerida. Preço vindo da simulação (entre R$ 30 e R$ 9.999) pede confirmação. 🟢

## Serviços

Lista os tipos com preço = estratégico × multiplicador + custo adicional. Planos aplicam desconto percentual sobre quantidade × preço do serviço. Dá para remover serviço e plano. 🟢

## Simulação

Varia o preço e mostra `simularPreco` e o ponto de equilíbrio. Pode devolver a pessoa à precificação com o preço candidato. 🟢 a existência da ponte na precificação; 🟡 o formato exato da query não foi copiado nesta ficha além do intervalo 30–9999.

## Indicadores e painel

Cards de ocupação, equilíbrio, valor-hora, lucro. O painel usa o hook ancorado no estratégico. Há gráfico (Recharts), inclusive radar que um commit antigo corrigiu para mostrar rótulos completos. 🟡 detalhe visual do radar não reaberto pixel a pixel.

## Relatórios

Lançamento mensal simples (sessões, receita, custos, notas) ou completo (linhas de serviços e planos vendidos). Lista, edita, apaga. Não recalcula o preço. 🟢

## Perfil

Campos do cartão, máscara de WhatsApp, compartilhamento. Grava no estado de perfil, que sobe no `_perfil` do JSON. 🟢

## Configurações

Exporta o `DadosPrecificacao` em JSON, importa se houver `custosFixos` e `custosVariaveis`, reseta para o default. Mostra o status de sync. Link para a política. 🟢

## Contatos (admin)

Busca, badges de origem, WhatsApp, Instagram vindo do perfil, exportação, modal de trocar e-mail. 🟢 `Leads.tsx`.

## Logout

Botão no layout. Tenta `syncNow` se ainda não está `synced`. Se falhar, `window.confirm`. Sair com dados sujos preserva o localStorage. Sair limpo apaga as chaves locais. 🟢
