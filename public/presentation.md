//public/presentation.md
# FurStay — Presentation Slides
### Software Architecture Final Project · 6 Minutes

---

## Slide 1 — Title

**FurStay**
*A Trusted Pet-Sitting Marketplace*

> [PLACEHOLDER: Logo or hero image — FurStay app homepage screenshot]

---

## Slide 2 — Section 3.1 · What is FurStay?

### The Problem

> Pet owners have no reliable way to verify a sitter's competence before handing over their animals.

| What's Missing in Informal Arrangements |
|---|
| ❌ No credential verification |
| ❌ No structured payment flow |
| ❌ No proof that work was done |
| ❌ No accountability for bad actors |

---

## Slide 3 — Section 3.1 · What FurStay Solves

### The Solution: A Verified, Structured Marketplace

| Feature | How it protects users |
|---|---|
| **Verification Gate** | Only admin-approved sitters can accept jobs |
| **Job Lifecycle** | OPEN → WAITING → FUNDED → IN_PROGRESS → COMPLETED |
| **Work Proof** | Sitters submit evidence before owner confirms completion |
| **Admin Moderation** | Cancel jobs, remove listings, ban bad actors |

> [PLACEHOLDER: Screenshot — job lifecycle flow or sitter application page]

---

## Slide 4 — Section 3.1 · Target Users

### Who uses FurStay?

| Role | Who They Are | What They Do |
|---|---|---|
| 🐾 **Pet Owner** | Anyone with a pet needing short-term care | Post jobs, select sitters, confirm payment |
| 🧑‍💼 **Sitter** | Individuals offering pet-sitting services | Build profile, apply for jobs, submit proofs |
| 🛡️ **Admin** | Platform staff for trust & safety | Review credentials, moderate content |

---

## Slide 5 — Section 3.2 · Key Architecture Characteristics

### 5 Quality Attributes That Matter for FurStay

| # | Characteristic | Why FurStay Needs It |
|---|---|---|
| 1 | **Security** | Location data, payment flow, verified identities |
| 2 | **Maintainability** | New job statuses / role features should not break unrelated code |
| 3 | **Testability** | Business rules (gate, state machine, rating) must be verifiable without a browser |
| 4 | **Modularity** | 3 roles with separate workflows — prevent accidental coupling |
| 5 | **Data Integrity** | Payment state machine must be enforced — not just in the UI |

---

## Slide 6 — Section 3.3 · Architecture Chosen

### Layered Architecture (N-Tier) — 4 Layers

```
┌──────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                  │
│  Next.js pages · React components · Tailwind CSS     │
├──────────────────────────────────────────────────────┤
│  ACTION LAYER  (HTTP Boundary)                       │
│  Server Actions · FormData parsing · requireRole()   │
├──────────────────────────────────────────────────────┤
│  SERVICE LAYER  (Business Logic)                     │
│  job-service · sitter-service · verification-service │
├──────────────────────────────────────────────────────┤
│  DATA ACCESS LAYER                                   │
│  Repositories · Prisma ORM · PostgreSQL 16           │
└──────────────────────────────────────────────────────┘
```

**Rule:** Each layer depends **only** on the layer directly below it.

---

## Slide 7 — Section 3.4 · Why This Architecture Fits FurStay

### How Each Layer Solves a Requirement

| Requirement | Architecture Solution |
|---|---|
| Role-based access | `requireRole()` in **Action layer** — enforced before any data is read |
| Job state machine integrity | All transitions in **Service layer** only — UI cannot bypass guards |
| Sitter verification gate | `applyForJob` in **Service layer** — 4 checks run in sequence |
| Location privacy | Repository `getOpenJobs` never returns `location`; only revealed in assignment query |
| Testability | **Service layer** takes plain arguments — Vitest calls it directly, no Next.js needed |

> [PLACEHOLDER: Diagram showing data flow from UI → Action → Service → DB for "Apply for Job"]

---

## Slide 8 — Section 3.5 · Code Quality — Separation of Concerns

### Each Layer Has One Responsibility

```
Page       →  renders data, handles user interaction
Action     →  parses FormData, calls service, revalidates cache
Service    →  enforces business rule
Repository →  reads rows from database
```

**Example: Rate a job**
```typescript
// Action (boundary)
export async function rateJobAction(formData: FormData) {
  const session = await requireRole(["OWNER"]);          // auth
  await rateJob(session.sub, formData.get("jobPostId"),
                Number(formData.get("rating")));          // delegate
  revalidatePath("/owner/jobs");                          // cache
}

// Service (business rule)
export async function rateJob(ownerId, jobPostId, rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw new Error("Rating must be 1–5.");
  const job = await requireOwnedJob(jobPostId, ownerId); // ownership check
  if (job.status !== "COMPLETED") throw new Error("Can only rate a completed job.");
  if (job.rating !== null) throw new Error("Job already rated.");
  await prisma.jobPost.update({ where: { id: jobPostId }, data: { rating } });
}
```

---

## Slide 9 — Section 3.5 · Code Quality — Other Practices

### Practices Applied Throughout

| Practice | How it's Applied |
|---|---|
| **Single Responsibility** | `requireOwnedJob` only guards. `selectSitter` only transitions OPEN→WAITING. One function, one job. |
| **Centralized Validation** | All inputs validated by named Zod schemas (`petSchema`, `jobSchema`, `loginSchema`) before reaching any service |
| **Consistent Error Handling** | Services throw `Error("descriptive message")`. Actions catch and return `{ error: message }` to UI. |
| **Naming Conventions** | Files: `kebab-case`. Functions: `camelCase` verbs (`applyForJob`, `confirmPayment`). Actions: suffix `Action`. |
| **Reusable Components** | `AppShell` (role-aware nav), `Card`, `Button`, `Badge`, `StarRating`, `JobStatusBadge` shared across all roles |
| **Security** | bcrypt passwords (cost 10) · httpOnly JWT cookies · `requireRole()` first line of every action · location withheld at repository level |

---

## Slide 10 — Section 3.5 · Code Quality — Automated Tests

### 21 Integration Tests · 100% Business Rule Coverage

> [PLACEHOLDER: Screenshot of `npm test` output showing all tests passing]

| Suite | Tests | What is Covered |
|---|---|---|
| Sitter Verification Gate | 5 | No profile, PENDING, REJECTED, Banned, Job not OPEN → all blocked; APPROVED + OPEN → allowed |
| Job State Machine | 7 | OPEN→WAITING, WAITING→FUNDED (with bulk reject), IN_PROGRESS→COMPLETED, all throws on wrong status |
| Rating System | 9 | Out-of-range values (0, 6, 3.5), wrong status, double-rating, not found; all boundary values 1–5 |

**Key design:** Tests call `rateJob("owner-1", "job-1", 5)` directly — no database, no browser, no Next.js required.

---

## Slide 11 — Section 3.6 · Code Structure — Component Relationships

### How Components Are Organized by Role

```
AppShell  (role-aware navigation wrapper)
│
├── Owner Pages
│   ├── /owner/pets        → PetCard (inline edit / delete)
│   └── /owner/jobs        → NewJobForm · SitterProfileModal · RateJobForm
│
├── Sitter Pages
│   ├── /sitter/jobs       → VerificationBanner · apply / withdraw forms
│   │                         + Pet Profile box (breed, age, care notes)
│   ├── /sitter/assignments → work proof form · location revealed
│   └── /sitter/profile    → profile editor · verification submission
│
└── Admin Pages
    ├── /admin/verifications → approve / reject forms
    ├── /admin/jobs          → cancel / remove forms
    └── /admin/sitters       → ban / unban controls
```

> [PLACEHOLDER: Screenshot — /sitter/jobs showing pet profile card and apply button]
> [PLACEHOLDER: Screenshot — /owner/jobs showing job management with applications]

---

## Slide 12 — Section 3.6 · Code Structure — CodeCharta Visualization

> [PLACEHOLDER: CodeCharta screenshot — full map with rloc area + complexity color]

### Reading the Map

- **Area (footprint)** = `rloc` (real lines of code) — larger square = more code
- **Height** = complexity — taller building = more logic paths
- **Color** = complexity — green = simple, yellow/red = higher complexity

### Key Observations

| File | rloc | Complexity | Interpretation |
|---|---|---|---|
| `owner-actions.ts` | 105 | 20 | **Expected** — 9 action endpoints in one file; each action has auth + delegate + cache = unavoidable |
| `business-logic.test.ts` | 155 | 28 | **Intentional** — high complexity in tests = high coverage; more test cases = more conditional paths measured |
| `job-service.ts` | ~60 | ~8 | ✅ Green — SRP achieved; each function is 4–8 lines max |
| `sitter-service.ts` | ~60 | ~6 | ✅ Green — guards extracted into private functions |
| `verification-service.ts` | ~28 | ~4 | ✅ Green — two focused functions |

### Before & After Refactoring

| Metric | Before Refactoring | After Refactoring |
|---|---|---|
| `owner-actions.ts` size | ~164 lines | ~120 lines (−27%) |
| `sitter-actions.ts` size | ~114 lines | ~65 lines (−43%) |
| Max cyclomatic complexity | > 4 per function | ≤ 3 per function |
| Functions with complexity > 4 | Several | **Zero** |

> [PLACEHOLDER: CodeCharta delta/comparison screenshot — before vs after service layer extraction]

---

## Slide 13 — Summary & Demo

### FurStay at a Glance

| Aspect | Summary |
|---|---|
| **Problem** | No trusted, verified channel for pet owners and sitters |
| **Solution** | Verified marketplace with structured job lifecycle and admin oversight |
| **Architecture** | 4-layer N-Tier: Presentation → Action → Service → Data |
| **Key Characteristics** | Security · Maintainability · Testability · Modularity · Data Integrity |
| **Code Quality** | SRP, Zod validation, consistent error handling, 21 passing tests |
| **Stack** | Next.js 15 · TypeScript · PostgreSQL · Prisma · jose · Vitest |

> [PLACEHOLDER: Screenshot collage — homepage, sitter job board, admin verification queue]

---

### Thank you

**Demo Accounts (after `npm run prisma:seed`):**

| Role | Email | Password |
|---|---|---|
| Admin | admin@furstay.local | admin123 |
| Owner | owner1@furstay.local | owner123 |
| Sitter (Approved) | sitter1@furstay.local | sitter123 |
| Sitter (Pending) | sitter2@furstay.local | sitter456 |

---

*Time guide: Slides 2–4 (~1 min) · Slides 5–7 (~2 min) · Slides 8–10 (~1.5 min) · Slides 11–12 (~1 min) · Slide 13 + Q&A (~0.5 min)*
