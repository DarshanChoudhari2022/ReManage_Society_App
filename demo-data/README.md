# Demo Data Pack

This folder contains **demo-only** data for client presentations and product walkthroughs.

It is intentionally separate from application runtime code and does **not** modify PostgreSQL, Prisma migrations, Neon, APIs, or production data.

## Purpose

- Show chairman, secretary, treasurer, owner/member, and tenant flows.
- Present realistic multi-society SaaS data.
- Demonstrate join-code based society onboarding.
- Demonstrate occupied, tenant-occupied, vacant, locked, and renovation unit states.
- Provide safe dummy credentials for demo accounts.

## Files

- `demo-societies.json`  
  Complete structured demo data: societies, flats, units, persons, users, occupancies, and credentials.

- `credentials.md`  
  Human-readable demo login sheet for presentations.

## Important Rules

- Do not use these credentials in production.
- Do not import this into a live customer database.
- Do not connect this folder directly to APIs.
- If a seed script is needed later, create a separate local/demo-only seed command and point it to a disposable database.

## How To Make The Demo Credentials Login

The JSON file alone does not create accounts. Login will work only after this data is seeded into a **separate demo database**.

Use a separate Neon branch/project, then run:

```bash
DEMO_DATABASE_URL="postgresql://USER:PASSWORD@HOST/demo_database?sslmode=require" \
DEMO_SEED_CONFIRM="I_UNDERSTAND_THIS_IS_DEMO_ONLY" \
npx tsx demo-data/seed-demo.ts
```

Safety checks in `seed-demo.ts`:

- It uses `DEMO_DATABASE_URL`, not `DATABASE_URL`.
- It refuses to run if `DEMO_DATABASE_URL` equals `DATABASE_URL` or `DIRECT_URL`.
- It refuses to run unless `DEMO_SEED_CONFIRM` is exactly `I_UNDERSTAND_THIS_IS_DEMO_ONLY`.
- It refuses to run unless the demo database URL contains `demo`, `staging`, `preview`, `branch`, `test`, or `sandbox`.

After seeding, deploy a demo Vercel environment pointed to that demo DB. Then the credentials in `credentials.md` will work without touching the real database.

## Demo Societies

1. Sunrise Residency - Pune
2. Green Valley Apartments - Mumbai
3. Royal Palms CHS - Nashik
4. Silver Oak Enclave - Nagpur
5. Lotus Heights - Pune

## Suggested Demo Flow

1. Login as chairman and show society settings, flats, residents, tenants, billing, visitors, and notices.
2. Login as owner/member and show dashboard, bills, visitors, staff, notices, parking, and complaints.
3. Login as tenant and show tenant-specific dashboard, maintenance bills, private rent context, visitor approvals, and staff flows.
4. Use vacant units to show how residents join using the society join code.
