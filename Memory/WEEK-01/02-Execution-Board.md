# Week 01 — Execution Board

**Status:** IN PROGRESS  
**Period:** 2026-06-27 to 2026-07-03  
**Phase:** P0 — Critical Billing Completion  
**Previous Certification:** RC-9 (76% complete, 70% production readiness)

---

## Active Tasks

| ID | Task | Status | Owner | Est. Days |
|----|------|--------|-------|-----------|
| P0-001 | Wire TOU Pricing to Billing Engine | PENDING | — | 5 |
| P0-002 | Implement Demand Charge Calculation | PENDING | — | 3 |
| P0-003 | Implement Penalty Engine | PENDING | — | 3 |
| P0-004 | Add Credit/Debit Note Workflows | PENDING | — | 2 |
| P0-005 | Complete Symbiot Sync TCP Layer | PENDING | — | 5 |
| P0-006 | ESLint Cleanup + Dead Code Removal | PENDING | — | 1 |

---

## Completed Tasks

| ID | Task | Completed | Outcome |
|----|------|-----------|---------|
| — | — | — | — |

---

## Blockers

| Blocker | Impact | Workaround |
|---------|--------|------------|
| None | — | — |

---

## Risks

| Risk | P | I | Mitigation |
|------|---|---|------------|
| TOU pricing touches billing core | M | H | Comprehensive unit tests before merge |
| Demand charge needs meter amp data | L | M | Add field to Meter model if missing |
| Penalty could affect existing invoices | M | H | Only apply to invoices created after activation date |

---

## Weekly Goal

Complete P0-001 through P0-004 (billing parity).  
If time permits: P0-005 (TCP sync) or P0-006 (cleanup).

---

## End-of-Week Check

- [ ] All P0 billing tasks complete
- [ ] sBill parity ≥ 80%
- [ ] Production readiness ≥ 78%
- [ ] All commits pushed to both repos
- [ ] Memory files updated
- [ ] WEEK-02-HINT.md generated
