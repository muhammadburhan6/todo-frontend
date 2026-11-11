# Database selection and isolation

The repository-root `.env` selects one provider for both authentication and tasks. Set `DATABASE_MODE`, stop the running development server, then run `npm.cmd run dev` again on Windows (or `npm run dev` elsewhere). The backend prints the active provider at startup and reports it at `/api`.

```env
DATABASE_MODE=mongodb
```

Supported values and required connection settings:

| `DATABASE_MODE` | Provider | Required setting |
| --- | --- | --- |
| `mongodb` or `mongo` | MongoDB | `MONGODB_URI` |
| `firebase` | Firebase Firestore | `FIREBASE_CREDENTIALS` (service-account JSON path; relative paths resolve from the repository root) |
| `postgres` or `postgresql` | PostgreSQL | `DATABASE_URL` (`POSTGRESQL_URI` is also accepted) |

Only the selected provider is initialized. Each provider stores its own users and tasks; changing `DATABASE_MODE` does not copy, merge, or delete records in the other providers. Switching back to a provider makes its existing records available again. Users must sign in again after a provider change because tokens are tied to the active provider.

PostgreSQL creates the app's `users` and `tasks` tables on startup. Install backend requirements from the repository root with `pip install -r backend/requirements.txt`.

## Supabase note

The current Python backend does not have a Supabase Auth/Database adapter. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` only configure the unused frontend Supabase client; they do not switch this app to Supabase. The `backend/supabase/schema.sql` `public.todos` table also does not match the Python PostgreSQL adapter's `users`/`tasks` tables. To use this app with a Supabase-hosted PostgreSQL database through `DATABASE_MODE=postgres`, provide its PostgreSQL connection URI; the app will use its own `users` and `tasks` tables and its own password/JWT authentication. It will not use Supabase Auth or `public.todos`.
