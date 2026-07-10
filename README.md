<div align="center">

# 🚌 Highway Hoppers — Backend

**A production-ready REST API for a bus ticket booking platform across Bangladesh.**

Built with Express, TypeScript, Prisma & PostgreSQL — featuring JWT auth, role-based access, seat-level booking, image uploads, and a fully containerized dev workflow.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**Live API:** https://highway-hoppers-backend.onrender.com/api/v1 &nbsp;·&nbsp; **Frontend:** https://highway-hoppers-frontend.vercel.app

</div>

---

## ✨ Features

- **JWT authentication** with access + refresh tokens and bcrypt password hashing
- **Role-based access control** — `SUPERADMIN`, `ADMIN`, `DRIVER`, `TRAVELLER`
- **Seat-level booking** — per-seat reservation with availability checks and double-booking prevention
- **Schedule management** — routes, timings, fares, driver/bus assignment with conflict detection
- **Image uploads** — Cloudinary in production, local disk in development (auto-detected)
- **Request validation** with Zod schemas on every mutating route
- **Structured logging** via Winston with daily-rotated log files
- **Type-safe database access** with Prisma ORM
- **Containerized** — one command spins up Postgres + API with hot reload

## 🧱 Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Runtime    | Node.js + TypeScript                    |
| Framework  | Express                                 |
| ORM / DB   | Prisma · PostgreSQL                     |
| Auth       | JSON Web Tokens · bcrypt                |
| Validation | Zod                                     |
| Uploads    | Multer · Cloudinary                     |
| Logging    | Winston                                 |
| Tooling    | ts-node-dev · ESLint · Prettier · Husky |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ **or** Docker Desktop
- A PostgreSQL database (local, or hosted like Supabase)

### Option A — Docker (recommended)

From the repository root (which contains `docker-compose.yml`):

```bash
docker compose up --build
```

This starts PostgreSQL, applies migrations, and runs the API with hot reload on **http://localhost:5000**.

### Option B — Local Node

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env      # then fill in the values (see below)

# 3. Apply the database schema
npm run prisma:migrate

# 4. Start the dev server
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file (see [`.env.example`](.env.example)):

| Variable                 | Description                                    | Example                               |
| ------------------------ | ---------------------------------------------- | ------------------------------------- |
| `NODE_ENV`               | `development` or `production`                  | `development`                         |
| `PORT`                   | Server port                                    | `5000`                                |
| `DATABASE_URL`           | PostgreSQL connection string                   | `postgresql://user:pass@host:5432/db` |
| `CLIENT_SITE`            | Allowed CORS origin (frontend URL)             | `http://localhost:3000`               |
| `BCRYPT_SALT_ROUNDS`     | Password hashing rounds                        | `12`                                  |
| `JWT_SECRET`             | Access-token signing secret                    | _(long random string)_                |
| `JWT_REFRESH_SECRET`     | Refresh-token signing secret                   | _(long random string)_                |
| `JWT_EXPIRES_IN`         | Access-token lifetime                          | `1d`                                  |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime                         | `365d`                                |
| `CLOUDINARY_URL`         | Cloudinary credentials (enables cloud uploads) | `cloudinary://key:secret@cloud`       |

> **Never commit `.env`.** It is gitignored. In production, set these in your host's dashboard.

## 📡 API Overview

Base path: `/api/v1`

| Resource  | Base Route      | Purpose                                          |
| --------- | --------------- | ------------------------------------------------ |
| Auth      | `/auth`         | Sign up, sign in, refresh token, change password |
| Upload    | `/upload`       | Image upload (Cloudinary / disk)                 |
| Profile   | `/user`         | View & update the authenticated user's profile   |
| Buses     | `/bus`          | CRUD for buses (auto-generates seats)            |
| Schedules | `/bus-schedule` | CRUD for routes; available-seat & status queries |
| Bookings  | `/booking`      | Create, confirm, cancel seat bookings            |
| Reviews   | `/review`       | Post, update, delete journey reviews             |
| Drivers   | `/driver`       | Create & manage drivers                          |

<details>
<summary><strong>Common endpoints</strong></summary>

```http
POST /api/v1/auth/signUp          # register a user
POST /api/v1/auth/signIn          # login → returns access token
GET  /api/v1/bus-schedule         # list schedules (public, filterable)
GET  /api/v1/bus-schedule/:id/availableSits
POST /api/v1/booking/create-booking   # (auth) reserve seats
GET  /api/v1/user/my-profile      # (auth) current profile
PATCH /api/v1/user/update-profile # (auth) edit profile
POST /api/v1/upload               # (auth) upload image
```

</details>

## 📜 Scripts

| Command                  | Description                      |
| ------------------------ | -------------------------------- |
| `npm run dev`            | Start dev server with hot reload |
| `npm run build`          | Compile TypeScript to `dist/`    |
| `npm run start:prod`     | Run the compiled build           |
| `npm run prisma:migrate` | Create & apply a migration (dev) |
| `npm run prisma:deploy`  | Apply migrations (production)    |
| `npm run prisma:studio`  | Open Prisma Studio (DB GUI)      |
| `npm run lint:check`     | Lint the codebase                |
| `npm run prettier:fix`   | Format the codebase              |

## 🗂️ Project Structure

```
src/
├─ app/
│  ├─ middlewares/      # auth, validation, error handling
│  ├─ modules/          # feature modules (auth, bus, booking, driver, ...)
│  │  └─ <module>/      # route · controller · service · validation · interface
│  └─ routes/           # central route registry
├─ config/              # env config loader
├─ errors/              # custom error classes
├─ helpers/             # JWT, pagination, utilities
├─ shared/              # Prisma client, response helpers
├─ app.ts               # Express app setup
└─ server.ts            # HTTP bootstrap
prisma/
├─ schema.prisma        # data model
└─ migrations/          # migration history
```

## ☁️ Deployment

Deployed on **Render** as a Docker web service.

1. Push to GitHub
2. Render → **New Web Service** → connect this repo (auto-detects [`render.yaml`](render.yaml))
3. Set the `sync: false` env vars in the Render dashboard (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_SITE`, `CLOUDINARY_URL`)
4. Deploy — migrations run automatically on boot

> **Hosted database note:** use an **IPv4-reachable** connection string (e.g. a Supabase _Session pooler_ URL) — Render's network is IPv4-only.

## 👤 Author

**Md Imran Hossain**

---

<div align="center">
<sub>Built with TypeScript, Express & Prisma.</sub>
</div>
