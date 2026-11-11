# Todo App

A full-stack todo application with a React and Vite frontend, a Flask API, JWT-based authentication, and pluggable database adapters. The current local configuration uses Firebase Firestore.

## Features

- Sign up, log in, and view the authenticated user's profile.
- Create, list, update, and delete tasks.
- Keep tasks scoped to the authenticated user.
- Choose Firebase Firestore, MongoDB, PostgreSQL, or temporary in-memory storage.
- Start the backend and frontend together with one development command. The launcher waits for the backend health endpoint before starting Vite.

## Requirements

- Node.js and npm
- Python 3.10 or newer
- A Firebase project with Cloud Firestore enabled (for Firebase mode)

## Local setup

1. Create and activate a Python virtual environment from the repository root:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   On macOS or Linux, activate it with `source .venv/bin/activate`.

2. Install backend dependencies:

   ```powershell
   python -m pip install -r backend/requirements.txt
   ```

3. Install frontend dependencies:

   ```powershell
   npm --prefix frontend install
   ```

4. Create a root `.env` file. For Firebase, configure it like this:

   ```dotenv
   DATABASE_MODE=firebase
   FIREBASE_CREDENTIALS=secrets/firebase-service-account.json
   JWT_SECRET_KEY=replace-with-a-long-random-secret
   ```

   Put your Firebase service-account JSON at the path given by `FIREBASE_CREDENTIALS`. Relative credential paths are resolved from the repository root. Keep `.env` and service-account keys private; do not commit them.

5. Start the app from the repository root:

   ```powershell
   npm run dev
   ```

   Open the Vite URL shown in the terminal, usually `http://127.0.0.1:5173`. The Flask API runs at `http://127.0.0.1:5000`.

## Database configuration

Set `DATABASE_MODE` in the root `.env` file:

| Value | Storage | Required environment variable |
| --- | --- | --- |
| `firebase` | Firebase Firestore | `FIREBASE_CREDENTIALS` |
| `mongodb` or `mongo` | MongoDB | `MONGODB_URI` |
| `postgres` or `postgresql` | PostgreSQL | `DATABASE_URL` or `POSTGRESQL_URI` |
| `memory` | In-memory, temporary | None |

Only the selected provider is initialized. Switching providers does not migrate or copy records. See [backend/DATABASE_SETUP.md](backend/DATABASE_SETUP.md) for provider details.

## API overview

All task endpoints require a valid bearer token. Signup and login return the authentication result used by the frontend.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/signup` or `/auth/signup` | Create an account |
| `POST` | `/login` or `/auth/login` | Log in |
| `GET` | `/me` or `/auth/me` | Get the signed-in user's profile |
| `GET` | `/tasks` | List the signed-in user's tasks |
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks/<task_id>` | Get one task |
| `PUT` | `/tasks/<task_id>` | Replace task fields |
| `PATCH` | `/tasks/<task_id>` | Update selected task fields |
| `DELETE` | `/tasks/<task_id>` | Delete a task |
| `GET` | `/api` | API status and endpoint list |

The frontend's Vite server proxies API requests to Flask during development.

## Project layout

```text
backend/
  application/       Services and DTOs
  domain/entities/   Task and user entities
  infrastructure/
    repositories/
      firebase/      Firestore adapters
      mongodb/       MongoDB adapters
      postgresql/    PostgreSQL adapters
      in_memory_*.py Temporary adapters
  presentation/      Flask controllers, routes, and middleware
frontend/            React app and Vite configuration
dev.js               Starts Flask, waits for readiness, then starts Vite
```

## Frontend checks

Run these from the `frontend` directory:

```powershell
npm run lint
npm run build
```
