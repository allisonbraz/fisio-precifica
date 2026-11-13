# Perguntas para validação humana

Respostas não bloqueiam esta extração. Cada item está marcado 🔴 na spec correspondente.

1. **Versão do JSON.** Qual inteiro inicial de `schemaVersion` o pacote compartilhado deve exigir? O código não escolhe.
2. **Banco de produção.** `users` já está em `supabaseId uuid` ou ainda em `openId`? A migração 0001 manda conferir `information_schema` antes de aplicar.
3. **Role da `DATABASE_URL`.** Ela ignora RLS? Se sim, a autorização oficial é só o tRPC?
4. **Admin.** Trocar `ADMIN_EMAIL` deve rebaixar o admin anterior?
5. **Preço praticado vs estratégico.** O painel (`useMetrics`) e a tabela de serviços devem passar a usar `precoDefinido` quando ele for > 0?
6. **Landing.** A calculadora pública deve passar a chamar `calcularPrecoEstrategico` com imposto default, ou permanecer simplificada de propósito?
7. **Validade do plano.** Ela limita calendário, só informa, ou deve entrar no preço?
8. **Alerta de 15% e faixas de `MARGIN_BANDS`.** Qual dos dois é a política?
9. **Pró-labore.** Continua custo fixo, por cima da margem, nos três perfis profissionais?
10. **Intervalo de 10 minutos.** Vira parâmetro do perfil (fisioterapia, fono, TO podem diferir)?
11. **Consentimento.** Onde persistir `marketingConsent` e como registrar revogação? Hoje o aceite não vira coluna.
12. **Troca de e-mail.** Precisa de transação única entre Supabase Auth e as três tabelas?
13. **Módulo produtos.** Quando `calcularPrecoVendaAparelho` entrar, o preço do aparelho compõe a sessão, é linha à parte, ou os dois?
14. **CRM.** O primeiro corte do remix grava o mesmo jsonb, ou já normaliza custos?
15. **Dois profissionais na mesma clínica.** O modelo atual é um documento por e-mail. O CRM terá sala compartilhada e rateio? O motor não rateia.
16. **MEI.** Algum documento remoto ainda guarda `regimeTributario: "mei"` e precisa de migração no servidor, não só no client?
17. **Porta do README.** 5000 é intencional em algum ambiente?

Nenhuma destas perguntas foi inventada para completar texto. Cada uma corresponde a um ramo que o código deixa aberto ou a um fato que o git não prova.
