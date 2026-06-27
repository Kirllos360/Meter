# Meter Verse — Permanent Architecture Memory

## Enterprise Domain Model

```
Area → Project → Unit Zone → Unit Type → Unit → Meter → Reading → Tariff → Customer → Invoice → Settlement → Wallet → Payment → Audit
```

## System Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + React 19 + Tailwind v4 + shadcn/ui | Web UI |
| Backend | NestJS + Prisma ORM | REST API |
| Database | PostgreSQL 16 (multi-schema) | Data storage |
| Gateway | Express.js | API gateway + rate limiting |
| Sync | Express.js per-area gateways | Symbiot integration |
| Admin | Express.js (port 6262) | Platform governance |
| Reporting | NestJS (HTML/Puppeteer) + Java (JasperReports) | Invoice/report generation |

## Database Schemas

| Schema | Purpose | Tables |
|--------|---------|--------|
| `sim_system` | Main operational data | ~45 |
| `core` | Auth, roles, permissions, areas | ~25 |
| `features` | Tariffs, billing cycles, wallets, settlements | ~20 |
| `area_{name}` | Per-area isolated data | ~35 each |

## Security Architecture

- JWT access + refresh tokens
- CSRF double-submit cookie
- RBAC: 7 roles (super_admin, project_admin, operator, technician, finance, support, customer)
- Area guard middleware (resolves AREA-1 → UUID)
- Project access guard
- Audit interceptor (append-only SHA-256 chain)
- Rate limiting on all gateways
- Helmet CSP headers

## Key Endpoints

- 35 controllers, ~180 endpoints
- All mutations behind auth + audit
- Area-scoped queries filter by areaId

## Billing Architecture

| Service | Function |
|---------|----------|
| BillingController | Invoice generation, payment, tariff simulation |
| CalculationEngineService | Tariff calculation, VAT, discounts |
| TariffEngineService | Slab/block rate calculation |
| LedgerService | Customer balance tracking |
| BillingStateService | Lifecycle state management |

## Current Certification Status

| Metric | Score |
|--------|-------|
| Completion | 76% |
| Production Readiness | 70% |
| Pilot Readiness | 85% |
| sBill Billing Parity | 68% |
| OWASP Score | 9.5/10 |
| Area Isolation | CERTIFIED |
| Remaining Engineering | ~39 days |

## Never Change List

- Area isolation (DB schemas + guard middleware)
- Prisma ORM as sole DB access layer
- JWT + CSRF auth model
- Audit interceptor pattern
- NestJS frontend/backend separation
- Append-only audit log
