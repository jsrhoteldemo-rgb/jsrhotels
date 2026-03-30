# JSR Hotels Dynamic CMS

This project now includes:

- React + Vite public website
- Node.js + Express backend API
- PostgreSQL + Prisma data layer
- Admin panel at `/admin`
- Dynamic CMS content with fallback to static data on public pages
- Portfolio detail pages with image gallery and USA-only address workflow
- Multi-admin support with guardrails:
  - Admin cannot delete themselves
  - System admin cannot be deleted
- Activity logs and insights dashboard

## Tech Stack

- Frontend: React, TypeScript, Vite, Framer Motion
- Backend: Express, Prisma, JWT auth, Multer uploads
- Database: PostgreSQL

## 1) Setup

```bash
cp .env.example .env
npm install
```

Update `.env` with your PostgreSQL credentials.

## 2) Database Init

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## 3) Start Dev Servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Admin panel: http://localhost:5173/admin

## Seed Login

- Email: `admin@jsrhotels.com`
- Password: `Admin@123`

(You can change these using `.env` before running `db:seed`.)

## Available Scripts

- `npm run dev` - Run frontend + backend in parallel
- `npm run dev:client` - Frontend only
- `npm run dev:server` - Backend only
- `npm run build` - Frontend production build + type-check
- `npm run lint` - ESLint
- `npm run db:generate` - Prisma client generation
- `npm run db:push` - Push Prisma schema to PostgreSQL
- `npm run db:seed` - Seed CMS/admin starter data

## API Overview

### Public API (`/api/public`)

- `GET /site-settings`
- `GET /home`
- `GET /about`
- `GET /team`
- `GET /services`
- `GET /contact`
- `GET /footer`
- `GET /legal/:type`
- `GET /brands`
- `GET /portfolio`
- `GET /portfolio/:slug`
- `POST /view-events`
- `GET /us/states`
- `GET /us/cities?state=CA`
- `GET /address-search?q=...`

### Admin Auth (`/api/admin/auth`)

- `POST /setup-first-admin`
- `POST /login`
- `GET /me`

### Admin Protected (`/api/admin`)

- Dashboard, logs, admin management
- CRUD for home blocks, about sections, services, team members, brands, social links
- Contact/site/legal updates
- Portfolio CRUD + gallery image CRUD
- Upload endpoint: `POST /api/admin/uploads` (multipart field: `file`)

## Notes

- Public pages automatically fall back to static content if API reads fail.
- Property countries are enforced as USA.
- States and cities come from open-source dataset (`country-state-city`).
- Address autofill uses OpenStreetMap Nominatim through backend proxy.
