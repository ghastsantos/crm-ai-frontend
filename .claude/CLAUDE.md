# CLAUDE.md — CRM-AI Frontend

## O que e este projeto

SPA de CRM com IA. React 19 + Vite 8 + TypeScript, integrada ao **crm-ai-backend** via API REST (auth JWT em `Authorization: Bearer`).

## Stack

- React 19, React Router 7, TanStack Query 5, Zod 4, Tailwind CSS 4 (`@tailwindcss/vite`)
- Fonte: Inter Variable; UI monocromatica (zinc), estilo minimalista / white-label
- Path alias: `@/` aponta para `src/` (ver `vite.config.ts` e `tsconfig.app.json`)

## Comandos

```bash
npm run dev        # Desenvolvimento (Vite)
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run lint:fix   # ESLint com auto-fix
npm run format     # Prettier (src/**/*.{ts,tsx})
npm run typecheck  # tsc -b --noEmit
npm run preview    # Preview do build
```

## Rodar a aplicacao

Para subir o frontend em desenvolvimento, o comando padrao e:

```bash
npm run dev
```

O projeto ja foi inicializado uma vez, entao `node_modules/` e `.env` normalmente ja existem. Antes de rodar, verificar:

- **`npm install`**: rodar apenas se `node_modules/` nao existir ou se `package.json` / `package-lock.json` tiverem mudado (ex: apos `git pull`)
- **`.env`**: se nao existir, copiar de `.env.example` e definir `VITE_API_BASE_URL` (ex: `http://localhost:3000`)
- **Backend**: o frontend depende do `crm-ai-backend` rodando e com `CORS_ORIGINS` incluindo a origem do Vite (`http://localhost:5173`)

Na duvida, assumir que o ambiente ja esta pronto e rodar direto `npm run dev`.

## Estrutura (FSD-inspired)

```
src/
  app/           # Providers globais, router, App.tsx
  pages/         # Composicao de telas (logica minima)
  features/      # Casos de uso (api, hooks, model, ui)
  widgets/       # Blocos compostos reutilizaveis entre paginas (AppHeader, AppShell)
  entities/      # Tipos e modelos de dominio (ex: user/types.ts)
  shared/        # UI primitivos (button, card, input, label), api/client, config/env, lib/
```

### Regras de dependencia entre camadas

- `shared` NAO importa de `features`, `widgets`, `pages` ou `app`
- `entities` NAO importa de `features` ou `pages`
- `features` usa `shared` e `entities`; evitar importar outras features diretamente
- `widgets` usa `features`, `entities`, `shared`
- `pages` compoe `widgets`, `features`, `shared`
- `app` orquestra router e providers; importa `pages` e configuracao global

## API e ambiente

- Chamadas HTTP via `apiRequest` em `src/shared/api/client.ts` (formato: `{ success, data?, error? }`)
- Variaveis publicas so com prefixo `VITE_`; validar em `src/shared/config/env.ts` com Zod
- Nao hardcodar URLs de API; usar `env` de `@/shared/config/env`
- Base URL: `VITE_API_BASE_URL` (sem barra final; o client normaliza)
- Erros: capturar `ApiError` do client quando fizer sentido mostrar mensagem ao usuario

### Autenticacao

- Com `VITE_AUTH_HTTPONLY_COOKIE=true` (padrao): usar `credentials: 'include'`, sessao via `markCookieBackedSession` apos login/register, e `POST /api/v1/auth/logout` no sair
- Sem cookie httpOnly: token JWT fica em `sessionStorage`
- Endpoints: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me`
- Erros da API: `ApiError` com `code` (ex: `EMAIL_ALREADY_IN_USE`, `INVALID_CREDENTIALS`)

## Rotas atuais

| Rota        | Descricao                                           |
|-------------|-----------------------------------------------------|
| `/login`    | Entrar                                              |
| `/register` | Cadastro (usuario + organizacao)                    |
| `/`         | Overview (requer sessao; dados de `GET /api/v1/auth/me`) |

A secao Pipeline na home e placeholder ate existirem endpoints de CRM (contacts/deals).

## Estilo e componentes

- Tailwind para layout e tema; `cn()` em `src/shared/lib/cn.ts` para classes condicionais
- Componentes primitivos de UI em `src/shared/ui/`
- Componentes: PascalCase (`AppHeader.tsx`); demais arquivos: kebab-case ou camelCase conforme pasta
- Pastas de features: kebab-case

## Idioma

- **Textos de UI, mensagens ao usuario, validacao Zod, erros mapeados**: portugues brasileiro (pt-BR)
- Evitar vocabulario de Portugal (ex: palavra-passe -> senha; utilizador -> usuario; registar -> cadastrar)
- **Codigo, nomes de variaveis e identificadores**: ingles
- **Respostas ao time**: portugues brasileiro
- Sem emojis no codigo ou comentarios
- Comentarios so quando esclarecem decisao nao obvia; manter curtos

## Seguranca

- Nao commitar `.env` com segredos; usar `.env.example` como modelo
- CORS no backend exige `CORS_ORIGINS` com a origem do Vite (ex: `http://localhost:5173`)

## Testes (quando adicionados)

- Colocar junto da feature ou em `src/**/*.test.tsx`
- Preferir Vitest + Testing Library

## Configuracao

- Husky configurado (`npm run prepare`)
- ESLint + Prettier para qualidade de codigo
