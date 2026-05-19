## App Description

<!-- Explain what the app is about, what it does and who it's for. Include the app name, target users, and core value proposition. -->

## Server (NestJS)

<!-- Describe the server-side architecture. The default is a NestJS modular monolith with a REST JSON API — use this unless goal.md specifies otherwise. List the key modules the app will need, with their responsibilities. -->

## Frontend (Vite / React Router)

<!-- Describe the frontend architecture. The default is a React SPA served by the NestJS server via Vite in middleware mode (never two separate servers). Decide if React Router should run in SPA mode or if the app requires server-side rendering (e.g. public content that needs SEO vs. an app behind login). List every route/page the app should have. For each route specify: name and path, what data it loads (becomes the route loader), what mutations/forms it has (become route actions), and what error states are possible (404, auth required, empty state, etc.). -->

## Database

<!-- The default is TypeORM with SQLite — use this unless goal.md specifies a different database (e.g. PostgreSQL, MongoDB). Whatever the choice, list every entity with its key fields, relationships, and constraints. Be specific: use the exact entity names and field names from goal.md. -->

## Auth

<!-- The default is JWT-based auth with refresh-token rotation and simple RBAC (admin + user roles). If goal.md specifies a different auth approach (e.g. Auth0, Clerk, AWS Cognito, OAuth-only), use that instead — but ensure the implementation meets the same security and session-management standards (httpOnly cookies, token rotation or equivalent, rate limiting, stolen-credential detection). List the exact roles and permissions the app needs. -->

## UI & Design

<!-- This is the richest section. Describe the design direction, main layout, color scheme (use exact color values from goal.md if provided), component patterns, and how the app should feel. Use the frontend-design skill when filling out this section. The default toolkit is Tailwind CSS + shadcn/ui. -->
