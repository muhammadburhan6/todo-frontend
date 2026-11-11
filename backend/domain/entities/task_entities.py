class InvalidTaskTitleError(ValueError):
    """Raised when a task title violates a domain rule."""


class Task:
    """Task entity with validation for its own fields."""

    def __init__(self, task_id, title, completed=False, user_id=None):
        self.id = task_id
        self.title = self._normalize_title(title)
        self.completed = self._validate_completed(completed)
        self.user_id = user_id

    @staticmethod
    def _normalize_title(value):
        if not isinstance(value, str):
            raise InvalidTaskTitleError("Title must be text")
        value = value.strip()
        if not value:
            raise InvalidTaskTitleError("Title is required")
        if len(value) > 120:
            raise InvalidTaskTitleError("Title cannot exceed 120 characters")
        return value

    @staticmethod
    def _validate_completed(completed):
        if not isinstance(completed, bool):
            raise ValueError("completed must be true or false")
        return completed

    def update(self, title=None, completed=None):
        """Apply provided changes while preserving valid task values."""
        if title is not None:
            self.title = self._normalize_title(title)
        if completed is not None:
            self.completed = self._validate_completed(completed)
        return self
