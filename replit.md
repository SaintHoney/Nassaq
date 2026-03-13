# NASSAQ - نَسَّق
Smart Multi-Tenant School Management System

## Architecture
- **Frontend**: React (CRA + CRACO), port 5000 (dev), located in `frontend/`
- **Backend**: FastAPI (Python), port 8001 (dev) / port 5000 (production), located in `backend/`
- **Database**: MongoDB, running locally at `localhost:27017`, data at `/home/runner/data/mongodb`

## Running the App (Development)
- **Frontend**: `cd frontend && yarn start` → port 5000
- **Backend**: `bash start_backend.sh` → starts MongoDB + uvicorn on port 8001
- Dev server proxy forwards `/api` and `/ws` from port 5000 to port 8001

## Running the App (Production / Deployment)
- `bash start_production.sh` → builds frontend, starts MongoDB + uvicorn on port 5000
- Backend serves both the API (`/api/*`) and the built React frontend (static files + SPA fallback)
- Build step: `cd frontend && yarn build` (with `REACT_APP_BACKEND_URL=''`)

## Key Config Files
- `frontend/.env` - Frontend env vars (`REACT_APP_BACKEND_URL` is empty; API calls are relative and proxied)
- `frontend/src/setupProxy.js` - Dev server proxy: `/api` and `/ws` → `http://localhost:8001`
- `backend/.env` - Backend env vars: `MONGO_URL`, `DB_NAME`, `JWT_SECRET_KEY`, etc.
- `frontend/craco.config.js` - CRACO config with dev server settings (allowedHosts: "all", host: 0.0.0.0, port: 5000)
- `start_backend.sh` - Dev startup (MongoDB + backend on port 8001)
- `start_production.sh` - Production startup (MongoDB + backend on port 5000, serves built frontend)

## Workflows
- `Start application` (webview, port 5000) - React frontend dev server
- `Backend` (console, port 8001) - MongoDB + FastAPI backend dev server

## API Proxy
- In dev: Frontend uses `setupProxy.js` to proxy `/api` and `/ws` requests to the backend at `http://localhost:8001`
- In prod: Backend serves everything on port 5000 (API + static frontend build)
- `REACT_APP_BACKEND_URL` is set to empty string so all API calls use relative URLs

## Test Accounts (seeded via `backend/scripts/seed_exact_test_data.py`)
- Platform Admin: `admin@nassaq.com` / `Admin@123`
- Principal (مدرسة النور): `principal1@nassaq.com` / `Principal@123`
- Principal (مدرسة الأحساء): `principal4@nassaq.com` / `Principal@123`
- Teacher (النور): `teacher1@nor.edu.sa` / `Teacher@123`
- Student (النور): `student1@nor.edu.sa` / `Student@123`

## Test Data
- 2 schools: مدرسة النور (SCH-001), مدرسة الأحساء (SCH-002)
- 5 teachers, 25 students, 3 classes per school
- Official curriculum (stages, tracks, grades, subjects) seeded via `backend/scripts/run_complete_seed.py`

## Important Notes
- `emergentintegrations` package is not publicly available; it is used lazily (inside a function) for LLM features only
- Backend CORS is set to `*` via `CORS_ORIGINS` env var
- Frontend uses Arabic RTL layout (NASSAQ is an Arabic school management platform)
- The `WDS_SOCKET_PORT=443` env var handles WebSocket for hot reload through Replit's proxy
- User password field in DB is `password_hash` (not `password`)

## Dependencies
- Python deps: `backend/requirements.txt` (install with `pip install -r backend/requirements_filtered.txt` to skip `emergentintegrations`)
- Node deps: `frontend/` (install with `yarn install`)
