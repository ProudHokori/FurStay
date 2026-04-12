# FurStay — Pet-Sitting Platform

FurStay is a web application that connects **pet owners** who need someone to look after their animals with **verified sitters** who provide that care. An **admin** team oversees quality and trust by reviewing sitter credentials and moderating job listings.

---

## Table of Contents

1. [Project Description](#1-project-description)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Technology Stack](#4-technology-stack)
5. [Installation & Setup](#5-installation--setup)
6. [How to Run the System](#6-how-to-run-the-system)
7. [Screenshots](#7-screenshots)
8. [Presentation Q&A](#8-presentation-qa)

---

## 1. Project Description

### Problem it solves

Pet owners frequently struggle to find trustworthy, vetted sitters when they travel or work long hours. Informal arrangements through social media lack accountability, verified credentials, and a structured payment flow.

FurStay solves this by providing:

- A **verified sitter pool** — only admin-approved sitters can accept jobs.
- A **transparent job lifecycle** — OPEN → WAITING → FUNDED → IN\_PROGRESS → COMPLETED, with payment confirmation at each step.
- **Pet profiles** displayed prominently on every job card so sitters know exactly what conditions and care needs to expect before applying.
- **Community protection** — admins can remove inappropriate listings or ban bad actors without deleting historical records.

### Target users

| Role | Who they are |
|---|---|
| **Pet Owner** | Anyone who owns a pet and needs short-term care covered |
| **Sitter** | An individual who offers paid pet-sitting services |
| **Admin** | Platform staff responsible for trust, safety, and content moderation |

---

## 2. System Architecture Overview

FurStay uses a **Layered Architecture** with four explicit layers:

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer                             │
│  Next.js App Router pages & React components   │
├─────────────────────────────────────────────────┤
│  Action Layer  (Next.js Server Actions)         │
│  FormData parsing · session auth · revalidation │
├─────────────────────────────────────────────────┤
│  Service Layer  (Business Logic)                │
│  job-service · sitter-service ·                 │
│  verification-service · auth-service            │
├─────────────────────────────────────────────────┤
│  Data Access Layer                              │
│  Repositories (read queries) · Prisma (writes)  │
│  PostgreSQL database                            │
└─────────────────────────────────────────────────┘
```

Each layer depends only on the layer directly below it — the UI never touches Prisma directly, and business rules never touch FormData or HTTP cookies.

### Directory structure

```
src/
├── app/                    # Next.js App Router — pages per role
│   ├── admin/
│   ├── owner/
│   └── sitter/
├── components/
│   ├── layout/             # AppShell (role-aware navigation)
│   ├── sitter/             # Sitter-specific components
│   └── ui/                 # Shared primitives (Button, Card, Badge…)
├── lib/
│   ├── actions/            # Server Actions (thin FormData wrappers)
│   ├── services/           # Business logic & domain rules
│   ├── repositories/       # Read queries (Prisma)
│   ├── validations/        # Zod schemas
│   ├── session.ts          # JWT auth helpers
│   └── prisma.ts           # Prisma client singleton
└── generated/prisma/       # Auto-generated Prisma client
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
tests/
├── helpers/mocks.ts        # Shared mock factories
├── business-logic.test.ts  # Service-layer integration tests
└── validation.test.ts
```

---

## 3. User Roles & Permissions

### OWNER

| Feature | Create | Read | Update | Delete |
|---|:---:|:---:|:---:|:---:|
| Pet profiles | ✅ | ✅ | ✅ | ✅ |
| Job posts | ✅ | ✅ | — | cancel only |
| Select sitter | — | — | ✅ | — |
| Confirm payment | — | — | ✅ | — |
| Confirm completion | — | — | ✅ | — |
| Rate completed job | ✅ | ✅ | — | — |

### SITTER

| Feature | Create | Read | Update | Delete |
|---|:---:|:---:|:---:|:---:|
| Sitter profile | ✅ | ✅ | ✅ | — |
| Submit verification | ✅ | ✅ | — | — |
| Browse job board | — | ✅ | — | — |
| Apply for job | ✅ | ✅ | — | — |
| Withdraw application | — | — | ✅ | — |
| Submit work proof | ✅ | ✅ | — | — |

> Sitters can only apply after admin approval (`verificationStatus = APPROVED`) and cannot apply if banned.
> Location is hidden on the job board and revealed only after the sitter is assigned (FUNDED status).

### ADMIN

| Feature | Permissions |
|---|---|
| Review verification requests | Approve / Reject |
| Moderate job listings | Cancel / Remove |
| Manage sitters | Ban / Unban |
| Dashboard stats | Read-only |

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript 5 |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 with `@prisma/adapter-pg` |
| Auth | Custom JWT via `jose` + httpOnly cookies |
| Validation | Zod |
| Styling | Tailwind CSS 4 |
| Testing | Vitest 3 |
| Containerisation | Docker / Docker Compose |

---

## 5. Installation & Setup

### Prerequisites

| Tool | Minimum version | Check |
|---|---|---|
| Node.js | 20 | `node -v` |
| npm | 10 | `npm -v` |
| Docker Desktop | latest | `docker -v` |
| Git | any | `git -v` |

### Clone the repository

```bash
git clone <your-repo-url>
cd furstay
```

### Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5434/furstay_db"
AUTH_SECRET="replace-with-a-long-random-secret-at-least-32-chars"
```

> **Tip:** Generate a secure secret with `openssl rand -base64 32`

---

## 6. How to Run the System

### Option A — Docker (recommended, zero local PostgreSQL setup)

This starts PostgreSQL, the Next.js dev server, Prisma Studio, and Adminer in one command.

```bash
# 1. Start all services
docker compose up -d

# 2. Wait ~20 seconds for the database to initialise, then run migrations
docker exec furstay-web npx prisma migrate deploy

# 3. Seed the database with demo data
docker exec furstay-web npm run prisma:seed
```

| Service | URL |
|---|---|
| App | http://localhost:3001 |
| Prisma Studio | http://localhost:5555 |
| Adminer (DB GUI) | http://localhost:8081 |

To stop all services:

```bash
docker compose down
```

---

### Option B — Local (Node.js + local PostgreSQL)

```bash
# 1. Start only the database container
docker compose up postgres -d

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npm run prisma:generate

# 4. Apply database migrations
npx prisma migrate deploy

# 5. Seed demo data
npm run prisma:seed

# 6. Start development server
npm run dev
```

App will be available at http://localhost:3000

---

### Demo accounts (after seeding)

| Role | Email | Password | Status |
|---|---|---|---|
| Admin | admin@furstay.local | admin123 | — |
| Owner | owner1@furstay.local | owner123 | Has pets & jobs |
| Owner | owner2@furstay.local | owner456 | Has completed job |
| Sitter | sitter1@furstay.local | sitter123 | ✅ Approved — can apply |
| Sitter | sitter2@furstay.local | sitter456 | ⏳ Pending — needs admin review |

### Run tests

```bash
npm test
```

---

## 7. Screenshots

> *(Add screenshots here before submission)*

| Screen | Description |
|---|---|
| `/owner/pets` | Pet profile management |
| `/owner/jobs` | Job posting and sitter selection |
| `/sitter/jobs` | Job board with pet profiles |
| `/sitter/assignments` | Active assignments with location revealed |
| `/sitter/profile` | Verification submission |
| `/admin/verifications` | Verification review queue |
| `/admin/jobs` | Job moderation |
| `/admin/sitters` | Sitter management and ban control |

---

## 8. Presentation Q&A

### 3.1 What is your project?

**FurStay** is a pet-sitting marketplace platform that solves the trust gap between pet owners and sitters.

**Problem it solves:**
Pet owners have no reliable way to verify a sitter's competence before handing over their animals. Sitters have no structured way to receive payment or prove they completed work. FurStay introduces a verification gate, a step-by-step job lifecycle with payment confirmation, and a work-proof submission system — so both sides are protected.

**Target users:**
- **Pet Owners** who need short-term, trustworthy care for their animals
- **Sitters** who want a professional channel to offer and track pet-care services
- **Admins** who maintain platform quality by reviewing credentials and moderating content

---

### 3.2 Key Architecture Characteristics

| Characteristic | Why it matters for FurStay |
|---|---|
| **Security** | Financial transactions and personal location data require role-based access control, verified identities, and hidden location until trust is established |
| **Maintainability** | A growing platform needs code that can be changed safely — new job statuses or role features should not require touching unrelated code |
| **Testability** | Business rules (verification gate, state machine, rating constraints) must be verifiable in isolation without a running database or browser |
| **Modularity** | Each role has distinct workflows; separate route groups and service modules prevent accidental coupling |
| **Data Integrity** | The job state machine (OPEN → WAITING → FUNDED → IN_PROGRESS → COMPLETED) is enforced at the logic layer, not just the UI |

---

### 3.3 System Architecture

FurStay uses a **Layered Architecture** (N-Tier), consisting of four layers:

1. **Presentation Layer** — Next.js App Router pages and React components. Handles rendering and user interaction only. Never contains business logic.

2. **Action Layer** — Next.js Server Actions. Responsible solely for parsing `FormData`, calling the service layer, and triggering cache revalidation. Acts as the HTTP boundary adapter.

3. **Service Layer** — Pure TypeScript functions (`job-service`, `sitter-service`, `verification-service`, `auth-service`). Contains all business rules, state machine guards, and domain validation. Has no dependency on HTTP, cookies, or React.

4. **Data Access Layer** — Repository objects for read queries and direct Prisma calls for writes. The only layer allowed to import from `@/lib/prisma`.

---

### 3.4 Why this architecture fits FurStay's requirements

| Requirement | How the architecture supports it |
|---|---|
| Role-based access control | `requireRole()` in the Action layer enforces authentication before any service call. Routes are grouped by role under `/owner`, `/sitter`, `/admin` |
| Job state machine integrity | All transitions live in `job-service.ts`. Every function uses a `requireOwnedJob` guard that throws explicitly — no silent failures |
| Sitter verification gate | `applyForJob` checks profile existence → verification status → ban status → job status in sequence. The UI cannot bypass these checks because they live in the service, not the component |
| Location privacy | Repositories filter `location` from the job board query; it appears only in assignment queries after FUNDED status |
| Testability | The service layer takes plain typed arguments (no FormData, no sessions). Vitest can call `rateJob("owner-1", "job-1", 5)` directly with mocked Prisma — no Next.js server required |

---

### 3.5 Code Quality Practices

**Separation of Concerns**
Each layer has exactly one responsibility. A page renders data. An action parses form input. A service enforces a rule. A repository reads rows. Changing how a form is submitted does not touch the business rule.

**Single Responsibility Principle (SRP)**
Every function does one thing: `requireOwnedJob` only fetches and guards ownership. `selectSitter` only transitions OPEN → WAITING. `confirmPayment` only transitions WAITING → FUNDED and rejects pending applications.

**Centralized Validation (Zod)**
All external input is validated through named Zod schemas (`petSchema`, `jobSchema`, `loginSchema`) before it reaches any service. Invalid data is rejected at the boundary with a user-readable error message.

**Consistent Error Handling**
Service functions throw `Error` with descriptive messages. Actions catch these and return `{ error: message }` to the UI. No raw database errors are ever surfaced to users.

**Security Practices**
- Passwords are bcrypt-hashed (cost factor 10) before storage
- Sessions use signed JWT stored in `httpOnly`, `secure`, `sameSite=lax` cookies — inaccessible to JavaScript
- All server actions call `requireRole()` as their first line — a missing or wrong role redirects before any data is read
- Location data is withheld from sitters until the job reaches FUNDED status (enforced in the repository query, not just the UI)

**Naming Conventions**
- Files: `kebab-case` (`job-service.ts`, `pet-repository.ts`)
- Functions: `camelCase` verbs describing the operation (`applyForJob`, `confirmPayment`, `requireOwnedJob`)
- Server Actions: suffixed with `Action` (`selectSitterAction`) to distinguish the HTTP boundary from the pure service function (`selectSitter`)

**Reusable Components**
`AppShell` provides role-aware navigation for all three dashboards. `Card`, `Button`, `Badge`, `StarDisplay` are shared UI primitives. `JobStatusBadge` and `ApplicationStatusBadge` centralise status-to-colour mapping in one place.

**Automated Tests**
23 Vitest integration tests cover every business rule in isolation. Shared fixtures in `tests/helpers/mocks.ts` (`makeJob`, `makeApprovedSitter`, `resetMocks`) keep each test case concise and focused on a single scenario.

---

### 3.6 Code Structure and Organization

**Component relationships**

```
AppShell (layout wrapper, role-aware nav)
│
├── Owner pages
│   ├── /owner/pets      → PetCard (inline edit / delete)
│   └── /owner/jobs      → NewJobForm · SitterProfileModal · RateJobForm
│
├── Sitter pages
│   ├── /sitter/jobs     → VerificationBanner · apply / withdraw forms
│   ├── /sitter/assignments → work proof submission form
│   └── /sitter/profile  → profile editor · verification submission
│
└── Admin pages
    ├── /admin/verifications → approve / reject forms
    ├── /admin/jobs          → cancel / remove forms
    └── /admin/sitters       → ban / unban controls
```

**Database relationships**

```
User ──< JobPost            (as owner)
User ──< JobApplication     (as sitter)
User ──< WorkProof          (as sitter)
User ─── SitterProfile      (1:1)
User ──< VerificationRequest

Pet ──< JobPost
JobPost ──< JobApplication
JobPost ──< WorkProof
```

**Job state machine**

```
             ┌─(admin remove)──▶ REMOVED
             │
OPEN ──(select sitter)──▶ WAITING ──(confirm payment)──▶ FUNDED
 │                                                           │
 └──(cancel / admin cancel)──▶ CANCELLED      (submit proof)▼
                                                        IN_PROGRESS
                                                             │
                                                (owner confirms)▼
                                                        COMPLETED
```

**Service layer — function complexity after refactoring**

| Service file | Functions | Max lines/fn | Max cyclomatic complexity |
|---|---|---|---|
| `job-service.ts` | 6 | 12 | 3 |
| `sitter-service.ts` | 5 | 10 | 2 |
| `verification-service.ts` | 2 | 10 | 2 |

Extracting business logic into the Service layer reduced action file size by ~35% on average and eliminated all functions with cyclomatic complexity > 4, which maps to green buildings in CodeCharta visualisation.
