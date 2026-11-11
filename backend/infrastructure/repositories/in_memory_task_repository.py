

class InMemoryTaskRepository:

    def __init__(self):
        self.tasks = []
        self.next_id = 1

    def create(self, task):
        if task.user_id is None:
            raise ValueError("Task must be associated with a valid user_id")
        task.id = self.next_id
        self.next_id += 1
        self.tasks.append(task)
        return task

    def get_all(self, user_id=None):
        if user_id is None:
            return []
        return [t for t in self.tasks if t.user_id == user_id]

    def get_by_id(self, task_id, user_id=None):
        if user_id is None:
            return None
        task_id = self._parse_task_id(task_id)
        if task_id is None:
            return None
        for task in self.tasks:
            if task.id == task_id and task.user_id == user_id:
                return task
        return None

    def update(self, task_id, new_task, user_id=None):
        if user_id is None:
            return None
        task_id = self._parse_task_id(task_id)
        if task_id is None:
            return None
        for i in range(len(self.tasks)):
            if self.tasks[i].id == task_id and self.tasks[i].user_id == user_id:
                new_task.id = task_id
                new_task.user_id = user_id
                self.tasks[i] = new_task
                return new_task
        return None

    def delete(self, task_id, user_id=None):
        if user_id is None:
            return False
        task_id = self._parse_task_id(task_id)
        if task_id is None:
            return False
        for i in range(len(self.tasks)):
            if self.tasks[i].id == task_id and self.tasks[i].user_id == user_id:
                self.tasks.pop(i)
                return True
        return False

    @staticmethod
    def _parse_task_id(task_id):
        try:
            numeric_id = int(task_id)
        except (TypeError, ValueError):
            return None
        return numeric_id if numeric_id > 0 else None
