from abc import ABC, abstractmethod

from domain.entities.user import User


class UserRepository(ABC):
    """Domain contract implemented by MongoDB and memory adapters."""

    @abstractmethod
    def create(self, user: User) -> User:
        raise NotImplementedError

    @abstractmethod
    def get_by_email(self, email: str) -> User | None:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, user_id) -> User | None:
        raise NotImplementedError
