from domain.value_objects.task_title import TaskTitle


class Task:
    """Task entity: keeps task data and applies task update rules."""

    def __init__(self, task_id, title, completed=False, user_id=None):
        self.id = task_id
        self.title = TaskTitle(title).value
        self.completed = self._validate_completed(completed)
        self.user_id = user_id

    @staticmethod
    def _validate_completed(completed):
        if not isinstance(completed, bool):
            raise ValueError("completed must be true or false")
        return completed

    def update(self, title=None, completed=None):
        """Apply only provided changes and keep domain values valid."""
        if title is not None:
            self.title = TaskTitle(title).value
        if completed is not None:
            self.completed = self._validate_completed(completed)
        return self
