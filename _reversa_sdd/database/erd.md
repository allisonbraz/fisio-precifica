# ERD do banco

O desenho normativo com o JSON expandido está em `../erd-complete.md`. Este arquivo existe porque o Data Master entrega `database/erd.md`.

```mermaid
erDiagram
  users ||--o{ leads : userId
  users ||--o| pricing_data : "e-mail, sem FK"
```

Três tabelas, um enum `role`. Sem tabela de junção. Sem polimorfismo. 🟢
