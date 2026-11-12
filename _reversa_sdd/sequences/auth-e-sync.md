# Sequência — login e sync

```mermaid
sequenceDiagram
  participant U as Profissional
  participant SPA as SPA
  participant SB as Supabase Auth
  participant API as tRPC
  participant DB as Postgres

  U->>SPA: e-mail e senha
  SPA->>SB: signInWithPassword
  SB-->>SPA: access_token
  SPA->>API: auth.me com Bearer
  API->>SB: auth.getUser(token)
  SB-->>API: user
  API->>DB: upsert users e liga leads pelo e-mail
  API-->>SPA: User
  SPA->>API: pricing.load
  API->>DB: select jsonb por ownerEmail
  API-->>SPA: data ou null
  alt sem pending local
    SPA->>SPA: merge no estado e no localStorage
  else pending local
    SPA->>SPA: ignora o corpo remoto
  end
  U->>SPA: edita um custo
  SPA->>SPA: localStorage imediato, status pending
  Note over SPA: espera 2s
  SPA->>API: pricing.save documento mais _perfil
  API->>DB: insert on conflict update
  API-->>SPA: success true
  SPA->>SPA: status synced, apaga flag pending
```

Falha de save: status `failed`, flag permanece, novo tentativa em 5s. 🟢

Logout com status não sincronizado pede `confirm` e, se a pessoa aceita sair, não chama `clearAllLocalData`. 🟢
