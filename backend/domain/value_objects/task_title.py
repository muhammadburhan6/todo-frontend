class InvalidTaskTitleError(ValueError):
    """Task title business-rule violation."""


class TaskTitle:
    """Trim and validate a title before it enters the domain."""

    def __init__(self, value):
        if not isinstance(value, str):
            raise InvalidTaskTitleError("Title must be text")

        value = value.strip()
        if not value:
            raise InvalidTaskTitleError("Title is required")
        if len(value) > 120:
            raise InvalidTaskTitleError("Title cannot exceed 120 characters")

        self.value = value
