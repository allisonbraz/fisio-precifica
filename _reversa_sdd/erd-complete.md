# ERD completo

Tabelas físicas são três. O documento de preço é um agregado dentro de `jsonb`. Cardinalidades do JSON são da aplicação, não do Postgres. 🟢

```mermaid
erDiagram
  users {
    int id PK
    uuid supabaseId UK
    text name
    varchar email
    varchar whatsapp
    varchar loginMethod
    varchar source
    role role
    timestamp createdAt
    timestamp updatedAt
    timestamp lastSignedIn
  }

  leads {
    int id PK
    varchar nome
    varchar email UK
    varchar whatsapp
    varchar ip
    text userAgent
    varchar source
    int userId FK
    timestamp createdAt
  }

  pricing_data {
    int id PK
    varchar ownerEmail UK
    jsonb data
    timestamp createdAt
    timestamp updatedAt
  }

  users ||--o{ leads : "userId, preenchido no login se o e-mail coincide"
  users ||--o| pricing_data : "não há FK; casa por e-mail"
```

## Forma de `pricing_data.data`

🟢 tipo `DadosPrecificacao` mais a chave `_perfil`, gravada pelo client e não declarada no tipo. O Zod a descreve.

```mermaid
erDiagram
  DOCUMENTO ||--|{ CUSTO_FIXO : custosFixos
  DOCUMENTO ||--|{ CUSTO_VARIAVEL : custosVariaveis
  DOCUMENTO ||--|{ RESERVA : reservasEstrategicas
  DOCUMENTO ||--|{ TIPO_SERVICO : tiposServico
  DOCUMENTO ||--o{ PLANO : planosTratamento
  DOCUMENTO ||--o{ REGISTRO : registrosMensais
  DOCUMENTO ||--o| PERFIL : _perfil
  TIPO_SERVICO ||--o{ PLANO : tipoServicoId
  REGISTRO ||--o{ SERVICO_VENDIDO : servicosVendidos
  REGISTRO ||--o{ PLANO_VENDIDO : planosVendidos
```

Não há integridade referencial: um plano pode apontar para `tipoServicoId` inexistente. A UI de serviços procura o serviço e, se não achar, usa o preço base. 🟢 `Servicos.tsx` por volta da linha 298 (`servico ? calcularPrecoServico : precoBase`).

Detalhe coluna a coluna: `database/data-dictionary.md`.
