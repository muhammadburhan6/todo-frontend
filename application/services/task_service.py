from application.dtos.task_dto import CreateTaskInput, UpdateTaskInput
from domain.entities.task import Task


class TaskService:
    """Task use cases; storage details stay behind the repository contract."""

    def __init__(self, task_repository):
        self.task_repository = task_repository

    def create_task(self, data: CreateTaskInput):
        if not data.user_id:
            raise ValueError("Task must belong to a logged-in user")
        task = Task(None, data.title, user_id=data.user_id)
        return self.task_repository.create(task)

    def get_tasks(self, user_id):
        return self.task_repository.get_all(user_id=user_id)

    def get_task(self, task_id, user_id):
        return self.task_repository.get_by_id(task_id, user_id=user_id)

    def update_task(self, data: UpdateTaskInput):
        task = self.task_repository.get_by_id(data.task_id, user_id=data.user_id)
        if task is None:
            return None
        task.update(title=data.title, completed=data.completed)
        return self.task_repository.update(data.task_id, task, user_id=data.user_id)

    def delete_task(self, task_id, user_id):
        return self.task_repository.delete(task_id, user_id=user_id)
