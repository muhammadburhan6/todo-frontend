from dataclasses import dataclass


# Application inputs carry validated request data into the use case layer.
@dataclass(frozen=True)
class CreateTaskInput:
    title: str
    user_id: int | str


@dataclass(frozen=True)
class UpdateTaskInput:
    task_id: int | str
    user_id: int | str
    title: str | None = None
    completed: bool | None = None
