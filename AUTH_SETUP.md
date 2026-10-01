# Account system setup

## Run locally

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` (local MongoDB or Atlas), a random `JWT_SECRET` of at least 32 characters, the intended first-admin `ADMIN_EMAIL`, and `BLOB_READ_WRITE_TOKEN` for image uploads.
2. In `server`, run `npm install` and `npm run dev`.
3. In `client`, run `npm install` and `npm run dev`.
4. Open the Vite URL and use **เข้าสู่ระบบ** in the header. The configured admin email becomes an admin when that account registers. Other registrations always receive the `user` role.

The client calls `/api`; the Vite development server proxies this path to `http://localhost:5000`. Set `VITE_API_URL` only when using a separate API host.

## Account API

- `POST /api/auth/register` — `{ "name", "email", "password" }`
- `POST /api/auth/login` — `{ "email", "password" }`
- `GET /api/auth/me` — current user, requires `Authorization: Bearer <token>`
- `GET /api/admin/users` — list users, admin only
- `PATCH /api/admin/users/:id` — update `name`, `email`, `role`, or `isActive`, admin only

Passwords are stored as salted PBKDF2 hashes. Access tokens expire after 12 hours. Keep `JWT_SECRET` private and rotate it to invalidate existing sessions.

## Checks

- Server tests: `cd server && npm test`
- Client production build: `cd client && npm run build`
