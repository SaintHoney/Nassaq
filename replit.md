# NASSAQ - نَسَّق
Smart Multi-Tenant School Management System

## Architecture
- **Frontend**: React (CRA + CRACO), port 5000 (dev), located in `frontend/`
- **Backend**: FastAPI (Python), port 8001 (dev) / port 5000 (production), located in `backend/`
- **Database**: PostgreSQL (Replit built-in) via `DATABASE_URL`, with MongoDB-compatible DAL (`backend/pg_dal.py`)
  - Each MongoDB collection maps to a PostgreSQL table with `_id TEXT PK` + `data JSONB`
  - All CRUD operations use MongoDB-style API: `find_one`, `find`, `insert_one`, `update_one`, `delete_one`, etc.
  - Supports `$set/$inc/$push/$pull/$addToSet/$unset`, `$or/$and/$in/$nin/$gte/$lte/$regex/$exists`, projection, sorting, skip/limit

## Running the App (Development)
- **Frontend**: `cd frontend && yarn start` → port 5000
- **Backend**: `bash start_backend.sh` → uvicorn on port 8001
- Dev server proxy forwards `/api` and `/ws` from port 5000 to port 8001

## Running the App (Production / Deployment)
- `bash start_production.sh` → builds frontend, uvicorn on port 5000
- Backend serves both the API (`/api/*`) and the built React frontend (static files + SPA fallback)
- Build step: `cd frontend && yarn build` (with `REACT_APP_BACKEND_URL=''`)

## Key Config Files
- `frontend/.env` - Frontend env vars (`REACT_APP_BACKEND_URL` is empty; API calls are relative and proxied)
- `frontend/src/setupProxy.js` - Dev server proxy: `/api` and `/ws` → `http://localhost:8001`
- `backend/.env` - Backend env vars: `CORS_ORIGINS`, `JWT_SECRET_KEY`, etc.
- `frontend/craco.config.js` - CRACO config with dev server settings (allowedHosts: "all", host: 0.0.0.0, port: 5000)
- `start_backend.sh` - Dev startup (backend on port 8001)
- `start_production.sh` - Production startup (backend on port 5000, serves built frontend)

## Workflows
- `Start application` (webview, port 5000) - React frontend dev server
- `Backend` (console, port 8001) - FastAPI backend dev server

## API Proxy
- In dev: Frontend uses `setupProxy.js` to proxy `/api` and `/ws` requests to the backend at `http://localhost:8001`
- In prod: Backend serves everything on port 5000 (API + static frontend build)
- `REACT_APP_BACKEND_URL` is set to empty string so all API calls use relative URLs

## Test Accounts (seeded on startup)
- Platform Admin: `admin@nassaq.com` / `Admin@123`
- Principal (مدرسة النور): `principal1@nassaq.com` / `Principal@123`
- Principal (مدرسة الأحساء): `principal4@nassaq.com` / `Principal@123`
- Teachers: `teacher1@nassaq.com` through `teacher10@nassaq.com` / `Teacher@123`
- Students: `student1@nassaq.com` through `student30@nassaq.com` / `Student@123`
- Parents: `parent1@nassaq.com` through `parent30@nassaq.com` / `Parent@123`

## Test Data
- 2 schools: مدرسة النور (SCH-001), مدرسة الأحساء (SCH-002)
- Official curriculum: 6 stages, 7 tracks, 29 grades, 74 subjects, 390 grade-subject mappings (verbatim from MOE)
- Teacher rank loads: 6 ranks with official weekly period counts
- Bell schedules: 2 templates (Primary/Intermediate 45min, Secondary 50min)
- Academic year: 1446-1447H with 3 terms
- Demo school data for SCH-001: 10 teachers, 30 students, 6 classes, 30 parent accounts
- All curriculum data auto-seeded on startup via `backend/seed_curriculum.py`

## Important Notes
- `emergentintegrations` package is not publicly available; it is used lazily (inside a function) for LLM features only
- Backend CORS is set to `*` via `CORS_ORIGINS` env var
- Frontend uses Arabic RTL layout (NASSAQ is an Arabic school management platform)
- The `WDS_SOCKET_PORT=443` env var handles WebSocket for hot reload through Replit's proxy
- User password field in DB is `password_hash` (not `password`)
- Server auto-seeds essential accounts (admin + principals + schools) on startup if they don't exist
- School settings are persisted to PostgreSQL `school_settings` table via `PUT /api/school/settings`
- MongoDB is fully replaced by PostgreSQL — no MongoDB dependency remains in the runtime code
- Seed scripts in `backend/scripts/` still reference Motor/MongoDB and need migration if needed

## Dependencies
- Python deps: `backend/requirements.txt` (install with `pip install -r backend/requirements_filtered.txt` to skip `emergentintegrations`)
- Key Python packages: `fastapi`, `uvicorn`, `asyncpg` (PostgreSQL driver), `pyjwt`, `bcrypt`, `pydantic`
- Node deps: `frontend/` (install with `yarn install`)
