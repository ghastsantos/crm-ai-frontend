# Segurança (SPA)

Este projeto consome a API `crm-ai-backend`. Cabeçalhos fortes (HSTS, CSP na borda, proxy) e o modelo de cookies estão descritos em detalhe no repositório do backend:

`crm-ai-backend/docs/production-security.md`

## Variáveis deste frontend

| Variável | Função |
|----------|--------|
| `VITE_API_BASE_URL` | URL base da API (sem barra final). |
| `VITE_AUTH_HTTPONLY_COOKIE` | `true` (predefinido): envia cookies de sessão com `fetch` (`credentials: 'include'`). `false`: apenas JWT em `Authorization` via `sessionStorage` (útil para depuração). |

Em produção, alinhar `CORS_ORIGINS` e cookies no backend com o domínio real da SPA.
