from datetime import datetime, timezone

from psycopg.errors import UniqueViolation

from domain.entities.auth_entities import User
from infrastructure.repositories.postgresql.postgres_task_repository import get_postgres_connection


class PostgresUserRepository:
    def __init__(self, connection=None):
        self.connection = connection or get_postgres_connection()

    @staticmethod
    def _user(row):
        return User(user_id=row[0], email=row[1], password_hash=row[2], created_at=row[3])

    def create(self, user):
        email = user.email.strip().lower()
        created_at = user.created_at or datetime.now(timezone.utc)
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("INSERT INTO users (email, password_hash, created_at) VALUES (%s, %s, %s) RETURNING id", (email, user.password_hash, created_at))
                user.id = cursor.fetchone()[0]
            self.connection.commit()
        except UniqueViolation as exc:
            self.connection.rollback()
            raise ValueError("A user with this email already exists") from exc
        user.email, user.created_at = email, created_at
        return user

    def get_by_email(self, email):
        if not email:
            return None
        with self.connection.cursor() as cursor:
            cursor.execute("SELECT id, email, password_hash, created_at FROM users WHERE email = %s", (str(email).strip().lower(),))
            row = cursor.fetchone()
        return self._user(row) if row else None

    def get_by_id(self, user_id):
        try:
            user_id = int(user_id)
        except (TypeError, ValueError):
            return None
        with self.connection.cursor() as cursor:
            cursor.execute("SELECT id, email, password_hash, created_at FROM users WHERE id = %s", (user_id,))
            row = cursor.fetchone()
        return self._user(row) if row else None
