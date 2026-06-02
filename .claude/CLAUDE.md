# CLAUDE.md — CRM-AI Frontend

SPA de CRM com IA. React 19 + Vite 8 + TypeScript, integrada ao **crm-ai-backend** via API REST (auth JWT).

## Stack

React 19, React Router 7, TanStack Query 5, Zod 4, Tailwind CSS 4 (`@tailwindcss/vite`), Husky + lint-staged.

Fonte: Inter Variable. UI monocrática (zinc), estilo minimalista / white-label.

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

Antes de rodar: verificar se `node_modules/` existe (senão `npm install`) e se `.env` existe (copiar de `.env.example`). Backend deve estar rodando com `CORS_ORIGINS` incluindo `http://localhost:5173`.

## Estrutura (FSD-inspired)

```
src/
├── app/           # Providers globais, router, App.tsx
├── pages/         # Composição de telas (lógica mínima)
├── features/      # Casos de uso (api, hooks, model, ui)
├── widgets/       # Blocos compostos reutilizáveis entre páginas (AppHeader, AppShell)
├── entities/      # Tipos e modelos de domínio (ex: user/types.ts)
└── shared/        # UI primitivos, api/client, config/env, lib/
```

### Regras de dependência entre camadas

- `shared` NÃO importa de `features`, `widgets`, `pages` ou `app`
- `entities` NÃO importa de `features` ou `pages`
- `features` usa `shared` e `entities`; evitar importar outras features diretamente
- `widgets` usa `features`, `entities`, `shared`
- `pages` compõe `widgets`, `features`, `shared`
- `app` orquestra router e providers; importa `pages` e configuração global

## Padrões de código

### Idioma e estilo
- Textos de UI, mensagens ao usuário, validação Zod, erros mapeados: português brasileiro (pt-BR)
- Evitar vocabulário de Portugal (senha, não palavra-passe; usuário, não utilizador; cadastrar, não registar)
- Código, variáveis e identificadores: inglês
- Sem emojis no código ou comentários
- Comentários só quando esclarecem decisão não óbvia; manter curtos

### Nomenclatura
- Componentes: PascalCase (`AppHeader.tsx`)
- Pastas de features: kebab-case
- Demais arquivos: kebab-case ou camelCase conforme pasta
- Path alias: `@/` aponta para `src/` (ver `vite.config.ts` e `tsconfig.app.json`)

### TypeScript
- Strict mode ativo; evitar `any`, preferir `unknown` + narrowing
- `noUnusedLocals` e `noUnusedParameters` habilitados
- Zod para validação; tipar com `z.infer<typeof schema>`
- `no-console` é regra de lint — não usar `console.log`

## API e ambiente

- Chamadas HTTP via `apiRequest` em `src/shared/api/client.ts` (formato: `{ success, data?, error? }`)
- Variáveis públicas só com prefixo `VITE_`; validar em `src/shared/config/env.ts` com Zod
- Não hardcodar URLs de API; usar `env` de `@/shared/config/env`
- Base URL: `VITE_API_BASE_URL` (sem barra final; o client normaliza)
- Erros: capturar `ApiError` do client quando fizer sentido mostrar mensagem ao usuário

### Autenticação

- Com `VITE_AUTH_HTTPONLY_COOKIE=true` (padrão): usar `credentials: 'include'`, sessão via `markCookieBackedSession` após login/register, e `POST /api/v1/auth/logout` no sair
- Sem cookie httpOnly: token JWT fica em `sessionStorage`
- Endpoints: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me`
- Erros da API: `ApiError` com `code` (ex: `EMAIL_ALREADY_IN_USE`, `INVALID_CREDENTIALS`)

## Rotas atuais

| Rota        | Descrição                                           |
|-------------|-----------------------------------------------------|
| `/login`    | Entrar                                              |
| `/register` | Cadastro (usuário + organização)                    |
| `/`         | Overview (requer sessão; dados de `GET /api/v1/auth/me`) |

A seção Pipeline na home é placeholder até existirem endpoints de CRM (contacts/deals).

## Estilo e componentes

- Tailwind para layout e tema; `cn()` em `src/shared/lib/cn.ts` para classes condicionais
- Componentes primitivos de UI em `src/shared/ui/`
- Usar `clsx` + `tailwind-merge` (via `cn()`) para compor classes

## Testes (quando adicionados)

- Colocar junto da feature ou em `src/**/*.test.tsx`
- Preferir Vitest + Testing Library

## Segurança

- Não commitar `.env` com segredos; usar `.env.example` como modelo
- CORS no backend exige `CORS_ORIGINS` com a origem do Vite

## Verificação antes de concluir tarefa

- `npm run typecheck` passa sem erros
- `npm run build` passa (com `VITE_API_BASE_URL` definido)
- `npm run lint` passa sem erros

## Princípios de engenharia

### Decisões de arquitetura
- Antes de criar código novo, verificar se já existe algo similar em `shared/` ou na feature — reutilizar e estender
- Respeitar regras de dependência entre camadas (shared → entities → features → widgets → pages → app)
- Componentes de UI primitivos em `shared/ui/` — features não criam seus próprios botões/inputs
- Lógica de API em `features/<nome>/api/` — nunca fetch direto no componente
- Hooks de negócio em `features/<nome>/hooks/` — componentes de UI devem ser apresentacionais

### Performance
- Lazy loading para páginas/features pesadas com `React.lazy()` + `Suspense`
- TanStack Query para cache e deduplicação de requests — não reinventar cache manual
- Evitar re-renders: `useMemo`/`useCallback` apenas quando houver impacto mensurável, não preventivamente
- Imagens e assets pesados: lazy load com `loading="lazy"`

### Para o desenvolvedor
- Ao criar nova feature: criar pasta em `features/<nome>/` com subpastas `api/`, `hooks/`, `ui/`, `model/`
- Ao criar componente reutilizável: colocar em `shared/ui/` com props tipadas
- Ao adicionar rota: registrar em `app/` (router), criar página em `pages/`
- Ao mexer em auth: verificar fluxo cookie vs sessionStorage conforme `VITE_AUTH_HTTPONLY_COOKIE`
- Rodar `npm run typecheck`, `npm run build` e `npm run lint` antes de considerar tarefa concluída

## Commits

Conventional Commits em português, imperativo:

```
tipo(escopo): descrição curta (até 72 chars)
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. Escopo: área afetada (`auth`, `pipeline`, `shared`, etc.).
