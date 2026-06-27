# Meter Verse — Permanent Governance Rules

## Absolute Rules (Never Break)

1. **Area Isolation** — Never allow cross-area data access. Every query, API, sync, and notification must be scoped to one area.
2. **Read Only on Symbiot** — No writes, no SQL, no triggers, no jobs against Symbiot systems.
3. **Don't Remove Working Functionality** — Never replace a service before proving the replacement passes all validations.
4. **Always Compare Against SpecKit** — Every implementation must be traceable to a SpecKit requirement.
5. **Always Update Graphify** — After every architecture change, regenerate the dependency graph.
6. **Always Run Playwright Regression** — After every implementation, execute the full Playwright suite.
7. **Commit Only After All Validations Pass** — No partial commits.
8. **Never Leave Dead Code** — Remove or archive unused code to `draft/`.
9. **Never Leave Fake UI Buttons** — Every button must be functional, disabled-with-reason, or permission-hidden.
10. **Never Skip Documentation** — Every task must update CHANGELOG.md and relevant docs.

## Git Workflow

```
Create branch: feature/pXXX-task-name
  ↓
Implement
  ↓
Review + validate
  ↓
Commit: conventional commit format
  ↓
Push to Abady001/Meter-
  ↓
Push to Kirllos360/Mete
  ↓
Update CHANGELOG.md + Memory files
  ↓
Close task
```

## Commit Convention

- `feat(module): description` — new feature
- `fix(module): description` — bug fix
- `refactor(module): description` — refactoring
- `docs(section): description` — documentation
- `security(module): description` — security fix
- `test(module): description` — test addition
- `chore(module): description` — maintenance

## Validation Gate (All Must Pass)

- [ ] Backend build (`cd backend && npm run build`)
- [ ] Frontend build (`cd Frontend && npx next build`)
- [ ] ESLint 0 errors (`cd backend && npx eslint src/ --max-warnings 6`)
- [ ] No dead code
- [ ] No console errors
- [ ] No duplicate routes
- [ ] No broken CRUD
- [ ] No cross-area leakage
- [ ] No RBAC regression
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Graphify updated (if architecture changed)
- [ ] SpecKit updated (if requirements changed)
