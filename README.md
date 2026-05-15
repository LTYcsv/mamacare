<h1 align="center">🤰 MamaCare</h1>

<p align="center">
  <strong>A full-stack pregnancy diary with an AI assistant</strong><br/>
  Daily check-ins · Week tracker · Symptom alerts · AI chat
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-8.0_beta-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Zod-4.4-3068B7?style=flat-square" alt="Zod"/>
  <img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="MIT"/>
</p>

---

## Features

| Screen | Description |
|--------|-------------|
| **Daily check-in** | Mood (5 levels), 8 symptom toggles, notes on well-being, activity, nutrition |
| **Week tracker** | Current pregnancy week (1–42) and trimester with visual progress |
| **AI chat** | Evidence-based Q&A via Yandex AI Studio — routed through the backend, API key never reaches the browser |
| **Weekly summary** | AI-generated digest of diary entries for the current week |
| **Symptom alerts** | Automatic detection of warning symptoms → shows doctor contact immediately |
| **Doctor card** | Name, specialty, phone number, clinic |
| **Auth** | JWT access token + httpOnly refresh cookie with rotation and reuse detection |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Browser (SPA)                  │
│  React 19 · Vite 8 · Zero UI libraries      │
│  Access token in memory · apiFetch + 401     │
└──────────────────┬──────────────────────────┘
                   │ REST /api/*
┌──────────────────▼──────────────────────────┐
│           Express 4 (Node.js)               │
│  Helmet · CORS · Rate-limit · Zod validate  │
│  JWT middleware · Refresh-rotation          │
│  /api/chat  →  Yandex AI Studio (proxy)     │
└─────────┬────────────────────────┬──────────┘
          │ pg                     │ HTTPS
┌─────────▼──────────┐   ┌─────────▼──────────┐
│   PostgreSQL 16     │   │  Yandex AI Studio  │
│  users · entries    │   │  (chat agent)      │
│  refresh_tokens     │   └────────────────────┘
└────────────────────┘
```

All three services are wired with **Docker Compose**:
`docker compose up` → postgres, backend, and a production-built Nginx frontend.

---

## Security highlights

- **Refresh token rotation** — every `/auth/refresh` atomically revokes the previous `jti`; reuse of a revoked token revokes *all* tokens for that user
- **httpOnly cookie** — refresh token is never accessible from JS; `__Host-` prefix enforced in production
- **Helmet** — security headers on every response
- **Rate limiting** — `express-rate-limit` on all API routes
- **Zod schemas** — every route validates the request body before touching the database
- **bcrypt** — passwords hashed (cost factor 10)
- **AI key isolation** — Yandex API key lives in `backend/.env` only; the frontend never sees it

---

## Quick start

### With Docker (recommended)

```bash
git clone https://github.com/LTYcsv/mamacare.git
cd mamacare

# Fill in env files
cp backend/.env.example backend/.env   # add JWT_SECRET and YANDEX_* keys
# edit root .env: POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB

docker compose up --build
```

App → `http://localhost:5173` · API → `http://localhost:3001`

### Manual (dev)

```bash
# 1. Start PostgreSQL (or point DATABASE_URL at an existing instance)

# 2. Backend
cd backend && npm install && npm run dev

# 3. Frontend (new terminal)
cd mamacare && npm install && npm run dev
```

---

## Environment variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `JWT_SECRET` | Random secret for signing JWTs (min 32 chars) |
| `YANDEX_API_KEY` | Yandex Cloud IAM API key |
| `YANDEX_FOLDER_ID` | Yandex Cloud folder ID |
| `YANDEX_CHAT_AGENT_ID` | AI Studio agent ID |
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Origin allowed by CORS (e.g. `http://localhost:5173`) |

**Root `.env`** — `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (used by Docker Compose)

---

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login → access token + refresh cookie |
| POST | `/api/auth/refresh` | cookie | Rotate refresh token |
| POST | `/api/auth/logout` | cookie | Revoke refresh token |
| GET / PUT | `/api/users/me` | Bearer | Profile (name, week, doctor) |
| GET / PUT | `/api/entries/:date` | Bearer | Diary entry — upsert by `(user_id, date)` |
| GET | `/api/entries` | Bearer | List entries |
| POST | `/api/chat` | Bearer | Proxy to Yandex AI Studio |
| GET | `/api/summary` | Bearer | AI weekly summary |

---

## Project structure

```
MamaCare/
├── docker-compose.yml
├── db/
│   └── init.sql                  # Schema: users, entries, refresh_tokens
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── index.js              # Express app, Helmet, CORS, rate-limit
│       ├── db.js                 # pg Pool
│       ├── middleware/
│       │   └── auth.js           # requireAuth, validate (Zod)
│       └── routes/
│           ├── auth.js           # register · login · refresh · logout
│           ├── users.js          # profile CRUD
│           ├── entries.js        # diary entries
│           ├── chat.js           # Yandex AI proxy
│           └── summary.js        # AI weekly digest
└── mamacare/
    ├── Dockerfile
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── lib/
        │   └── apiFetch.js       # Fetch wrapper: silent 401 → refresh → retry
        ├── constants.js          # Symptom list, mood labels
        └── pages/
            ├── Welcome.jsx / Login.jsx / Register.jsx
            ├── Checkin.jsx       # Daily diary form
            ├── Diary.jsx         # Entry history
            ├── Chat.jsx          # AI chat UI
            ├── Summary.jsx       # Weekly AI digest
            ├── Profile.jsx / ProfileSetup.jsx / DoctorSetup.jsx
            └── Alert.jsx         # Warning symptom overlay
```

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8 (beta), JSX, inline CSS — zero UI library dependencies |
| Backend | Node.js 18+, Express 4, ES Modules |
| Database | PostgreSQL 16, `node-postgres` (pg) |
| Auth | JWT (access in memory · refresh in httpOnly cookie), bcrypt |
| Validation | Zod 4 |
| Security | Helmet, express-rate-limit, CORS |
| AI | Yandex AI Studio (backend proxy) |
| Infra | Docker Compose (3 services: frontend · backend · postgres) |

---

## License

MIT
