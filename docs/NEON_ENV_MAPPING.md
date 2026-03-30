# Neon Environment Mapping (Do Not Commit Secrets)

This file documents exactly where each Neon variable should go.

## 1) Local Development File

File: `.env` (already updated locally)

- `DATABASE_URL`  
  Use Neon pooled URL (`...-pooler...`) for runtime app/database access.

- `DIRECT_URL`  
  Use Neon non-pooled URL (`...neon.tech...` without `-pooler`) for Prisma schema operations.

- `DATABASE_URL_UNPOOLED`  
  Optional helper copy of non-pooled URL for reference.

- `VITE_API_BASE_URL`  
  Local frontend -> local backend URL, e.g. `http://localhost:4000`.

- `API_PORT`, `JWT_SECRET`, `CLIENT_ORIGIN`, `UPLOADS_DIR`, seed admin vars  
  Keep as per your backend setup.

## 2) Prisma Schema

File: `prisma/schema.prisma`

Datasource uses:

- `url = env("DATABASE_URL")`
- `directUrl = env("DIRECT_URL")`

So Prisma migrations/push use `DIRECT_URL`, while runtime uses `DATABASE_URL`.

## 3) Vercel (Frontend Project)

In Vercel Project -> Settings -> Environment Variables:

- `VITE_API_BASE_URL` = your deployed backend base URL  
  Example: `https://your-api-domain.com`

Frontend Vercel project does **not** need DB credentials directly.

## 4) Backend Hosting Environment

Wherever your backend runs (Render/Railway/Fly/other), set:

- `DATABASE_URL` = pooled Neon URL
- `DIRECT_URL` = non-pooled Neon URL
- `CLIENT_ORIGIN` = your Vercel frontend URL
- `JWT_SECRET` = secure random secret
- `API_PORT`, `UPLOADS_DIR` as needed

## 5) Safety

- `.env` is now ignored by git (`.gitignore` updated).
- Never commit real passwords/connection strings.
- If any secret was ever shared publicly, rotate it in Neon immediately.
