# Meter Verse — Project Tree
> **Last updated**: 2026-06-13 (v2.0.0 Migration) — For full architecture see `ROUTE_OF_DATA.md`
> For AI handoff/restore see `AI_HANDOFF.md` and `RESTORE_POINT.md`
> Completed: T001-T085 | Phase 7: T086-T120

```
Meter/                                           # <-- NEW ROOT (was Meter-)
├── .agents/skills/                              # 9 SpeckIt agent skills
├── .opencode/                                   # OpenCode config + commands
├── .specify/                                    # SpeckIt SDD pipeline
├── .git/                                        # Git repo (migrated from Meter-)
├── AGENTS.md                                    # Agent instructions + memory logs
├── AI_HANDOFF.md                                # Complete AI handoff
├── ROUTE_OF_DATA.md                             # Architecture + data flow map
├── PROJECT_ARCHITECTURE_AND_TREE.md             # Full architecture
├── PROJECT_TREE.md                              # This file
├── MASTER-DEPLOYMENT-GUIDE.md                   # Deployment guide (dual Linux+Windows)
├── RESTORE_POINT.md                             # Restore point (v3)
├── T001-T022-FINISHED-TASKS.md                  # Completed tasks log (T001-T085)
├── NEXT-SECTION-PROMPT.md                       # Next task prompt
├── metering_system_prd_brainstorm.md            # Original PRD
├── backend/                                     # NestJS API (T001-T019)
│   ├── prisma/schema.prisma + migrations/
│   ├── src/ (auth, audit, common, billing...)
│   ├── test/ (373 tests, 47 suites)
│   ├── docker-compose.yml
│   └── package.json
├── Frontend/                                    # Next.js 16 app (T020-T022 → T086+)
│   ├── src/
│   │   ├── app/ (layout, page, globals)
│   │   ├── components/ (15 module dirs)
│   │   ├── hooks/
│   │   ├── lib/ (api, mock-data, types, feature-flags)
│   │   └── prisma/schema.prisma
│   ├── graphify-out/ (frontend graph)
│   └── package.json
├── specs/
│   ├── 001-metering-billing-platform/           # T001-T085 (original 85 tasks)
│   ├── 002-meter-verse-core/                    # Core DB + Auth + 16 profiles (T086-T092)
│   ├── 003-symbiot-integration/                 # Symbiot bridge: 10 TCP × 100 HTTP (T091)
│   └── 004-migration-plans/                     # Data migration + parallel run (T107-T111)
├── reference/                                   # <-- NEW: All reference systems
│   ├── collection-system/                       # Flask + PostgreSQL billing system
│   ├── sbill/                                   # SBill billing source (2.1 GB)
│   ├── symbiot/                                 # Symbiot SEP integration (1.7 GB)
│   ├── ims/                                     # IMS system
│   ├── meter-department/                        # Meter department files (4.1 GB)
│   ├── energy-360/                              # Energy 360 mobile app
│   └── all-last-update/                         # Latest system updates (1.5 GB)
├── tools/                                       # <-- NEW
│   └── playwright-mcp/                          # Playwright MCP for browser E2E tests
├── docs/
│   ├── architecture/                            # Architecture diagrams & specs
│   ├── migration/                               # Migration guides & scripts
│   └── (existing documentation/)
├── scripts/                                     # <-- NEW: Utility scripts
├── ci-cd/                                       # <-- NEW: CI/CD pipeline configs
├── documentation/                               # Multi-format (markdown, sql, text, excel, pdf)
├── graphify-out/                                # Structural graph
└── backup files/                                # Session backups
```
