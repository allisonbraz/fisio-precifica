# Matriz de impacto entre specs

Quem quebra se a linha mudar.

| Se mudar | Quebra também |
|----------|----------------|
| `motor-de-precos` fórmulas | interface (números), `useMetrics`, serviços, simulação, testes, pacote futuro |
| Unidades (fração vs 0–100) | API Zod, UI de margem, planos |
| `precoDefinido` vs estratégico | painel, serviços, alertas |
| `autenticacao` shape do User | layout admin, sync (precisa de e-mail) |
| `ownerEmail` | contatos, troca de e-mail, RLS escrita |
| `sincronizacao` debounce ou pending | logout, segunda conta na mesma aba |
| JSON sem versão | os três perfis profissionais e o CRM |
| Catálogo default | só a primeira experiência; não a fórmula |
| `leads.register` | clientes externos, se existirem; a landing atual não |
| Landing simplificada | só a expectativa de quem compara com o app logado |

O módulo futuro `produtos` (`calcularPrecoVendaAparelho`) não impacta o motor de sessão enquanto for opt-in e não alterar `DadosPrecificacao` obrigatório. No dia em que o documento ganhar linhas de produto, `sincronizacao` e o Zod de `pricing.save` mudam juntos.
