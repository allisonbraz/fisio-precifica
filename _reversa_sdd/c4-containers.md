# C4 — Containers

```mermaid
C4Container
  title Containers do FisioPrecifica

  Person(profissional, "Profissional")

  Container_Boundary(vercel, "Vercel") {
    Container(spa, "SPA React", "Vite, React 19, Wouter", "Telas, motor de preço, localStorage")
    Container(api, "API tRPC", "Express na função api/trpc.js", "Authz, leads, save/load do JSON")
  }

  ContainerDb(db, "PostgreSQL", "Supabase Postgres", "3 tabelas")
  Container_Ext(auth, "Supabase Auth", "GoTrue", "JWT")
  Container_Ext(sentry, "Sentry", "SaaS", "Erros")

  Rel(profissional, spa, "HTTPS")
  Rel(spa, api, "POST /api/trpc, batch, SuperJSON, Bearer", "HTTPS")
  Rel(spa, auth, "signIn, signUp, getSession", "HTTPS")
  Rel(api, auth, "auth.getUser(jwt)", "HTTPS")
  Rel(api, db, "Drizzle, DATABASE_URL", "SQL")
  Rel(spa, sentry, "DSN do browser")
  Rel(api, sentry, "DSN do servidor")
```

No desenvolvimento, SPA e API nascem do mesmo processo (`server/_core/index.ts` + Vite). Em produção, a Vercel separa o estático e a função. O contrato HTTP é o mesmo path `/api/trpc`. 🟢

Não há container de worker, Redis nem fila. 🟢
