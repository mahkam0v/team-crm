# Team CRM Backend

## Setup
```bash
cd backend
npm install
cp .env.example .env   # edit DB credentials
npm run dev
```

Postgres must be running and `DB_DATABASE` must exist. Tables are auto-created
(`synchronize: true`) while `NODE_ENV=development`.

## Notes
- First user to `POST /api/auth/register` automatically becomes SUPER_ADMIN.
  All later registrations default to USER; promote to ADMIN via
  `POST /api/users` (SUPER_ADMIN only).
- All money fields are stored as whole so'm integers (`bigint`), never floats.
- Project/transaction "actual" and "expected" totals are always computed live
  from transactions — never cached — see `services/projectService.js`.
