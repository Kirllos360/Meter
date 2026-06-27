# Task XXX — Title

## Goal
[One-line purpose]

## Scope
[What this task covers and does NOT cover]

## Business Rules
- Rule 1
- Rule 2

## Architecture Rules
- Never break area isolation
- Never write to Symbiot
- All mutations must have audit + idempotency

## Database Rules
- Prisma ORM only
- All new tables must have UUID PK + timestamps

## Backend Rules
- All endpoints need area guard + rate limiting
- All POST/PUT/PATCH/DELETE need audit interceptor

## Frontend Rules
- Use apiClient, not raw fetch
- Add loading + error states

## Security Rules
- Validate all inputs
- Sanitize all outputs
- No secrets in code

## Performance Rules
- Add indexes on new FK columns
- Use pagination for list endpoints

## Validation
- [ ] Backend builds
- [ ] Frontend builds  
- [ ] Playwright passes
- [ ] Security scan passes
- [ ] Graphify updated
- [ ] SpecKit updated
- [ ] ESLint 0 errors
- [ ] No dead code

## Git
- Branch: `feature/pXXX-task-name`
- Commit: `feat(area): description`
- Push: Abady001 + Kirllos360

## Rollback
- Revert commit: `git revert <sha>`
- Restore DB: Flyway undo if migration added
