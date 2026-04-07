# CRM AI Frontend

SPA em React 19 + Vite 8 + TypeScript, integrada ao **crm-ai-backend** (auth JWT em `Authorization: Bearer`).

## Stack

- React Router, TanStack Query, Zod, Tailwind CSS v4 (`@tailwindcss/vite`)
- Fonte: Inter Variable (`@fontsource-variable/inter`)
- UI monocromática (zinc), estilo minimalista / white-label

## Início rápido

```bash
npm install
cp .env.example .env
# Defina VITE_API_BASE_URL (ex.: http://localhost:3000)
npm run dev
```

### CORS no backend

O backend exige `CORS_ORIGINS` com a origem do Vite (ex.: `http://localhost:5173`). Sem isso, o navegador bloqueia as requisições.

## Scripts

| Comando | Descrição |
|--------|------------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |

## Rotas

| Rota | Descrição |
|------|------------|
| `/login` | Entrar |
| `/register` | Cadastro (usuário + organização) |
| `/` | Overview (requer sessão; dados de `GET /api/v1/auth/me`) |

O token JWT fica em `sessionStorage` após login ou cadastro.

## Estrutura (resumo)

```
src/
  app/           # Providers, router
  entities/      # Tipos alinhados à API
  features/auth/ # API auth, schemas Zod, formulários, sessão
  pages/         # Composição das páginas
  shared/        # Cliente HTTP, UI primitivos, utilitários
  widgets/       # Header, shell autenticado
```

## Integração com a API

- `POST /api/v1/auth/login` e `POST /api/v1/auth/register` — corpo alinhado ao backend; resposta `{ success, data: { token, user } }`.
- `GET /api/v1/auth/me` — usuário e `memberships`.
- Erros: `ApiError` com `code` (ex.: `EMAIL_ALREADY_IN_USE`, `INVALID_CREDENTIALS`).

A seção **Pipeline** na home é placeholder até existirem endpoints de CRM (contacts/deals).
