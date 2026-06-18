# DR Backup Manifest
**Date:** Wed Jun 17 12:59:28 EDT 2026
**Database:** meter_pulse@127.0.0.1:5432
**Files:** 8

## Contents
- `meter_pulse.dump` — PostgreSQL custom-format dump (sim_system schema)
- `src/` — Backend source code
- `prisma/` — Prisma schema and migrations
- `.env` — Environment configuration
- `package.json` — Dependencies manifest

## Restore Procedure
1. Restore database: `pg_restore -h <host> -p <port> -U <user> -d <database> --schema=sim_system ./backups/20260617_125926/meter_pulse.dump`
2. Restore source: `cp -r ./backups/20260617_125926/src/* ./src/`
3. Restore prisma: `cp -r ./backups/20260617_125926/prisma/* ./prisma/`
4. Install deps: `npm install`
5. Run migrations: `npx prisma migrate deploy`
6. Verify: `npm run build && npm test`
