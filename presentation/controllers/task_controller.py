from flask import g, jsonify, request

from application.dtos.task_dto import CreateTaskInput, UpdateTaskInput


class TaskController:
    """HTTP adapter: validate request shape and format responses."""

    def __init__(self, task_service):
        self.task_service = task_service

    @staticmethod
    def _user_id():
        user = getattr(g, "current_user", None)
        return getattr(user, "id", None)

    @staticmethod
    def _json(task):
        return {
            "id": task.id,
            "title": task.title,
            "completed": task.completed,
            "user_id": task.user_id,
        }

    @staticmethod
    def _body():
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return None, (jsonify({"message": "JSON object required"}), 400)
        return data, None

    def create_task(self):
        user_id = self._user_id()
        if user_id is None:
            return jsonify({"message": "Unauthorized: Please login"}), 401
        data, error = self._body()
        if error:
            return error
        try:
            task = self.task_service.create_task(
                CreateTaskInput(data.get("title"), user_id)
            )
            return jsonify(self._json(task)), 201
        except ValueError as exc:
            return jsonify({"message": str(exc)}), 400

    def get_tasks(self):
        user_id = self._user_id()
        if user_id is None:
            return jsonify({"message": "Unauthorized: Please login"}), 401
        return jsonify([self._json(task) for task in self.task_service.get_tasks(user_id)])

    def get_task(self, task_id):
        user_id = self._user_id()
        if user_id is None:
            return jsonify({"message": "Unauthorized: Please login"}), 401
        task = self.task_service.get_task(task_id, user_id)
        if task is None:
            return jsonify({"message": "Task not found"}), 404
        return jsonify(self._json(task))

    def update_task(self, task_id):
        user_id = self._user_id()
        if user_id is None:
            return jsonify({"message": "Unauthorized: Please login"}), 401
        data, error = self._body()
        if error:
            return error
        if "title" not in data or "completed" not in data:
            return jsonify({"message": "PUT requires both title and completed"}), 400
        if not isinstance(data["completed"], bool):
            return jsonify({"message": "completed must be true or false"}), 400
        return self._update(task_id, user_id, data)

    def patch_task(self, task_id):
        user_id = self._user_id()
        if user_id is None:
            return jsonify({"message": "Unauthorized: Please login"}), 401
        data, error = self._body()
        if error:
            return error
        if not data or not set(data).intersection({"title", "completed"}):
            return jsonify({"message": "Provide title or completed to update"}), 400
        if "completed" in data and not isinstance(data["completed"], bool):
            return jsonify({"message": "completed must be true or false"}), 400
        return self._update(task_id, user_id, data)

    def _update(self, task_id, user_id, data):
        try:
            task = self.task_service.update_task(UpdateTaskInput(
                task_id=task_id,
                user_id=user_id,
                title=data.get("title"),
                completed=data.get("completed"),
            ))
        except ValueError as exc:
            return jsonify({"message": str(exc)}), 400
        if task is None:
            return jsonify({"message": "Task not found"}), 404
        return jsonify(self._json(task))

    def delete_task(self, task_id):
        user_id = self._user_id()
        if user_id is None:
            return jsonify({"message": "Unauthorized: Please login"}), 401
        if not self.task_service.delete_task(task_id, user_id):
            return jsonify({"message": "Task not found"}), 404
        return jsonify({"message": "Task deleted successfully"})
