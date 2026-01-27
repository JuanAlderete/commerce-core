# Commerce Core Platform

## Overview

**Commerce Core Platform** is a production‑ready backend platform designed to serve as a **reusable foundation for e‑commerce, SaaS, and internal products**.

This project is intentionally **not a one‑off application**. It is a long‑term backend core meant to be:

* deployed in real production environments
* stable under concurrent usage
* reusable across multiple businesses or projects
* understandable and maintainable by any senior or mid‑level developer

The initial real‑world use case is an **e‑commerce for perfume sales**, but the architecture is **domain‑agnostic** and can support other verticals without structural changes.

---

## Project Goals (Non‑Negotiable)

This project must:

* run reliably on a **small VPS (1 vCPU / 2GB RAM)**
* handle concurrent users without degradation
* prioritize performance, stability, and clarity
* avoid over‑engineering and hype‑driven tools
* be explainable and defendable in technical interviews

This is **not a prototype** and **not a tutorial project**.

---

## Target Audience

This repository is intended for:

* backend developers joining the project
* future maintainers (including the author)
* AI agents assisting development ("vibe coding" with constraints)

Anyone reading this README should quickly understand:

* what this project is
* how it is structured
* how to extend it correctly
* what *not* to do

---

## Architectural Philosophy

### Modular Monolith

The backend follows a **modular monolith architecture**:

* single deployable unit
* strict module boundaries
* no shared mutable state between modules

This approach was chosen because:

* it scales vertically very well
* it minimizes operational complexity
* it fits small‑to‑medium traffic systems
* it can be split into microservices later *if and only if necessary*

Microservices, Kubernetes, and distributed systems are **explicitly out of scope** for this project.

---

## Technology Stack

### Runtime

* **Node.js 20 (LTS)**

### Language

* **TypeScript** (strict mode)

### HTTP Framework

* **Fastify** (chosen for performance and low memory footprint)

### Database

* **PostgreSQL** (ACID, relational integrity, JSONB when needed)

### Infrastructure

* Docker
* Docker Compose
* Nginx (reverse proxy)
* GitHub Actions (CI/CD)

---

## High‑Level Architecture

```
HTTP Request
   ↓
Fastify
   ↓
Route
   ↓
Controller (HTTP mapping only)
   ↓
Service (business logic)
   ↓
Repository (database access)
   ↓
PostgreSQL
```

**Rules:**

* Controllers never contain business logic
* Services never know about HTTP
* Database access is isolated in repositories

---

## Repository Structure

```
backend-core/
├── .github/              # CI/CD workflows
├── docker/               # Docker & infrastructure config
│   ├── nginx/
│   └── postgres/
├── src/
│   ├── modules/          # Business domains
│   │   ├── auth/
│   │   ├── users/
│   │   ├── commerce/
│   │   └── health/
│   ├── shared/           # Cross‑cutting concerns
│   │   ├── config/
│   │   ├── db/
│   │   ├── logger/
│   │   ├── errors/
│   │   └── utils/
│   ├── app.ts            # Fastify app configuration
│   ├── server.ts         # Application entry point
│   └── routes.ts         # Global route registration
├── tests/
├── Dockerfile
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## Module Design Rules

Each module:

* owns its domain logic
* exposes only its public API
* must be independently testable
* must not import internal code from other modules

Allowed files per module:

* `*.routes.ts`
* `*.controller.ts`
* `*.service.ts`
* `*.repository.ts`
* `*.schema.ts`

---

## Core Modules (Planned)

### Auth & Identity

* JWT authentication
* refresh tokens
* roles and permissions
* rate limiting
* password hashing

### Users & Organizations

* user accounts
* multi‑tenant support
* role assignment per organization

### Commerce (Domain Layer)

* products
* variants
* categories
* pricing
* stock
* orders
* payments (via external providers)

### Background Jobs

* email sending
* payment confirmations
* async processing

---

## Configuration Management

* No hardcoded configuration
* All config comes from environment variables
* Different behavior per environment must be explicit

The application **must fail fast** if required configuration is missing.

---

## Logging & Observability

* Structured logging only
* Request ID on every request
* No sensitive data in logs
* Logs must allow production debugging

If an error occurs in production, logs should explain *why*.

---

## Performance Constraints

This backend is designed to run on:

* 1 vCPU
* 2 GB RAM

Therefore:

* avoid heavy ORMs
* avoid excessive in‑memory caching
* avoid unnecessary dependencies
* avoid blocking the event loop

Performance is always preferred over convenience.

---

## CI/CD Philosophy

* Every push to `main` triggers validation
* Tests and checks must pass before deploy
* Deployment is automated
* Rollback must be possible

Production deploys should be **boring and predictable**.

---

## How to Contribute Correctly

Before adding new code:

1. Understand the module boundaries
2. Identify where the logic belongs
3. Follow existing patterns
4. Avoid introducing new dependencies unless justified

If a feature feels complex, stop and reconsider the design.

---

## AI Agent Instructions (IMPORTANT)

If this repository is used with an AI agent:

* Treat this project as production software
* Never optimize for speed of coding over correctness
* Always explain architectural decisions
* Avoid introducing technologies not already present
* Do not suggest microservices or Kubernetes
* Do not assume unlimited resources

If unsure, prefer stability and clarity.

---

## Long‑Term Vision

This backend should:

* survive years of incremental development
* support multiple frontends
* serve as a personal backend foundation
* demonstrate real backend engineering maturity

If a decision compromises long‑term maintainability, it is rejected.

---

## Final Note

This project is intentionally **boring, strict, and opinionated**.

That is what makes it reliable.
