# Dependências

Versões declaradas em `package.json` (faixas `^` permanecem como no manifesto). 🟢

## Runtime

| Pacote | Versão declarada | Uso no FisioPrecifica |
|--------|------------------|------------------------|
| react / react-dom | 19.2.1 | UI |
| wouter | 3.7.1 | Rotas |
| @trpc/server, client, react-query | 11.6.0 | API |
| @tanstack/react-query | 5.90.2 | Cache de queries |
| superjson | ^1.13.3 | Datas e tipos no fio tRPC |
| zod | 4.1.12 | Input dos procedimentos |
| express | ^4.21.2 | HTTP |
| @supabase/supabase-js | 2.99.2 | Auth no browser e validação do JWT no servidor |
| drizzle-orm | 0.44.5 | Queries |
| postgres | 3.4.5 | Driver Postgres |
| dotenv | ^17.2.2 | Env no servidor |
| @sentry/node, @sentry/react | ^10.64.0 | Erros, se o DSN existir |
| recharts | ^2.15.2 | Gráficos |
| framer-motion | ^12.23.22 | Transição |
| lucide-react | ^0.453.0 | Ícones |
| sonner | ^2.0.7 | Toasts |
| next-themes | ^0.4.6 | Tema (há `ThemeContext` próprio também) |
| Radix (alert-dialog, dialog, label, progress, select, slider, slot, switch, tabs, tooltip) | várias ^1 / ^2 | Primitivos shadcn |
| class-variance-authority, clsx, tailwind-merge | — | Variantes de classe |
| tailwindcss-animate | ^1.0.7 | Animação utilitária |
| nanoid | ^5.1.5 | Declarado; ids de domínio usam `generateId()` em `formatters.ts` |

## Desenvolvimento

| Pacote | Versão | Uso |
|--------|--------|-----|
| typescript | 5.9.3 | Tipos |
| vite | ^7.1.7 | Bundle do client |
| @vitejs/plugin-react | ^5.0.4 | JSX |
| tailwindcss | ^4.1.14 | Estilo |
| @tailwindcss/vite | ^4.1.3 | Plugin Vite |
| vitest | ^2.1.4 | Testes |
| eslint | ^10.8.1 | Lint que o CI executa e que falha |
| typescript-eslint | ^8.67.0 | Regras TS |
| eslint-plugin-react-hooks | ^7.1.1 | Inclui `react-hooks/preserve-manual-memoization` |
| eslint-plugin-react-refresh | ^0.5.4 | Warn de export |
| drizzle-kit | ^0.31.4 | `db:push` |
| esbuild | ^0.25.0 | Bundle do servidor e de `api/trpc.js` |
| tsx | ^4.19.1 | `pnpm dev` |
| prettier | ^3.6.2 | Format, não está no CI |
| cross-env | ^10.1.0 | `NODE_ENV` |

## Override

`pnpm.overrides`: `tailwindcss>nanoid` fixado em `3.3.7`. 🟢

## Variáveis de ambiente

| Nome | Onde | Efeito se ausente |
|------|------|-------------------|
| `DATABASE_URL` | servidor | `getDb()` devolve null; save/load/lead falham em silêncio ou retornam vazio. Produção: `requireEnv` lança na carga do módulo. 🟢 |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | servidor e browser | Auth desligada; o client usa placeholder `http://127.0.0.1:54321`. 🟢 |
| `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | idem | Idem |
| `SUPABASE_SERVICE_ROLE_KEY` | só `contacts.changeEmail` | Procedimento responde 500 com mensagem pedindo a variável. 🟢 |
| `ADMIN_EMAIL` | `context.ts` | Ninguém é promovido a admin. 🟢 |
| `VITE_SENTRY_DSN` / `SENTRY_DSN` | client / server | Sentry não inicia. 🟢 |
| `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` | notification e storage | Legado Manus. Preço não depende. 🟢 |
| `PORT` | `index.ts` | Default 3000 no dev server. 🟢 |
| `NODE_ENV` | vários | `production` exige env críticas e serve estático. 🟢 |

Não há `.env` commitado nesta leitura. O README manda copiar `.env.example`. 🟢 o README; o exemplo em si não foi reauditado campo a campo.

## Serviços externos

| Serviço | Protocolo | Obrigatório para precificar |
|---------|-----------|------------------------------|
| Supabase Auth | HTTPS, JWT | Para gravar no servidor. A conta local no browser funciona sem rede até o sync. 🟢 |
| Postgres (em geral o do Supabase) | SQL via `DATABASE_URL` | Para `pricing_data` |
| Sentry | HTTPS | Não |
| WhatsApp `wa.me` | Link de compartilhamento na landing e na lista de contatos | Não |
| Manus Forge notification/storage | HTTPS Connect/JSON | Não, no fluxo atual |
