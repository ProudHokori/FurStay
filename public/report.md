//public/report.md
# FurStay — Project Report
### Software Architecture Course · Final Project

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Requirements](#2-system-requirements)
3. [Architecture Characteristics](#3-architecture-characteristics)
4. [Architecture Design](#4-architecture-design)
5. [Database Design](#5-database-design)
6. [Role & Permission Structure](#6-role--permission-structure)
7. [Implementation Details](#7-implementation-details)

---

## 1. Project Overview

### 1.1 What is FurStay?

**FurStay** is a web-based pet-sitting marketplace platform that connects pet owners who need trusted care for their animals with verified professional sitters who provide that service. An admin team oversees platform quality by reviewing sitter credentials and moderating job listings.

### 1.2 Problem Statement

Pet owners frequently struggle to find trustworthy sitters for their animals when they travel or work long hours. Informal arrangements through social media or community groups suffer from several critical gaps:

| Gap | Impact |
|---|---|
| No credential verification | Owners cannot confirm a sitter's competence or background |
| No structured payment flow | Disputes arise over when and how payment is made |
| No proof-of-work mechanism | Owners have no evidence that care was actually provided |
| No accountability system | Bad actors face no consequences and no record is kept |

**FurStay solves all four gaps** by introducing:
- A **verification gate** — only admin-approved sitters can accept jobs
- A **step-by-step job lifecycle** with payment confirmation at each stage (OPEN → WAITING → FUNDED → IN_PROGRESS → COMPLETED)
- A **work proof submission** system where sitters submit evidence before the owner confirms completion
- **Admin moderation tools** — admins can cancel or remove inappropriate listings and ban bad actors without erasing historical records

### 1.3 Target Users

| Role | Who They Are | Core Need |
|---|---|---|
| **Pet Owner** | Anyone who owns a pet and needs short-term care | Find and pay a trusted, verified sitter |
| **Sitter** | An individual offering paid pet-sitting services | Find jobs, build a profile, receive structured payment |
| **Admin** | Platform staff responsible for trust and safety | Review credentials, moderate content, protect community |

---

## 2. System Requirements

### 2.1 Functional Requirements

**FR-1: Multi-User Role System**
- The system must support three distinct user roles: OWNER, SITTER, and ADMIN
- Each role has its own dashboard, responsibilities, and access permissions
- Registration allows selection of OWNER or SITTER role; ADMIN is provisioned directly

**FR-2: Full CRUD Operations per Role**
- OWNER: Create, Read, Update, Delete pet profiles; Create and cancel job postings; Select sitters and confirm payment and completion; Rate completed jobs
- SITTER: Create and update sitter profile; Submit verification requests; Apply for and withdraw from jobs; Submit work proofs
- ADMIN: Review and approve/reject verification requests; Cancel or remove job listings; Ban and unban sitters; View all platform data

**FR-3: Authentication & Authorization**
- Secure registration and login with bcrypt-hashed passwords
- Session management via signed JWT stored in httpOnly cookies
- Role-based route protection: every server action verifies role before executing
- Automatic redirect to login when session is absent or expired

**FR-4: Job Lifecycle Management**
- Jobs follow a strict state machine: OPEN → WAITING → FUNDED → IN_PROGRESS → COMPLETED
- Side paths: OPEN → CANCELLED (by owner or admin), any active state → REMOVED (by admin)
- All state transitions are enforced in the service layer with explicit guards

**FR-5: Sitter Verification Gate**
- Sitters must submit a verification request with a resume URL
- Admin reviews the request and APPROVES or REJECTS
- Only APPROVED, non-banned sitters can apply for jobs

**FR-6: Pet Profile Management**
- Owners register pets with name, type, breed, age, and care description
- Pet profiles are linked to job posts and displayed on the job board for sitters

**FR-7: Location Privacy**
- Job location is not shown on the public job board
- Location is revealed only to the assigned sitter once the owner confirms payment (FUNDED status)

**FR-8: Rating System**
- Owners can rate a completed job with a score of 1–5
- Each job can only be rated once
- Ratings are shown on sitter profile cards

### 2.2 Non-Functional Requirements

| ID | Characteristic | Description |
|---|---|---|
| NFR-1 | **Security** | Role-based access control, encrypted passwords, tamper-proof sessions, hidden PII |
| NFR-2 | **Maintainability** | Strict layered architecture; changes in one layer do not cascade to others |
| NFR-3 | **Testability** | Business logic in pure functions with no HTTP/session dependencies |
| NFR-4 | **Modularity** | Role-separated route groups and independent service modules |
| NFR-5 | **Data Integrity** | Job state machine enforced at service layer, not just the UI |
| NFR-6 | **Usability** | Pet profiles prominently displayed on job board; clear status indicators throughout |

---

## 3. Architecture Characteristics

Five quality attributes were identified as most critical for FurStay. Each characteristic is explained with its justification and how it is addressed in the design.

### 3.1 Security

**Why it matters:**
FurStay handles personal location data, financial payment confirmations, and identity verification documents. Without strong security controls, bad actors could impersonate owners, access sitter locations before trust is established, or bypass the verification gate.

**How it is addressed:**
- **Authentication**: Passwords are hashed with bcrypt (cost factor 10) before storage. Plain-text passwords never reach the database.
- **Session management**: Signed JWT tokens (`HS256`, 7-day expiry) are stored in `httpOnly`, `sameSite=lax` cookies — inaccessible to JavaScript and protected against CSRF.
- **Authorization**: Every server action calls `requireRole()` as its first line. A missing or incorrect role triggers an immediate server-side redirect before any data is accessed.
- **Location privacy**: The `getOpenJobs()` repository query never returns the `location` field. Location is only included in `getAssignmentsBySitter()`, which is scoped to FUNDED/IN_PROGRESS jobs for the assigned sitter.

### 3.2 Maintainability

**Why it matters:**
A growing marketplace platform frequently adds new job statuses, role features, or business rules. Without clear boundaries, a single change can break unrelated features.

**How it is addressed:**
- The **4-layer architecture** creates explicit dependency rules: UI never imports Prisma; actions never contain business logic.
- Adding a new job state (e.g., `DISPUTED`) requires changing only `job-service.ts` and the Prisma schema — no UI code changes are necessary.
- The **SRP principle** is applied at every level: `requireOwnedJob` only guards ownership, `selectSitter` only transitions OPEN→WAITING, `confirmPayment` only transitions WAITING→FUNDED.

### 3.3 Testability

**Why it matters:**
Critical business rules (verification gate, state machine, rating constraints) must be verifiable in isolation. If tests require a running database or browser, development becomes slow and fragile.

**How it is addressed:**
- The **Service layer** takes plain typed arguments (no `FormData`, no cookies, no `req`/`res`). Vitest can call `rateJob("owner-1", "job-1", 5)` directly with a mocked Prisma instance.
- **Shared mock factories** (`makeJob`, `makeApprovedSitter`, `resetMocks`) in `tests/helpers/mocks.ts` keep each test focused on a single scenario.
- **23 integration tests** cover every business rule — verification gate (5 cases), job state machine (7 cases), rating system (8 cases + 5 boundary values).

### 3.4 Modularity

**Why it matters:**
The three user roles have completely different workflows. Without clear module separation, owner logic can accidentally affect sitter behavior.

**How it is addressed:**
- **Route groups** in Next.js App Router: `/owner/*`, `/sitter/*`, `/admin/*`. Each role navigates a completely separate section of the app.
- **Separate service files** per domain: `job-service.ts`, `sitter-service.ts`, `verification-service.ts`. Each service is independently importable and testable.
- **Repository pattern**: Each repository (`jobRepository`, `sitterRepository`, `petRepository`) encapsulates all queries for a single domain.

### 3.5 Data Integrity

**Why it matters:**
The job payment flow involves real financial commitment. A job that skips from OPEN to COMPLETED without payment confirmation, or a sitter applying without verification, would undermine the entire platform's trustworthiness.

**How it is addressed:**
- All job state transitions live in `job-service.ts`. No other code can transition a job.
- Every transition function calls `requireOwnedJob` first (ownership check), then an explicit status guard:
  ```
  if (job.status !== "WAITING") throw new Error("Job is not awaiting payment.");
  ```
- The `applyForJob` function enforces a 3-step gate in sequence: profile existence → verification status → ban status → job status. Any failure throws an explicit, descriptive error.

---

## 4. Architecture Design

### 4.1 Architectural Style: Layered Architecture (N-Tier)

FurStay uses a **Layered Architecture** with four explicit horizontal layers. Each layer has a single responsibility and may only depend on the layer directly below it.

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                             │
│  Next.js App Router pages · React components · Tailwind CSS    │
│  /app/owner/**  /app/sitter/**  /app/admin/**                  │
├─────────────────────────────────────────────────────────────────┤
│  ACTION LAYER  (HTTP Boundary)                                  │
│  Next.js Server Actions                                         │
│  FormData parsing · requireRole() · revalidatePath()           │
│  owner-actions.ts · sitter-actions.ts · admin-actions.ts       │
├─────────────────────────────────────────────────────────────────┤
│  SERVICE LAYER  (Business Logic)                                │
│  Pure TypeScript functions — no HTTP, no cookies, no React     │
│  job-service.ts · sitter-service.ts · verification-service.ts  │
├─────────────────────────────────────────────────────────────────┤
│  DATA ACCESS LAYER                                              │
│  jobRepository · sitterRepository · petRepository              │
│  Prisma ORM · PostgreSQL 16                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Layer Responsibilities

#### Presentation Layer
- Renders UI using React Server Components and Client Components
- Reads pre-fetched data from server components (no direct Prisma access)
- Submits user actions via HTML `<form action={serverAction}>` or router events
- Contains zero business logic

**Example**: The owner jobs page fetches `jobRepository.getOwnerJobs(session.sub)` in a server component, then renders job cards. The "Select Sitter" button submits a form pointing to `selectSitterAction`.

#### Action Layer
- Acts as the HTTP boundary adapter between the browser and the service layer
- Responsibilities (and only these): parse `FormData`, call `requireRole()`, call the appropriate service function, call `revalidatePath()`
- All actions are thin — typically 4–6 lines of code per action

**Example**:
```typescript
export async function rateJobAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);                          // 1. auth
  await rateJob(session.sub, formData.get("jobPostId"), formData.get("rating")); // 2. service
  revalidatePath("/owner/jobs");                                          // 3. cache
}
```

#### Service Layer
- Contains all business rules, state machine guards, and domain validation
- Functions are pure: they take typed primitives and return typed primitives or throw `Error`
- Has zero dependencies on HTTP, cookies, FormData, or React
- Can be imported and tested by Vitest directly

#### Data Access Layer
- The only layer that imports from `@/lib/prisma`
- **Repositories** handle all read queries with correct joins and filters
- **Prisma direct calls** are used for write operations inside service functions
- Repositories enforce business-relevant filters (e.g., REMOVED jobs are hidden at query level)

### 4.3 Dependency Rule

```
Presentation  →  Actions  →  Services  →  Repositories / Prisma
     ↑               ↑            ↑                ↑
  No reverse dependencies — lower layers never import from upper layers
```

### 4.4 Directory Structure

```
src/
├── app/                    # Next.js App Router — pages per role
│   ├── (auth)/             # login / register
│   ├── admin/              # admin dashboard, jobs, verifications, sitters
│   ├── owner/              # owner dashboard, pets, jobs
│   └── sitter/             # sitter dashboard, jobs, assignments, profile
├── components/
│   ├── layout/             # AppShell — role-aware navigation wrapper
│   ├── sitter/             # sitter-specific components
│   └── ui/                 # shared primitives (Button, Card, Badge, StarRating…)
└── lib/
    ├── actions/            # Server Actions (FormData boundary)
    ├── services/           # Business logic (pure TypeScript)
    ├── repositories/       # Read queries (Prisma)
    ├── validations/        # Zod schemas (petSchema, jobSchema, loginSchema)
    ├── session.ts          # JWT auth helpers
    └── prisma.ts           # Prisma client singleton
prisma/
├── schema.prisma           # Database schema
├── seed.ts                 # Demo data seeder
└── migrations/             # Migration history
tests/
├── helpers/mocks.ts        # Shared mock factories
├── business-logic.test.ts  # Service-layer integration tests
└── validation.test.ts      # Zod schema validation tests
```

---

## 5. Database Design

### 5.1 Overview

The database uses **PostgreSQL 16** with **Prisma 6** as the ORM. The schema defines 7 models and 4 enumerations that together represent the complete FurStay domain.

### 5.2 Enumerations

| Enum | Values | Purpose |
|---|---|---|
| `Role` | `OWNER`, `SITTER`, `ADMIN` | Distinguishes user type and governs access |
| `VerificationStatus` | `PENDING`, `APPROVED`, `REJECTED` | Tracks sitter credential review state |
| `JobStatus` | `OPEN`, `WAITING`, `FUNDED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REMOVED` | Job lifecycle state machine |
| `ApplicationStatus` | `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN` | Application tracking per sitter per job |

### 5.3 Data Models

#### User
Central identity record for all three roles. Role enum determines which features are accessible.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `email` | String | Unique — used for login |
| `password` | String | bcrypt hash — never stored plain |
| `name` | String | Display name |
| `role` | Role enum | OWNER / SITTER / ADMIN |
| `createdAt` / `updatedAt` | DateTime | Audit timestamps |

#### Pet
Owned by a User with role OWNER. Linked to JobPost — one pet can appear in multiple job listings over time.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | Required |
| `type` | String | e.g., "Dog", "Cat", "Rabbit" |
| `breed` | String? | Optional |
| `age` | Int? | Optional — years |
| `description` | String? | Care notes, conditions, dietary needs |
| `ownerId` | String | FK → User |

#### SitterProfile
One-to-one with User (role=SITTER). Holds credentials and moderation flags.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | Unique FK → User |
| `bio` | String? | Short introduction |
| `experience` | String? | Free-text experience description |
| `resumeUrl` | String? | Link to credential document |
| `verificationStatus` | VerificationStatus | Default: PENDING |
| `isBanned` | Boolean | Default: false — set by admin |

#### VerificationRequest
Audit log of each verification submission. Persists even after review so history is retained.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK → User (the sitter) |
| `documentUrl` | String? | Link to submitted document |
| `note` | String? | Sitter's message to admin |
| `status` | VerificationStatus | Current review status |
| `reviewedById` | String? | FK → Admin user (optional) |

#### JobPost
Core entity. Links owner, pet, and state machine. `selectedSitterId` is null until the owner selects a sitter.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `ownerId` | String | FK → User (owner) |
| `petId` | String | FK → Pet |
| `title` | String | Job listing headline |
| `description` | String | Detailed requirements |
| `location` | String? | Hidden from job board; revealed at FUNDED |
| `startDate` / `endDate` | DateTime | Care period |
| `paymentAmount` | Float | In Thai Baht |
| `status` | JobStatus | State machine — default OPEN |
| `selectedSitterId` | String? | FK → User (sitter) — set at WAITING |
| `rating` | Int? | 1–5 — set by owner after COMPLETED |

#### JobApplication
Records each sitter's application to a job. Composite unique constraint prevents duplicate applications.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `jobPostId` | String | FK → JobPost |
| `sitterId` | String | FK → User |
| `message` | String? | Cover message from sitter |
| `status` | ApplicationStatus | Default PENDING |
| **Constraint** | | `@@unique([jobPostId, sitterId])` |

#### WorkProof
Evidence submitted by the sitter before the owner can confirm completion. Triggers the FUNDED → IN_PROGRESS transition.

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `jobPostId` | String | FK → JobPost |
| `sitterId` | String | FK → User |
| `proofText` | String? | Written description of work done |
| `imageUrl` | String? | Optional photo evidence |
| `submittedAt` | DateTime | Timestamp of submission |

### 5.4 Entity Relationships

```
User ──────────────────< Pet                  (owner has many pets)
User ──────────────────< JobPost              (owner creates many jobs)
User ─────────────────── SitterProfile        (1:1 — sitter has one profile)
User ──────────────────< VerificationRequest  (sitter submits many requests)
User ──────────────────< JobApplication       (sitter submits many applications)
User ──────────────────< WorkProof            (sitter submits many proofs)

Pet  ──────────────────< JobPost              (pet appears in many jobs)
JobPost ───────────────< JobApplication       (job receives many applications)
JobPost ───────────────< WorkProof            (job has many proofs)
```

### 5.5 Job State Machine

```
                      ┌──(admin: REMOVE)──────────────────▶ REMOVED
                      │
OPEN ──(select sitter)──▶ WAITING ──(confirm payment)──▶ FUNDED
  │                                                          │
  └──(cancel / admin cancel)──▶ CANCELLED     (submit proof)▼
                                                       IN_PROGRESS
                                                            │
                                               (owner confirms)▼
                                                       COMPLETED
```

---

## 6. Role & Permission Structure

### 6.1 OWNER Role

| Feature | Create | Read | Update | Delete |
|---|:---:|:---:|:---:|:---:|
| Pet profiles | ✅ | ✅ | ✅ | ✅ |
| Job postings | ✅ | ✅ | — | cancel only |
| Select sitter (OPEN→WAITING) | — | — | ✅ | — |
| Confirm payment (WAITING→FUNDED) | — | — | ✅ | — |
| Confirm completion (IN_PROGRESS→COMPLETED) | — | — | ✅ | — |
| Rate completed job (1–5) | ✅ | ✅ | — | — |
| View sitter profiles & ratings | — | ✅ | — | — |

**Constraints:**
- Owners can only cancel jobs in OPEN status ("No refunds after payment has been initiated")
- Each completed job may be rated exactly once
- Owners can only manage their own pets and jobs

### 6.2 SITTER Role

| Feature | Create | Read | Update | Delete |
|---|:---:|:---:|:---:|:---:|
| Sitter profile (bio, experience) | ✅ | ✅ | ✅ | — |
| Submit verification request | ✅ | ✅ | — | — |
| Browse job board (OPEN jobs) | — | ✅ | — | — |
| Apply for job | ✅ | ✅ | — | — |
| Withdraw application | — | — | ✅ (WITHDRAWN) | — |
| Submit work proof | ✅ | ✅ | — | — |
| View job history & ratings | — | ✅ | — | — |

**Constraints:**
- Cannot apply unless `verificationStatus = APPROVED` AND `isBanned = false`
- Location is hidden on the job board; revealed only at FUNDED status
- Cannot apply for a job that is no longer OPEN
- Banned sitters can still submit work proof on existing active assignments

### 6.3 ADMIN Role

| Feature | Permissions |
|---|---|
| Review verification requests | Read queue; Approve / Reject with immediate effect on SitterProfile |
| Moderate job listings | Cancel any OPEN/WAITING job; Remove any job (REMOVED is hidden from all non-admin views) |
| Manage sitters | Ban (blocks new applications) / Unban any sitter |
| Dashboard statistics | Read-only overview of platform activity |
| View all sitters | Full sitter list with verification status and ban state |

**Constraints:**
- Admin actions do not delete records; REMOVED and CANCELLED jobs are retained in the database
- Rejecting a verification request deletes the request record but updates the SitterProfile status to REJECTED

---

## 7. Implementation Details

### 7.1 Authentication & Session Management

Authentication is implemented from scratch using the `jose` library without any third-party auth framework.

**Registration flow:**
1. User submits name, email, password, and role via `registerSchema` (Zod validation)
2. Password is hashed with `bcrypt.hash(password, 10)` — 10 rounds provides ~100ms hashing
3. User record is created in the database
4. A session is created and stored in a cookie

**Login flow:**
1. `loginSchema` validates email format and minimum password length at the boundary
2. User is looked up by email; `bcrypt.compare` checks the password hash
3. On success, `createSession()` signs a JWT (`HS256`) containing `{ sub, role, email, name }` with a 7-day expiry
4. Token is stored in an `httpOnly`, `sameSite=lax` cookie named `furstay_session`

**Route protection:**
```typescript
export async function requireRole(roles: Role[]) {
  const session = await requireUser();          // throws redirect("/login") if no session
  if (!roles.includes(session.role)) redirect("/");  // role mismatch → home
  return session;
}
```
Every server action calls `requireRole(["OWNER"])` (or SITTER/ADMIN) as its first line — the action's data is never reached if the check fails.

### 7.2 Service Layer

Three service files contain all business rules:

#### `job-service.ts` — Job State Machine
- `requireOwnedJob(jobPostId, ownerId)`: Private guard — fetches job, verifies ownership, throws if not found. Used by every public function.
- `selectSitter`: Guards OPEN status → sets status to WAITING, marks selected application ACCEPTED
- `confirmPayment`: Guards WAITING status → sets status to FUNDED, rejects all remaining PENDING applications
- `cancelJob`: Guards OPEN status (no refunds after payment) → CANCELLED + rejects all applications
- `confirmCompletion`: Guards IN_PROGRESS status → COMPLETED
- `rateJob`: Validates rating range (integer 1–5), guards COMPLETED + unrated → sets rating

#### `sitter-service.ts` — Application & Work Proof
- `requireEligibleSitter(sitterId)`: Private guard — checks verificationStatus = APPROVED and isBanned = false
- `requireOpenJob(jobPostId)`: Private guard — checks job status = OPEN
- `applyForJob`: Runs both guards in sequence → upserts JobApplication
- `withdrawApplication`: Verifies PENDING status → sets WITHDRAWN
- `submitWorkProof`: Verifies sitter is assigned + job is FUNDED → creates WorkProof + sets IN_PROGRESS

#### `verification-service.ts` — Credential Review
- `submitVerification`: Prevents re-submission if already APPROVED → creates VerificationRequest + upserts SitterProfile
- `reviewVerification`: APPROVE path: updates request + sets SitterProfile to APPROVED; REJECT path: deletes request + sets REJECTED

### 7.3 Input Validation (Zod)

All external input passes through named Zod schemas before reaching any service function:

| Schema | File | Fields Validated |
|---|---|---|
| `loginSchema` | `validations/auth.ts` | email (format), password (min 6) |
| `registerSchema` | `validations/auth.ts` | name (min 2), email, password (min 6), role (OWNER\|SITTER) |
| `petSchema` | `validations/pet.ts` | name (required), type (required), breed?, age (int ≥ 0)?, description? |
| `jobSchema` | `validations/job.ts` | petId, title (min 3), description (min 10), location?, startDate, endDate, paymentAmount (min 1) |

Invalid data is rejected at the action boundary with a user-readable error message. Database and service code never receive unvalidated input.

### 7.4 Repository Pattern

Repositories act as the read-query interface for each domain. They encapsulate all Prisma query logic so that pages and services never construct Prisma queries inline.

Key design decisions in repositories:
- **REMOVED jobs filtered at query level**: `getOwnerJobs` and `getApplicationsBySitter` both include `status: { not: "REMOVED" }` — the UI cannot accidentally display removed jobs
- **Location field omitted from job board**: `getOpenJobs` returns the complete job record but the page component renders no location field — location privacy is enforced in the rendering layer
- **Sitter stats aggregation**: `getSitterStats` computes `completedJobs` count and `avgRating` in a single query to power the owner's sitter profile modal

### 7.5 Automated Testing

The test suite uses **Vitest 3** and targets the service layer directly.

**Test structure:**
```
tests/
├── helpers/mocks.ts          # Shared fixtures: makeJob, makeApprovedSitter, resetMocks
├── business-logic.test.ts    # 21 integration tests across 3 suites
└── validation.test.ts        # Zod schema boundary tests
```

**Suite 1 — Sitter Verification Gate (5 tests):**
- Blocks: no profile, PENDING status, REJECTED status, APPROVED but banned, job not OPEN
- Allows: APPROVED + not banned + OPEN job — verifies `upsert` is called with correct args

**Suite 2 — Job State Machine (7 tests):**
- OPEN→WAITING: verifies correct update + updateMany ACCEPTED call; throws on non-OPEN
- WAITING→FUNDED: verifies FUNDED update + PENDING→REJECTED bulk update; throws on non-WAITING
- IN_PROGRESS→COMPLETED: verifies COMPLETED update; throws on non-IN_PROGRESS (regression test — was a silent-fail bug before refactoring)

**Suite 3 — Rating System (8 tests + 5 boundary values):**
- `it.each` table test for out-of-range values [0, 6, 3.5]
- Blocks: job not completed, job not found/mismatch, already rated
- Allows: all integer values 1–5 via loop test

**Running tests:**
```bash
npm test
```
All 21+ tests pass in under 1 second with zero database or network I/O required.

### 7.6 Technology Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| Framework | Next.js | 15.2.4 | App Router, Server Actions, Server Components |
| Language | TypeScript | 5 | Type safety across all layers |
| Database | PostgreSQL | 16 | Relational storage with enum support |
| ORM | Prisma | 6 | Type-safe queries, migrations, schema |
| Auth | jose | 5.9.6 | JWT signing and verification |
| Password | bcryptjs | 2.4.3 | Adaptive hashing (cost factor 10) |
| Validation | Zod | 3.24.2 | Schema-first input validation |
| Styling | Tailwind CSS | 4 | Utility-first CSS |
| Testing | Vitest | 3 | Fast unit/integration tests |
| Containerisation | Docker / Docker Compose | latest | Zero-config local setup |

---

*Report prepared for Software Architecture Final Project submission.*
