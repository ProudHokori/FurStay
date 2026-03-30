# FurStay

FurStay is a full-stack pet sitter marketplace built for a software architecture course project. It uses a layered monolith with Next.js App Router as the presentation and application layer, Prisma + PostgreSQL as the data access layer, and role-based access control for three roles: pet owner, pet sitter, and admin.

## Scope

This codebase implements the agreed MVP scope from the chat:

- Owner can register/login, manage pets, create jobs, review applicants, accept a sitter, and confirm completion.
- Sitter can register/login, manage profile, submit verification requests, browse the job board, apply for jobs, and submit work proof.
- Admin can review sitter verification requests and moderate job posts.
- Role-based route protection and secure password hashing are included.
- Demo seed data is included.

## Architecture

The project follows a layered monolith because the course project is small, time-boxed, and benefits from simplicity, low development cost, and clear separation of concerns. Driving characteristics were intentionally kept small to avoid unnecessary complexity.

Top three characteristics:

1. Security
2. Maintainability
3. Functional suitability

## Tech stack

- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Custom cookie-based auth with `jose`
- Zod validation
- Vitest
- Docker Compose for local PostgreSQL

## Key folders

```text
src/
  app/                 # pages and route handlers
  components/          # reusable UI and layout components
  generated/           # Prisma generated client
  lib/
    actions/           # server actions
    repositories/      # data access helpers
    validations/       # Zod schemas
```

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop

## Setup

1. Copy environment variables.

```bash
cp .env.example .env
```

2. Start PostgreSQL.

```bash
docker compose up -d
```

3. Install dependencies.

```bash
npm install
```

4. Generate Prisma client.

```bash
npx prisma generate
```

5. Run migrations.

```bash
npx prisma migrate dev --name init
```

6. Seed demo data.

```bash
npm run prisma:seed
```

7. Start the app.

```bash
npm install -D @tailwindcss/postcss postcss tailwindcss autoprefixer
npm run dev
```

## Demo accounts

- Admin: `admin@furstay.local` / `admin123`
- Owner: `owner@furstay.local` / `owner123`
- Sitter: `sitter@furstay.local` / `sitter123`

## Test

```bash
npm test
```

## Feature checklist against project requirements

This codebase is scoped to match the course brief: three distinct roles, CRUD participation from each role, and authentication/authorization.

### Roles and CRUD examples

- Owner: create/read/update/delete pet profiles and create/read job posts.
- Sitter: create/read/update sitter profile, create/read job applications, create work proofs.
- Admin: read/update verification requests, update/remove inappropriate jobs.

## Notes

- This implementation keeps payment as a simplified platform workflow by marking the accepted application as funded rather than integrating a real payment gateway.
- Evidence upload is implemented as a link field to keep the MVP stable and quick to demo.
- If you want to expand the project later, the next recommended features are ratings, richer moderation logs, and real file upload storage.
