# Database selection

The backend uses one database provider for both users and tasks. Set `DATABASE_MODE` in the project `.env`, then restart the backend. Existing records are not copied when changing providers; each provider has its own data.

```env
# Choose: mongo, firebase, or postgres
DATABASE_MODE=mongo
```

## MongoDB

Set `DATABASE_MODE=mongo` and configure `MONGODB_URI`.

## Firebase Firestore

Set `DATABASE_MODE=firebase` and configure `FIREBASE_CREDENTIALS` to the service account JSON file path.

## PostgreSQL

Install backend requirements (`pip install -r requirements.txt`), set `DATABASE_MODE=postgres`, and configure either connection variable:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_database
```

`POSTGRESQL_URI` is also accepted as an alternative to `DATABASE_URL`. The backend creates the `users` and `tasks` tables on startup.
