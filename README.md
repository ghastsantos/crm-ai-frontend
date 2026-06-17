# CRM Frontend

SPA em React, Vite, TypeScript, TanStack Query e Tailwind CSS.

## O que tem

- Login e cadastro
- Visão do pipeline de negociações
- Criação, edição, exclusão e movimentação de cards
- Painel para conectar WhatsApp via Baileys/WhatsApp Web
- Lista de conversas recentes atualizadas pela IA
- Tela de configurações com perfil, senha, organização e usuários
- Tema e idioma apenas na área autenticada

## Rodar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Configure `VITE_API_BASE_URL` apontando para o backend, por exemplo:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Se a porta estiver ocupada, o `npm run dev` pergunta outra porta no terminal. Para deixar uma porta fixa, defina `VITE_PORT` no `.env`.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o Vite |
| `npm run typecheck` | Valida TypeScript |
| `npm run build` | Gera build de produção |
| `npm run lint` | Roda ESLint |

## Rotas

| Rota | Descrição |
| --- | --- |
| `/login` | Login |
| `/register` | Cadastro inicial |
| `/` | Pipeline e atendimento WhatsApp |
| `/settings` | Configurações |
| `/admin/pipeline-logs` | Histórico do pipeline |
