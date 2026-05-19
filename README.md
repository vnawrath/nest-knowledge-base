# LLM Wiki

Private knowledge-work app where an LLM incrementally maintains a persistent markdown wiki from immutable raw sources.

This repository currently contains the NestJS server foundation for the app described in `.weaver/blueprint.md` and `goal.md`.

The server is intended to grow into a modular monolith that provides:

- JWT-based authentication and session management
- Workspace configuration for `raw/`, `wiki/`, `raw/assets/`, and schema files
- REST resources for sources, wiki pages, index, log, queries, lint, search, and jobs
- Swagger docs in non-production environments

## Setup

```bash
cp .env.example .env   # configure environment
npm install
```

## Running

```bash
npm run start:dev      # development (watch mode)
npm run start:debug    # debug (watch mode)
npm run build && npm run start:prod  # production
```

The server starts on `http://localhost:3000`. API docs are at `/api/docs` (non-production only).

The generated starter currently exposes the base Nest application plus a health check. Feature modules from the blueprint can be layered on top of this foundation.

## Testing

```bash
npm test               # unit tests
npm run test:e2e       # end-to-end tests
npm run test:cov       # coverage report
```

## Linting

```bash
npm run lint           # eslint with auto-fix
npm run format         # prettier
```
