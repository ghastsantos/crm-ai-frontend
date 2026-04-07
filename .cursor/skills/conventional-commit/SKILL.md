---
name: conventional-commit
description: Gera mensagens de commit no padrão Conventional Commits. Use ao criar commits, revisar PRs ou quando o usuário pedir mensagem de commit.
---

# Conventional Commit

## Formato

```
tipo(escopo): descrição curta

[corpo opcional]

[rodapé opcional]
```

## Tipos

- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação (sem mudança de lógica)
- `refactor`: refatoração
- `test`: testes
- `chore`: manutenção (deps, config)

## Escopo

Use a área afetada: `auth`, `router`, `shared`, `api`, etc.

## Exemplos

```
feat(auth): adiciona refresh de sessão no provider
fix(api): trata envelope de erro 401 no client
docs(readme): atualiza variáveis VITE_
refactor(features): extrai schema Zod partilhado
chore(ci): adiciona workflow de lint e build
```

## Regras

- Descrição em imperativo: "adiciona" não "adicionado"
- Primeira linha com até 72 caracteres
- Corpo e rodapé separados por linha em branco
