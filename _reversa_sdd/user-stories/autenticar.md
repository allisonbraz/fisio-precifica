# Entrar e ser reconhecido

Como visitante, quero criar uma conta com e-mail e senha e, na próxima request, ser a mesma linha de `users` ligada aos leads do mesmo e-mail.

## Critérios

```gherkin
Dado um JWT válido
Quando chamo auth.me
Então o servidor faz upsert por supabaseId
E devolve o papel admin somente se o e-mail é exatamente ADMIN_EMAIL

Dado um JWT ausente ou rejeitado
Quando chamo pricing.load
Então a resposta é não autorizada com a mensagem Please login (10001)
```

Rastreio: `autenticacao/`. 🟢
