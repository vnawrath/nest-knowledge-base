# AGENTS.md

## Project stack

The blueprint (`.weaver/blueprint.md`) is the source of truth for all technology choices. The defaults below apply unless the blueprint specifies otherwise:

- **Server:** NestJS (domain-first modular monolith, REST JSON API)
- **Frontend:** React SPA served by NestJS via Vite (React Router, client-routed)
- **Database:** TypeORM with SQLite
- **Auth:** JWT + refresh tokens, simple RBAC
- **UI:** Tailwind CSS + shadcn/ui

If the blueprint names a different technology for any layer (e.g. PostgreSQL, Auth0, MongoDB), use that instead — but maintain the same standards of security, test coverage, and production-readiness as the default path.

## Design decisions

See `.weaver/blueprint.md` for detailed design decisions, architecture choices, and UI direction.

## Dev commands

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm test

# Build for production
npm run build
```
