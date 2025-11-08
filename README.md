# goTasks — API de Gestão de Tarefas

Sistema simples de gestão de tarefas com API REST em Go. Persistência em SQLite, logging e CORS habilitado para facilitar o uso em aplicações web.

- Linguagem: Go 1.22+
- Armazenamento: SQLite (`goTasks.db` por padrão)
- Servidor HTTP: `net/http` com `http.Server`
- Recursos: CRUD de tarefas, paginação, CORS, health-check, logging

---

## Visão Geral

A API expõe endpoints para criar, listar, consultar, atualizar e remover tarefas. As tarefas são armazenadas em um banco SQLite e acessadas de forma segura para concorrência.

- Endpoints principais:
  - `GET/POST /tasks`
  - `GET/PATCH/PUT/DELETE /tasks/{id}`
- Health-check:
  - `GET /health` → retorna `ok`

---

## Recursos

- CRUD de tarefas com campos: `title`, `description`, `done`, timestamps.
- Paginação em `GET /tasks` com `limit` e `offset`.
- CORS habilitado (`*`) para uso via browser.
- Logging de requisições com tempo de execução.
- Configuração por variáveis de ambiente (`PORT`, `DATABASE_PATH`).

---

## Requisitos

- Go 1.20+ (recomendado 1.22).
- Ferramentas de linha de comando:
  - `curl` (para testes da API).

---

## Execução (Local)

1) Instale ou ajuste dependências de Go (caso falte `go.sum`):

```bash
go mod tidy
```

Se persistir erro de `go.sum` para SQLite:

```bash
go get github.com/mattn/go-sqlite3@latest
```

2) Rode a aplicação:

```bash
go run .
```

3) A API estará em: