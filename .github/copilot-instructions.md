# Copilot Instructions for kyrgyz-kanban

Purpose: Quick, action-oriented guidance to help AI coding agents be productive in this repo.

## Big picture
- Frontend: React + Vite in `/src`. Core UI and app state live in `src/App.jsx` (board/list/card logic, drag-and-drop, local persistence). UI text/i18n lives in `src/translations.js`.
- Backend: FastAPI in `/backend` with `main.py`, `database.py`, `models.py`. `main.py` exposes routers under `/api/*` and enables CORS for the Vite dev origin.
- Two persistence modes visible in the code:
  - Frontend-local / offline mode: App stores users and boards in localStorage (keys like `kanban-users`, `kanban-current-user`, `kanban-boards-{user.id}`).
  - API mode: `src/api.js` talks to a backend at `http://localhost:8000/api` using a Bearer token stored as `kanban-token`.

## How to run (developer flows)
- Frontend (dev):
  - npm install
  - npm run dev  (Vite server, default http://localhost:5173)
  - build: `npm run build`, preview: `npm run preview`
- Backend (dev):
  - pip install -r backend/requirements.txt
  - uvicorn backend.main:app --reload --port 8000
  - API docs: http://localhost:8000/docs
- Integration: start backend (8000) and frontend (5173); backend CORS already allows `http://localhost:5173`.

## Data & conventions to be aware of
- ID type: models use string primary keys (see `backend/models.py`). Frontend generates string IDs with `Date.now().toString()` and card ids like `${listId}-${Date.now()}` — keep id types consistent if adding server-side id generation.
- Ordering: backend models use `position` for lists/cards ordering (`List.position`, `Card.position`); frontend maintains order via arrays and drag-and-drop — when implementing server persistence, map array order <> `position` explicitly.
- Auth & tokens:
  - Frontend local auth: `src/Auth.jsx` uses `localStorage` (`kanban-users`, `kanban-current-user`) for demo auth.
  - API auth: `src/api.js` sends Authorization: `Bearer <token>` (token saved to `kanban-token`). Backend declares `HTTPBearer` in `main.py` — expect Bearer token-based endpoints.
- Local features:
  - Theme is persisted in `kanban-theme` and toggles `document.body` class `theme-dark`.
  - Assistant panel in `App.jsx` is a local summary generator (no external AI / network call).

## API / backend expectations (concrete examples)
- README lists these key endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/boards`, `/api/boards/{id}`, `/api/boards/{id}/lists`, `/api/cards/{id}/move`, etc.
- If you add or modify endpoints, match the paths and payload shape `src/api.js` expects (JSON body for create/update; move uses query params `?target_list_id=&new_position=`).

## Common tasks and quick how-tos for agents
- Wire frontend to backend for persistent storage:
  - Replace localStorage usage in `src/App.jsx` and `src/Auth.jsx` with calls to `src/api.js` (authAPI.* and boardsAPI.*). Ensure tokens are saved under `kanban-token` to keep compatibility with `src/api.js`.
  - When persisting board/list/card ordering to backend, compute numeric `position` from array indices and sync on drag events.
- Add new language strings: update `src/translations.js` and use `getTranslation(lang, key)`.
- Debugging network errors: `src/api.js` throws with message from response JSON. Use browser devtools network tab + check `localStorage` keys for expected tokens/user objects.
- DB changes: no migrations are present — `backend/main.py` calls `Base.metadata.create_all(...)` to create tables automatically. If switching to PostgreSQL, set `DATABASE_URL` environment variable in `backend/database.py`.

## Files to inspect for context
- Frontend: `src/App.jsx`, `src/Auth.jsx`, `src/api.js`, `src/translations.js`.
- Backend: `backend/main.py`, `backend/database.py`, `backend/models.py`, `backend/README.md`.

## Small gotchas / notes
- There may be missing router files referenced by `backend/main.py` (it imports `routers.auth`, `routers.boards`, etc.). Confirm `backend/routers` exists or create expected router implementations matching the README endpoints.
- Keep id type as string across front/back. Ensure `position` consistency on server-side moves.
- The project currently supports an offline demo mode using localStorage — do not remove/demo logic without providing a migration path or toggle.

---

If you'd like, I can:
- Create a short checklist PR to switch App/Auth from localStorage to backend APIs (small incremental steps), or
- Add example tests for API endpoints and basic E2E flow.

Please tell me which section to expand or any missing details you want included. 😊