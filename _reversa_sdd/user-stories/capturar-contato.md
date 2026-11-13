# Capturar contato

Como visitante da landing, o produto pede conta em vez do formulário antigo de lead. O procedimento `leads.register` continua no servidor para quem ainda o chamar, com consentimento obrigatório.

## Critérios

```gherkin
Dado nome, e-mail, WhatsApp e marketingConsent true
Quando leads.register é chamado dentro do limite
Então o e-mail fica único
E um segundo envio atualiza nome, WhatsApp e source

Dado o mesmo e-mail depois faz login
Quando o contexto faz upsert
Então leads.userId aponta para users.id
```

O banner atual não chama `leads.register`. Ele manda para `/login`. 🟢 `LeadGate.tsx`. 🟡 se algum cliente externo ainda usa o procedimento.

Rastreio: `contatos/`.
