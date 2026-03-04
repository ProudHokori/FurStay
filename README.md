
![FurStay Logo](public\furstay-logo.png)

# **FurStay:** PetSitting Service Platform

## **Project Description**

**FurStay** is a modern, clean, and reliable pet-sitting platform designed to connect pet owners with professional sitters. Our mission is to provide a "home away from home" experience for pets while ensuring absolute peace of mind for their owners through a verified and secure system.

The platform handles everything from pet profile management and sitter discovery to a robust booking system governed by a clear state machine and a flexible payment pipeline.

---

## **User Roles & Permissions**

Following the project requirements, the system supports three distinct roles:

### 🛡️ System Auditor (Admin)

* **Responsibilities:** Overseeing platform integrity and verifying service providers.
* **CRUD Operations:** Can verify/approve Sitter profiles and moderate (Update/Delete) any users violating terms.
* **Access:** Full access to the Admin Dashboard and dispute resolution tools.

### 🏠 Pet Sitter (Service Provider)

* **Responsibilities:** Providing high-quality care and maintaining an updated service profile.
* **CRUD Operations:** Can Create and Update their service profiles, pricing, and availability. Manage booking statuses (Update).
* **Access:** Access to the Sitter Dashboard and schedule management.

### 🐶 Pet Owner (Client)

* **Responsibilities:** Managing their pets' information and finding the right care.
* **CRUD Operations:** Full CRUD on Pet profiles. Can Create bookings and write reviews (Update).
* **Access:** Access to the search engine, booking history, and pet management panel.

---

## **System Achitecture Overview**

FurStay utilizes a **Layered Architecture** within a **Next.js Monolith** structure. This choice ensures high development velocity and end-to-end type safety.

* **Presentation Layer:** Built with Next.js (App Router) and React Server Components for optimized performance.
* **Business Logic Layer:** Encapsulates core rules such as the **Booking State Machine** and the **Payment Strategy Pipeline**.
* **Data Access Layer:** Powered by **Prisma ORM**, providing a type-safe interface to our **PostgreSQL** database.

![FurStay Architecture Diagram](public\furstay-architecture-overview.png)


### Container Level (Infrastructure)

 * **Container 1: Docker Compose**: The entire application infrastructure is orchestrated using Docker Compose.
   * **Benefits:** This ensures environment parity (Portability), uses Infrastructure as Code (IaC) for database setup, and allows for future Scalability. 

### Application Container (Next.js Application)

 * **Component 2: Next.js (App Router)**: The core application is built with Next.js using the App Router. It supports full-stack development within a single unit.
 * **Cross-Cutting Security Layer:** **NextAuth.js & middleware.ts**: Implement secure login/logout, user authentication, and role-based authorization (RBAC). This controls access based on user permissions for Admin, Sitter, and Owner roles.

###  Inside the Next.js App (Layered Architecture)

1. **Presentation Layer (Frontend)**:
  * **Technologies:** Next.js Client Components, Tailwind CSS, Shadcn UI.
  * **Function:** Manages UI and front-end state.
  * **Design Practices:** Includes UI Components based on Atomic Design and reusable components.

2. **Logic Layer (Backend/Server)**:
  * **Technologies:** Next.js Server Actions, API Routes, TypeScript.
  * **Functions:** Processes business logic (e.g., checking sitter availability).
  * **Specific Patterns Implemented:**
    * **State Machine Architecture:** Explicitly manages booking statuses (e.g., Pending -> Confirmed -> In Progress -> Completed).
    * **Strategy Pattern (Payment Pipeline):** Decouples payment logic to support various providers (e.g., PromptPay, TrueMoney, Credit Card) via a Strategy or Adapter pattern.

3. **Data Access Layer**:
  * **Technology:** Prisma ORM.
  * **Function:** Communicates securely with the database, generating types automatically, and protecting against SQL Injection.

### Data Container (Database)

  * **Component 3: PostgreSQL Database**: A relational SQL database is used to store structured data.
  * **Database Schema:** The database design includes tables for **User**, **Pet**, **SitterProfile**, and **Booking**, supporting relationships like 1 User : N Pets.


---

## **Architecture Characteristics**

* **Security:** Implemented via Next.js Middleware to enforce Role-Based Access Control (RBAC) at the edge.
* **Maintainability:** We use the **Strategy Pattern** for our Payment Pipeline, allowing us to plug in different payment providers (e.g., PromptPay, Stripe) without altering core booking logic.
* **Reliability:** A **State Machine** manages booking transitions **(Pending → Confirmed → In Progress → Completed)** to ensure data consistency and prevent illegal state changes.

---

## **Pros & Cons of Selected Architecture**

### Pros

* **Unified Codebase:** Sharing types between frontend and backend reduces bugs and speeds up development.
* **Scalability:** The containerized approach via Docker allows for easy horizontal scaling of the application layer.
* **Reduced Complexity:** A monolith avoids the overhead of managing multiple services during the initial development phase.

### Cons

* **Tight Coupling:** As the system grows, the boundaries between modules can become blurred if not strictly enforced.
* **Resource Sharing:** The entire application scales as one unit, which might be inefficient if only one specific feature (like search) needs more resources.

---

## **Project Structure**

```text
/furstay
├── /docker               # Containerization configurations
├── /prisma               # Database schema & migrations
├── /src
│   ├── /app              # Routing and Page components
│   ├── /components       # Reusable UI components (Atomic Design)
│   ├── /core             # Business Logic (Payment Strategy, State Machines)
│   ├── /lib              # Shared utilities & Third-party configs
│   ├── /services         # Data access logic (Service Layer)
│   └── middleware.ts      # Authentication & Authorization layer
├── docker-compose.yml    # Multi-container orchestration
└── README.md

```

---

## **Installation & Setup (via Docker)**

### Prerequisites

* Docker and Docker Compose installed on your machine.

### Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/furstay.git
cd furstay

```


2. **Environment Setup:**
Create a `.env` file in the root directory and add your database credentials and NextAuth secrets.
3. **Run with Docker:**
```bash
docker-compose up --build

```


4. **Database Migration:**
In a new terminal, run:
```bash
npx prisma migrate dev

```


5. **Access the application:**
Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

---