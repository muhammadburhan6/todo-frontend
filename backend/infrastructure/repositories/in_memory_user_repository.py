from datetime import datetime, timezone

from domain.entities.auth_entities import User


class InMemoryUserRepository:

    def __init__(self):
        self.users = []
        self.next_id = 1

    def create(self, user):
        email = user.email.lower().strip()
        if self.get_by_email(email):
            raise ValueError("A user with this email already exists")

        user.id = self.next_id
        user.email = email
        user.created_at = user.created_at or datetime.now(timezone.utc)
        self.next_id += 1
        self.users.append(user)
        return user

    def get_by_email(self, email):
        if not email:
            return None
        normalized_email = str(email).lower().strip()
        return next(
            (user for user in self.users if user.email == normalized_email),
            None
        )

    def get_by_id(self, user_id):
        try:
            numeric_id = int(user_id)
        except (TypeError, ValueError):
            return None
        return next(
            (user for user in self.users if user.id == numeric_id),
            None
        )
