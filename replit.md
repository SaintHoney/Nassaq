# NASSAQ - نَسَّق
Smart Multi-Tenant School Management System

## Architecture
- **Frontend**: React (CRA + CRACO), port 5000, located in `frontend/`
- **Backend**: FastAPI (Python), port 8001, located in `backend/`
- **Database**: MongoDB, running locally at `localhost:27017`, data at `/home/runner/data/mongodb`

## Running the App
- **Frontend**: `cd frontend && yarn start` → port 5000
- **Backend**: `bash start_backend.sh` → starts MongoDB + uvicorn on port 8001

## Key Config Files
- `frontend/.env` - Frontend env vars including `REACT_APP_BACKEND_URL`
- `backend/.env` - Backend env vars: `MONGO_URL`, `DB_NAME`, `JWT_SECRET_KEY`, etc.
- `frontend/craco.config.js` - CRACO config with dev server settings (allowedHosts: "all")

## Workflows
- `Start application` (webview, port 5000) - React frontend
- `Backend` (console, port 8001) - MongoDB + FastAPI backend

## Important Notes
- `emergentintegrations` package is not publicly available; it is used lazily (inside a function) for LLM features only
- Backend CORS is set to `*` via `CORS_ORIGINS` env var
- Frontend uses Arabic RTL layout (NASSAQ is an Arabic school management platform)
- The `WDS_SOCKET_PORT=443` env var handles WebSocket for hot reload through Replit's proxy

## Dependencies
- Python deps: `backend/requirements.txt` (install with `pip install -r backend/requirements_filtered.txt` to skip `emergentintegrations`)
- Node deps: `frontend/` (install with `yarn install`)
