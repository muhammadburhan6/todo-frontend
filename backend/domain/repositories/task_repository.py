from abc import ABC, abstractmethod

from domain.entities.task import Task


class TaskRepository(ABC):
    """Domain contract; adapters decide how tasks are stored."""

    @abstractmethod
    def create(self, task: Task) -> Task:
        """Save a new task and return it with its assigned ID."""
        raise NotImplementedError

    @abstractmethod
    def get_all(self, user_id=None) -> list[Task]:
        """Return only tasks owned by the requested user."""
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, task_id, user_id=None) -> Task | None:
        raise NotImplementedError

    @abstractmethod
    def update(self, task_id, task: Task, user_id=None) -> Task | None:
        raise NotImplementedError

    @abstractmethod
    def delete(self, task_id, user_id=None) -> bool:
        raise NotImplementedError
