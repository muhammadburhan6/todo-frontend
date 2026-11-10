# Todo app frontend

The React + Vite frontend uses the Flask API for signup, login, and tasks. The backend stores both users and tasks in the provider selected by `DATABASE_MODE` in the project-root `.env` file.

## Run locally

1. Configure the backend database in the project-root `.env`.
2. Start the Flask backend from the project root on `http://127.0.0.1:5000`.
3. In this directory, run `npm install` and then `npm run dev`.
4. Open `http://localhost:5173`.

Vite proxies API requests to Flask. For Firebase, set `DATABASE_MODE=firebase` and configure `FIREBASE_CREDENTIALS` to a valid service-account JSON file. Signup and login are handled by the backend, so Supabase email-confirmation settings do not apply. Existing Supabase accounts are not copied into Firebase; create a new app account after switching providers.

## Quality checks

Run `npm run lint` and `npm run build` from this directory.
