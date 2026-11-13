# Sincronizar a calculadora

Como profissional com conta, quero que o que digito fique no navegador na hora e chegue ao servidor sem perder edição se a rede cair.

## Critérios

```gherkin
Dado que estou autenticado e o load inicial terminou
Quando altero um custo
Então o localStorage é atualizado antes do POST
E o POST sai cerca de 2 segundos depois da última alteração

Dado um save que falhou
E ainda há flag de pending
Quando o load remoto responde
Então o estado local não é substituído pelo JSON antigo

Dado sync status diferente de synced
Quando peço para sair e confirmo
Então as chaves locais permanecem
```

Rastreio: `sincronizacao/`. 🟢
